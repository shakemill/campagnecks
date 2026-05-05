import { NextRequest, NextResponse } from "next/server";

import { requireApiRole } from "@/lib/auth/api-guard";
import { logAuditEvent } from "@/lib/audit/audit-log";
import { generatePatientReportPdf } from "@/lib/pdf/generate-patient-report";
import { publishReportPdf } from "@/lib/pdf/publish-report";
import { getStorageAdapter } from "@/lib/storage/storage-adapter";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, context: Params) {
  const guard = await requireApiRole(["MEDECIN"]);
  if (guard.response) {
    return guard.response;
  }

  try {
    const { id } = await context.params;
    const storage = getStorageAdapter();
    const state = await storage.readState();
    const record = state.screenings.find((item) => item.id === id);
    if (!record) {
      return NextResponse.json(
        {
          message:
            "Fiche introuvable au moment de la validation. Vérifiez la configuration BLOB_READ_WRITE_TOKEN sur Vercel.",
        },
        { status: 404 },
      );
    }
    const actor = state.campaignUsers.find((item) => item.id === guard.session.user.id);
    const doctorFullName = actor
      ? `${actor.firstName} ${actor.lastName}`.trim()
      : (guard.session.user.name ?? "").trim();

    const validatedAt = new Date().toISOString();
    const qrPayload = `${record.id}|${record.registrationNumber}|${validatedAt}`;
    const candidate = {
      ...record,
      validatedAt,
      validatedByDoctorUserId: guard.session.user.id,
      qrPayload,
      staffIdentity: {
        ...record.staffIdentity,
        doctorName: doctorFullName || record.staffIdentity.doctorName,
      },
    };
    const pdf = await generatePatientReportPdf(candidate);
    const reportBlobUrl = await publishReportPdf(record.id, pdf);

    await storage.patchState((draft) => {
      const index = draft.screenings.findIndex((item) => item.id === id);
      if (index >= 0) {
        draft.screenings[index] = { ...candidate, reportBlobUrl };
      }
    });

    await logAuditEvent({
      actorUserId: guard.session.user.id,
      action: "VALIDATE_SCREENING",
      targetType: "SCREENING",
      targetId: id,
    });

    return NextResponse.json({ id, reportBlobUrl, validatedAt });
  } catch (error) {
    console.error("Screening validation failed", error);
    return NextResponse.json(
      {
        message:
          "Validation impossible côté serveur. Vérifiez les logs Vercel et la configuration Blob (BLOB_READ_WRITE_TOKEN).",
      },
      { status: 500 },
    );
  }
}
