import { Stethoscope } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { ScreeningForm } from "@/components/medical/ScreeningForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth/require-role";
import { getStorageAdapter } from "@/lib/storage/storage-adapter";

type Params = {
  params: Promise<{ id: string }>;
};

export default async function EditScreeningPage({ params }: Params) {
  const session = await requireRole(["MEDECIN"]);
  const { id } = await params;
  const state = await getStorageAdapter().readState();
  const record = state.screenings.find((item) => item.id === id);

  if (!record) {
    notFound();
  }
  if (session.user.role !== "MEDECIN") {
    redirect(`/screenings/${id}`);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Stethoscope}
        title={`Modifier la fiche ${record.registrationNumber}`}
        subtitle={`Patient: ${record.patient.fullName}`}
      />
      <ScreeningForm
        role={session.user.role}
        campaignId={record.campaignId}
        screeningId={record.id}
        initialRecord={record}
      />
    </div>
  );
}
