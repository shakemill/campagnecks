import { NextResponse } from "next/server";

import { requireApiRole } from "@/lib/auth/api-guard";
import { generatePatientReportPdf } from "@/lib/pdf/generate-patient-report";
import { getStorageAdapter } from "@/lib/storage/storage-adapter";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: Params) {
  const guard = await requireApiRole(["MEDECIN", "INFIRMIER_TECH"]);
  if (guard.response) {
    return guard.response;
  }

  const { id } = await context.params;
  const state = await getStorageAdapter().readState();
  const screening = state.screenings.find((item) => item.id === id);
  if (!screening?.reportBlobUrl) {
    return NextResponse.json({ message: "Rapport non disponible" }, { status: 404 });
  }

  if (screening.reportBlobUrl.startsWith("local://")) {
    const bytes = await generatePatientReportPdf(screening);
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=\"fiche-${screening.registrationNumber}.pdf\"`,
      },
    });
  }

  return NextResponse.redirect(screening.reportBlobUrl);
}
