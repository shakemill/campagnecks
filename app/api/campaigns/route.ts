import { NextRequest, NextResponse } from "next/server";

import { requireApiRole } from "@/lib/auth/api-guard";
import { logAuditEvent } from "@/lib/audit/audit-log";
import { campaignSchema } from "@/lib/schemas/campaign";
import { getStorageAdapter } from "@/lib/storage/storage-adapter";
import { generateId } from "@/lib/utils/id";

export async function GET() {
  const guard = await requireApiRole(["MEDECIN", "INFIRMIER_TECH"]);
  if (guard.response) {
    return guard.response;
  }

  const state = await getStorageAdapter().readState();
  return NextResponse.json(state.campaigns);
}

export async function POST(request: NextRequest) {
  const guard = await requireApiRole(["MEDECIN"]);
  if (guard.response) {
    return guard.response;
  }

  const raw = await request.json();
  const parsed = campaignSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  const created = {
    id: generateId("camp"),
    name: parsed.data.name,
    startsAt: parsed.data.startsAt,
    endsAt: parsed.data.endsAt,
    status: "ACTIVE" as const,
    createdAt: new Date().toISOString(),
    createdByUserId: guard.session.user.id,
  };

  await getStorageAdapter().patchState((draft) => {
    draft.campaigns.push(created);
  });

  await logAuditEvent({
    actorUserId: guard.session.user.id,
    action: "CREATE_CAMPAIGN",
    targetType: "CAMPAIGN",
    targetId: created.id,
  });

  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const guard = await requireApiRole(["MEDECIN"]);
  if (guard.response) {
    return guard.response;
  }

  const campaignId = request.nextUrl.searchParams.get("id")?.trim();
  if (!campaignId) {
    return NextResponse.json({ message: "Identifiant campagne requis." }, { status: 400 });
  }

  const storage = getStorageAdapter();
  const state = await storage.readState();
  const campaign = state.campaigns.find((item) => item.id === campaignId);
  if (!campaign) {
    return NextResponse.json({ message: "Campagne introuvable." }, { status: 404 });
  }

  const hasLinkedScreenings = state.screenings.some((item) => item.campaignId === campaignId);
  if (hasLinkedScreenings) {
    return NextResponse.json(
      {
        message:
          "Suppression impossible : cette campagne contient déjà des fiches de dépistage liées.",
      },
      { status: 409 },
    );
  }

  await storage.patchState((draft) => {
    draft.campaigns = draft.campaigns.filter((item) => item.id !== campaignId);
    draft.campaignUsers = draft.campaignUsers.filter((item) => item.campaignId !== campaignId);
  });

  await logAuditEvent({
    actorUserId: guard.session.user.id,
    action: "DELETE_CAMPAIGN",
    targetType: "CAMPAIGN",
    targetId: campaignId,
  });

  return NextResponse.json({ id: campaignId, deleted: true });
}

export async function PATCH(request: NextRequest) {
  const guard = await requireApiRole(["MEDECIN"]);
  if (guard.response) {
    return guard.response;
  }

  const campaignId = request.nextUrl.searchParams.get("id")?.trim();
  const action = request.nextUrl.searchParams.get("action")?.trim();
  if (!campaignId || !action) {
    return NextResponse.json({ message: "Identifiant campagne et action requis." }, { status: 400 });
  }
  if (action !== "close") {
    return NextResponse.json({ message: "Action non supportee." }, { status: 400 });
  }

  const storage = getStorageAdapter();
  const state = await storage.readState();
  const campaign = state.campaigns.find((item) => item.id === campaignId);
  if (!campaign) {
    return NextResponse.json({ message: "Campagne introuvable." }, { status: 404 });
  }
  if (campaign.status === "ARCHIVED") {
    return NextResponse.json({ message: "Cette campagne est déjà clôturée." }, { status: 409 });
  }

  await storage.patchState((draft) => {
    const index = draft.campaigns.findIndex((item) => item.id === campaignId);
    if (index >= 0) {
      draft.campaigns[index] = { ...draft.campaigns[index], status: "ARCHIVED" };
    }
  });

  await logAuditEvent({
    actorUserId: guard.session.user.id,
    action: "CLOSE_CAMPAIGN",
    targetType: "CAMPAIGN",
    targetId: campaignId,
  });

  return NextResponse.json({ id: campaignId, status: "ARCHIVED" });
}
