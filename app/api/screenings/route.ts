import { NextRequest, NextResponse } from "next/server";

import { requireApiRole } from "@/lib/auth/api-guard";
import { logAuditEvent } from "@/lib/audit/audit-log";
import { screeningFormSchema } from "@/lib/schemas/screening-form";
import { defaultChecklist } from "@/lib/screenings/defaults";
import { buildVitalsGuidance } from "@/lib/medical/vitals-guidance";
import { mergeRecordByRole } from "@/lib/screenings/merge-by-role";
import { getStorageAdapter } from "@/lib/storage/storage-adapter";
import { generateId, generateRegistrationNumber } from "@/lib/utils/id";

export async function GET() {
  const guard = await requireApiRole(["MEDECIN", "INFIRMIER_TECH"]);
  if (guard.response) {
    return guard.response;
  }

  const state = await getStorageAdapter().readState();
  return NextResponse.json(state.screenings);
}

export async function POST(request: NextRequest) {
  const guard = await requireApiRole(["MEDECIN", "INFIRMIER_TECH"]);
  if (guard.response) {
    return guard.response;
  }

  const raw = await request.json();
  const parsed = screeningFormSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  const storage = getStorageAdapter();
  const state = await storage.readState();
  const existing = state.screenings.find((item) => item.id === raw.id) ?? null;
  const selectedCampaign = state.campaigns.find((item) => item.id === parsed.data.campaignId);
  if (!selectedCampaign) {
    return NextResponse.json({ message: "Campagne introuvable." }, { status: 400 });
  }
  if (!existing && selectedCampaign.status !== "ACTIVE") {
    return NextResponse.json(
      { message: "Creation impossible: la campagne selectionnee est cloturee." },
      { status: 409 },
    );
  }
  if (existing && existing.campaignId !== parsed.data.campaignId) {
    return NextResponse.json(
      { message: "Modification impossible: la campagne de la fiche ne peut pas etre changee." },
      { status: 409 },
    );
  }
  const sequence = state.screenings.length + 1;
  const now = new Date().toISOString();
  const actor = state.campaignUsers.find((item) => item.id === guard.session.user.id);
  const actorFullName = actor
    ? `${actor.firstName} ${actor.lastName}`.trim()
    : (guard.session.user.name ?? "").trim();
  const resolvedNurseName =
    parsed.data.staffIdentity.nurseName?.trim() ||
    existing?.staffIdentity.nurseName?.trim() ||
    (guard.session.user.role === "INFIRMIER_TECH" ? actorFullName : "");
  const resolvedDoctorName =
    parsed.data.staffIdentity.doctorName?.trim() || existing?.staffIdentity.doctorName?.trim() || "";

  const incoming = {
    id: existing?.id ?? generateId("scr"),
    registrationNumber:
      existing?.registrationNumber ?? generateRegistrationNumber(new Date().getFullYear(), sequence),
    createdByUserId: existing?.createdByUserId ?? guard.session.user.id,
    updatedByUserId: guard.session.user.id,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    validatedAt: existing?.validatedAt,
    validatedByDoctorUserId: existing?.validatedByDoctorUserId,
    reportBlobUrl: existing?.reportBlobUrl,
    qrPayload: existing?.qrPayload,
    ...parsed.data,
    staffIdentity: {
      nurseName: resolvedNurseName,
      doctorName: resolvedDoctorName,
    },
    hygienoDietAdvice: parsed.data.hygienoDietAdvice ?? defaultChecklist,
  };

  const merged = mergeRecordByRole(guard.session.user.role, existing, incoming);
  const vitalsGuidance = buildVitalsGuidance(merged);
  const mergedWithGuidance = { ...merged, vitalsGuidance };

  await storage.patchState((draft) => {
    const index = draft.screenings.findIndex((item) => item.id === mergedWithGuidance.id);
    if (index >= 0) {
      draft.screenings[index] = mergedWithGuidance;
    } else {
      draft.screenings.push(mergedWithGuidance);
    }
  });

  await logAuditEvent({
    actorUserId: guard.session.user.id,
    action: existing ? "UPDATE_SCREENING" : "CREATE_SCREENING",
    targetType: "SCREENING",
    targetId: mergedWithGuidance.id,
  });

  return NextResponse.json(mergedWithGuidance, { status: existing ? 200 : 201 });
}
