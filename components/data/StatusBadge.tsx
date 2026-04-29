import { Badge } from "@/components/ui/badge";

type StatusValue = "ACTIF" | "INACTIF" | "EN_ATTENTE" | "URGENT";

type StatusBadgeProps = {
  status: StatusValue;
};

const styles: Record<StatusValue, string> = {
  ACTIF: "bg-brand-green text-white",
  INACTIF: "bg-zinc-500 text-white",
  EN_ATTENTE: "bg-amber-600 text-white",
  URGENT: "bg-red-600 text-white",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge className={styles[status]}>{status}</Badge>;
}
