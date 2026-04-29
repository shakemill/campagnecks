import { ClipboardList, Info, LayoutDashboard, Stethoscope, Users } from "lucide-react";

import { DataCard } from "@/components/ui/DataCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { requireRole } from "@/lib/auth/require-role";
import { getStorageAdapter } from "@/lib/storage/storage-adapter";

export default async function AdminPage() {
  await requireRole(["MEDECIN", "INFIRMIER_TECH"]);
  const state = await getStorageAdapter().readState();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        title="Tableau de bord"
        subtitle="Vue d'ensemble de la campagne en cours"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Campagnes"
          value={String(state.campaigns.length)}
          trendPercent={4}
          icon={ClipboardList}
        />
        <StatCard
          title="Comptes actifs"
          value={String(state.campaignUsers.filter((u) => u.isActive).length)}
          trendPercent={3}
          icon={Users}
        />
        <StatCard
          title="Fiches depistage"
          value={String(state.screenings.length)}
          trendPercent={8}
          icon={Stethoscope}
        />
      </div>

      <DataCard title="Vue d'ensemble" icon={Info}>
        <p className="text-sm text-muted-foreground">
          Plateforme de digitalisation des depistages MCV pour Plenitude Clinique Kouam Samuel.
        </p>
      </DataCard>
    </div>
  );
}
