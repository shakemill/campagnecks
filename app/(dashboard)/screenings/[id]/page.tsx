import { ArrowLeft, Download, Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ScreeningView } from "@/components/medical/ScreeningView";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/auth/require-role";
import { getStorageAdapter } from "@/lib/storage/storage-adapter";

type Params = {
  params: Promise<{ id: string }>;
};

export default async function ScreeningDetailPage({ params }: Params) {
  const session = await requireRole(["MEDECIN", "INFIRMIER_TECH"]);
  const { id } = await params;
  const state = await getStorageAdapter().readState();
  const record = state.screenings.find((item) => item.id === id);

  if (!record) {
    notFound();
  }

  const canEdit = session.user.role === "MEDECIN";

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Eye}
        title={`Fiche ${record.registrationNumber}`}
        subtitle={`Patient: ${record.patient.fullName}`}
        actions={
          <>
            <Link
              href="/screenings"
              className="inline-flex items-center gap-1.5 rounded-md border bg-white px-3 py-2 text-sm font-medium text-brand-gray transition-all duration-200 ease-in-out hover:bg-surface-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
            {record.reportBlobUrl ? (
              <a
                href={`/api/reports/${record.id}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-brand-green px-3 py-2 text-sm font-medium text-white transition-all duration-200 ease-in-out hover:opacity-90"
              >
                <Download className="h-4 w-4" />
                Telecharger PDF
              </a>
            ) : null}
            {canEdit ? (
              <Link
                href={`/screenings/${record.id}/edit`}
                className="inline-flex items-center gap-1.5 rounded-md bg-brand-pink px-3 py-2 text-sm font-medium text-white transition-all duration-200 ease-in-out hover:bg-[#b8307a]"
              >
                <Pencil className="h-4 w-4" />
                Modifier
              </Link>
            ) : null}
          </>
        }
      />
      <ScreeningView record={record} />
    </div>
  );
}
