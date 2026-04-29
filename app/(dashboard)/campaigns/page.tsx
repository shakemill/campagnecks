import { CalendarRange, ClipboardList, ListChecks, UserPlus } from "lucide-react";

import { CampaignForm, DeleteCampaignButton } from "@/components/campaign/CampaignForm";
import { CampaignUserForm } from "@/components/campaign/CampaignUserForm";
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
  const latestCampaign = state.campaigns.at(-1);
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

      {latestCampaign ? (
        <DataCard
          title="Creation des comptes d'acces"
          icon={UserPlus}
          description="Mots de passe temporaires envoyes par email"
        >
          {isDoctor ? (
            <CampaignUserForm campaignId={latestCampaign.id} />
          ) : (
            <p className="text-sm text-muted-foreground">Lecture seule pour ce role.</p>
          )}
        </DataCard>
      ) : null}

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
                <DeleteCampaignButton campaignId={campaign.id} campaignName={campaign.name} />
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
