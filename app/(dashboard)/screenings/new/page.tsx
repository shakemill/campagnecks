import { FilePlus2 } from "lucide-react";

import { ScreeningForm } from "@/components/medical/ScreeningForm";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth/require-role";
import { getStorageAdapter } from "@/lib/storage/storage-adapter";

export default async function NewScreeningPage() {
  const session = await requireRole(["MEDECIN", "INFIRMIER_TECH"]);
  const state = await getStorageAdapter().readState();
  const latestCampaign = state.campaigns.at(-1);

  if (!latestCampaign) {
    return (
      <AlertBanner type="warning" message="Creez d'abord une campagne avant de saisir une fiche." />
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        icon={FilePlus2}
        title="Nouvelle fiche de depistage"
        subtitle={`Campagne: ${latestCampaign.name}`}
      />
      <ScreeningForm role={session.user.role} campaignId={latestCampaign.id} />
    </div>
  );
}
