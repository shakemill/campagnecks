import { ClipboardList, Info, LayoutDashboard, Stethoscope, Users } from "lucide-react";
import Link from "next/link";

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

      <DataCard title="Acces rapides" icon={LayoutDashboard} description="Liens directs vers les modules operatoires">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Link
            href="/campaigns"
            className="rounded-lg border bg-white p-3 text-sm font-medium text-brand-gray transition-all duration-200 ease-in-out hover:border-brand-pink hover:bg-surface-muted"
          >
            Gerer les campagnes
          </Link>
          <Link
            href="/screenings/new"
            className="rounded-lg border bg-white p-3 text-sm font-medium text-brand-gray transition-all duration-200 ease-in-out hover:border-brand-pink hover:bg-surface-muted"
          >
            Nouvelle fiche de depistage
          </Link>
          <Link
            href="/screenings"
            className="rounded-lg border bg-white p-3 text-sm font-medium text-brand-gray transition-all duration-200 ease-in-out hover:border-brand-pink hover:bg-surface-muted"
          >
            Historique des fiches
          </Link>
          <Link
            href="/patients"
            className="rounded-lg border bg-white p-3 text-sm font-medium text-brand-gray transition-all duration-200 ease-in-out hover:border-brand-pink hover:bg-surface-muted"
          >
            Module patients
          </Link>
          <Link
            href="/visites"
            className="rounded-lg border bg-white p-3 text-sm font-medium text-brand-gray transition-all duration-200 ease-in-out hover:border-brand-pink hover:bg-surface-muted"
          >
            Module visites
          </Link>
          <Link
            href="/facturation"
            className="rounded-lg border bg-white p-3 text-sm font-medium text-brand-gray transition-all duration-200 ease-in-out hover:border-brand-pink hover:bg-surface-muted"
          >
            Module facturation
          </Link>
        </div>
      </DataCard>
    </div>
  );
}
