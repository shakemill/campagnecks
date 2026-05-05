import { FilePlus2 } from "lucide-react";

import { ScreeningForm } from "@/components/medical/ScreeningForm";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth/require-role";
import { getStorageAdapter } from "@/lib/storage/storage-adapter";

export default async function NewScreeningPage() {
  const session = await requireRole(["MEDECIN", "INFIRMIER_TECH"]);
  const state = await getStorageAdapter().readState();
  const activeCampaigns = state.campaigns.filter((item) => item.status === "ACTIVE");
  const latestCampaign = activeCampaigns.at(-1);

  if (!latestCampaign) {
    return (
      <AlertBanner
        type="warning"
        message="Aucune campagne active. Le médecin doit créer ou rouvrir une campagne avant la saisie."
      />
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        icon={FilePlus2}
        title="Nouvelle fiche de dépistage"
        subtitle={`Campagne par défaut : ${latestCampaign.name}`}
      />
      <ScreeningForm
        role={session.user.role}
        campaignId={latestCampaign.id}
        campaigns={activeCampaigns}
      />
    </div>
  );
}
