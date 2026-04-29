import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FilterBarProps = {
  status: string;
  onStatusChange: (value: string) => void;
};

export function FilterBar({ status, onStatusChange }: FilterBarProps) {
  return (
    <div className="soft-card flex flex-wrap gap-3 p-3">
      <Select
        value={status}
        onValueChange={(value) => {
          if (value) {
            onStatusChange(value);
          }
        }}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Filtrer par statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tous</SelectItem>
          <SelectItem value="ACTIVE">Actif</SelectItem>
          <SelectItem value="DRAFT">Brouillon</SelectItem>
          <SelectItem value="ARCHIVED">Archive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
