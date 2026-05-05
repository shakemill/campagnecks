import { FileSearch } from "lucide-react";

type EmptyStateProps = {
  entity: string;
};

export function EmptyState({ entity }: EmptyStateProps) {
  return (
    <div className="soft-card flex flex-col items-center justify-center px-6 py-12 text-center">
      <FileSearch className="h-8 w-8 text-muted-foreground" />
      <h3 className="mt-3 font-heading text-lg font-semibold text-brand-gray">Aucune donnée</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Commencez par ajouter un élément dans la section {entity}.
      </p>
    </div>
  );
}
