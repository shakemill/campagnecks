import { ArrowRight, Clock, Download, Eye, FileText, Pencil, Stethoscope } from "lucide-react";
import Link from "next/link";

import { DataTable } from "@/components/data/DataTable";
import { EmptyState } from "@/components/data/EmptyState";
import { DataCard } from "@/components/ui/DataCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth/require-role";
import { getStorageAdapter } from "@/lib/storage/storage-adapter";
import { formatDateFr } from "@/lib/utils";

type ScreeningsPageProps = {
  searchParams: Promise<{ period?: string }>;
};

type PeriodFilter = "all" | "today" | "yesterday" | "last7" | "lastWeek" | "thisMonth";

const PERIOD_OPTIONS: Array<{ key: PeriodFilter; label: string }> = [
  { key: "today", label: "Aujourd'hui" },
  { key: "yesterday", label: "Hier" },
  { key: "last7", label: "7 derniers jours" },
  { key: "lastWeek", label: "Semaine passee" },
  { key: "thisMonth", label: "Ce mois" },
  { key: "all", label: "Tout" },
];

function toStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDateRange(period: PeriodFilter) {
  const now = new Date();
  const todayStart = toStartOfDay(now);

  if (period === "today") {
    return { start: todayStart, end: now };
  }

  if (period === "yesterday") {
    const start = new Date(todayStart);
    start.setDate(start.getDate() - 1);
    const end = new Date(todayStart);
    end.setMilliseconds(end.getMilliseconds() - 1);
    return { start, end };
  }

  if (period === "last7") {
    const start = new Date(todayStart);
    start.setDate(start.getDate() - 6);
    return { start, end: now };
  }

  if (period === "lastWeek") {
    const day = todayStart.getDay();
    const offsetToMonday = (day + 6) % 7;
    const thisWeekMonday = new Date(todayStart);
    thisWeekMonday.setDate(thisWeekMonday.getDate() - offsetToMonday);
    const start = new Date(thisWeekMonday);
    start.setDate(start.getDate() - 7);
    const end = new Date(thisWeekMonday);
    end.setMilliseconds(end.getMilliseconds() - 1);
    return { start, end };
  }

  if (period === "thisMonth") {
    const start = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
    return { start, end: now };
  }

  return null;
}

function matchesPeriod(dateValue: string, period: PeriodFilter) {
  if (period === "all") return true;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  const range = getDateRange(period);
  if (!range) return true;
  return date >= range.start && date <= range.end;
}

export default async function ScreeningsPage({ searchParams }: ScreeningsPageProps) {
  const params = await searchParams;
  const period = (params.period as PeriodFilter) ?? "all";
  const activePeriod: PeriodFilter = PERIOD_OPTIONS.some((option) => option.key === period) ? period : "all";

  const session = await requireRole(["MEDECIN", "INFIRMIER_TECH"]);
  const state = await getStorageAdapter().readState();
  const filteredScreenings = state.screenings.filter((item) => matchesPeriod(item.patient.date, activePeriod));
  const usersById = new Map(state.campaignUsers.map((item) => [item.id, item]));
  const canEdit = session.user.role === "MEDECIN";

  const rows = filteredScreenings.map((item) => {
    const isCompleted = Boolean(item.reportBlobUrl);
    return {
      registrationNumber: item.registrationNumber,
      patient: item.patient.fullName,
      date: formatDateFr(item.patient.date),
      risk: item.cardiovascularRisk.level ?? "N/A",
      status: isCompleted ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-green/10 px-2.5 py-0.5 text-xs font-medium text-brand-green">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
          Terminee
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
          <Clock className="h-3 w-3" />
          En attente
        </span>
      ),
      actions: (
        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            href={`/screenings/${item.id}`}
            className="inline-flex items-center gap-1 rounded-md border bg-white px-2.5 py-1.5 text-xs font-medium text-brand-gray transition-all duration-200 ease-in-out hover:bg-surface-muted"
          >
            <Eye className="h-3.5 w-3.5" />
            Consulter
          </Link>
          {canEdit ? (
            <Link
              href={`/screenings/${item.id}/edit`}
              className="inline-flex items-center gap-1 rounded-md bg-brand-pink px-2.5 py-1.5 text-xs font-medium text-white transition-all duration-200 ease-in-out hover:bg-[#b8307a]"
            >
              <Pencil className="h-3.5 w-3.5" />
              Modifier
            </Link>
          ) : null}
          {isCompleted ? (
            <a
              href={`/api/reports/${item.id}`}
              className="inline-flex items-center gap-1 rounded-md bg-brand-green px-2.5 py-1.5 text-xs font-medium text-white transition-all duration-200 ease-in-out hover:opacity-90"
            >
              <Download className="h-3.5 w-3.5" />
              PDF
            </a>
          ) : null}
        </div>
      ),
    };
  });
  const pendingForDoctor = filteredScreenings.filter((item) => {
    const creatorRole = usersById.get(item.createdByUserId)?.role;
    return !item.validatedAt && creatorRole === "INFIRMIER_TECH";
  });

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Stethoscope}
        title="Fiches de depistage"
        subtitle="Historique et suivi des fiches MCV"
        actions={
          <Link
            href="/screenings/new"
            className="inline-flex items-center gap-2 rounded-md bg-brand-pink px-4 py-2 text-sm font-medium text-white transition-all duration-200 ease-in-out hover:bg-[#b8307a]"
          >
            <FileText className="h-4 w-4" />
            Nouvelle fiche
          </Link>
        }
      />

      <DataCard
        title="Filtrer par periode"
        icon={Clock}
        description={`Resultats: ${filteredScreenings.length} fiche(s)`}
      >
        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map((option) => {
            const isActive = activePeriod === option.key;
            return (
              <Link
                key={option.key}
                href={option.key === "all" ? "/screenings" : `/screenings?period=${option.key}`}
                className={
                  isActive
                    ? "rounded-md bg-brand-pink px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 ease-in-out"
                    : "rounded-md border bg-white px-3 py-1.5 text-xs font-medium text-brand-gray transition-all duration-200 ease-in-out hover:bg-surface-muted"
                }
              >
                {option.label}
              </Link>
            );
          })}
        </div>
      </DataCard>

      {session.user.role === "MEDECIN" ? (
        <DataCard title="Fiches en attente de completion medicale" icon={Clock}>
          {pendingForDoctor.length ? (
            <div className="space-y-2">
              {pendingForDoctor.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-surface-muted/40 p-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-brand-gray">{item.patient.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.registrationNumber} · {formatDateFr(item.patient.date)}
                    </p>
                  </div>
                  <Link
                    href={`/screenings/${item.id}/edit`}
                    className="inline-flex items-center gap-1.5 rounded-md bg-brand-pink px-3 py-2 text-xs font-medium text-white transition-all duration-200 ease-in-out hover:bg-[#b8307a]"
                  >
                    Continuer le remplissage
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucune fiche en attente de completion medicale.
            </p>
          )}
        </DataCard>
      ) : null}

      <DataCard title="Historique des fiches" icon={FileText}>
        {rows.length ? (
          <DataTable
            columns={[
              { key: "registrationNumber", label: "N d'enregistrement" },
              { key: "patient", label: "Patient" },
              { key: "date", label: "Date" },
              { key: "risk", label: "Risque" },
              { key: "status", label: "Statut" },
              { key: "actions", label: "Actions" },
            ]}
            data={rows}
          />
        ) : (
          <EmptyState entity="fiches de depistage" />
        )}
      </DataCard>
    </div>
  );
}
