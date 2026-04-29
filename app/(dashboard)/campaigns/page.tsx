import { CalendarRange, ClipboardList, ListChecks } from "lucide-react";

import { CampaignForm, CloseCampaignButton, DeleteCampaignButton } from "@/components/campaign/CampaignForm";
import { DataTable } from "@/components/data/DataTable";
import { EmptyState } from "@/components/data/EmptyState";
import { DataCard } from "@/components/ui/DataCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth/require-role";
import { getStorageAdapter } from "@/lib/storage/storage-adapter";
import { formatDateFr } from "@/lib/utils";

export default async function CampaignsPage() {
  const session = await requireRole(["MEDECIN", "INFIRMIER_TECH"]);
  const state = await getStorageAdapter().readState();
  const isDoctor = session.user.role === "MEDECIN";

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardList}
        title="Campagnes"
        subtitle="Gestion des campagnes et des comptes d'acces"
      />

      <DataCard
        title="Etape 1 - Creation d'une campagne"
        icon={CalendarRange}
        description="Definissez la periode et le libelle de la campagne"
      >
        {isDoctor ? (
          <CampaignForm />
        ) : (
          <p className="text-sm text-muted-foreground">Lecture seule pour ce role.</p>
        )}
      </DataCard>

      <DataCard title="Campagnes enregistrees" icon={ListChecks}>
        {state.campaigns.length ? (
          <DataTable
            columns={[
              { key: "name", label: "Nom" },
              { key: "startsAt", label: "Debut" },
              { key: "endsAt", label: "Fin" },
              { key: "status", label: "Statut" },
              ...(isDoctor ? [{ key: "actions" as const, label: "Actions" }] : []),
            ]}
            data={state.campaigns.map((campaign) => ({
              ...campaign,
              startsAt: formatDateFr(campaign.startsAt),
              endsAt: formatDateFr(campaign.endsAt),
              actions: isDoctor ? (
                <div className="flex flex-wrap gap-1.5">
                  <CloseCampaignButton
                    campaignId={campaign.id}
                    campaignName={campaign.name}
                    disabled={campaign.status === "ARCHIVED"}
                  />
                  <DeleteCampaignButton campaignId={campaign.id} campaignName={campaign.name} />
                </div>
              ) : undefined,
            }))}
          />
        ) : (
          <EmptyState entity="campagnes" />
        )}
      </DataCard>
    </div>
  );
}
