import { ListChecks, UserPlus, Users } from "lucide-react";

import { CampaignUserForm } from "@/components/campaign/CampaignUserForm";
import { DataTable } from "@/components/data/DataTable";
import { EmptyState } from "@/components/data/EmptyState";
import { DataCard } from "@/components/ui/DataCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth/require-role";
import { getStorageAdapter } from "@/lib/storage/storage-adapter";

export default async function UsersPage() {
  const session = await requireRole(["MEDECIN", "INFIRMIER_TECH"]);
  const state = await getStorageAdapter().readState();
  const isDoctor = session.user.role === "MEDECIN";
  const campaignsById = new Map(state.campaigns.map((campaign) => [campaign.id, campaign]));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Utilisateurs"
        subtitle="Comptes d'accès liés aux campagnes"
      />

      <DataCard
        title="Création des comptes d'accès"
        icon={UserPlus}
        description="Chaque compte doit être rattaché à une campagne active"
      >
        {isDoctor ? (
          <CampaignUserForm campaigns={state.campaigns} />
        ) : (
          <p className="text-sm text-muted-foreground">Lecture seule pour ce rôle.</p>
        )}
      </DataCard>

      <DataCard title="Comptes enregistrés" icon={ListChecks}>
        {state.campaignUsers.length ? (
          <DataTable
            columns={[
              { key: "name", label: "Nom complet" },
              { key: "email", label: "Email" },
              { key: "role", label: "Rôle" },
              { key: "campaign", label: "Campagne liée" },
              { key: "status", label: "Statut" },
            ]}
            data={state.campaignUsers.map((user) => ({
              name: `${user.title} ${user.firstName} ${user.lastName}`,
              email: user.email,
              role: user.role === "MEDECIN" ? "Médecin" : "Infirmier/Technicien",
              campaign: campaignsById.get(user.campaignId)?.name ?? "Campagne introuvable",
              status: user.isActive ? "Actif" : "Inactif",
            }))}
          />
        ) : (
          <EmptyState entity="utilisateurs" />
        )}
      </DataCard>
    </div>
  );
}
