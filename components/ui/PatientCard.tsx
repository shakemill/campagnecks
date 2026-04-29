import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/data/StatusBadge";

type PatientCardProps = {
  fullName: string;
  age: number;
  phone: string;
  status: "ACTIF" | "EN_ATTENTE" | "URGENT";
};

export function PatientCard({ fullName, age, phone, status }: PatientCardProps) {
  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Card className="rounded-xl border shadow-soft-card">
      <CardContent className="flex items-center justify-between pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-muted font-semibold text-brand-gray">
            {initials}
          </div>
          <div>
            <p className="font-medium text-brand-gray">{fullName}</p>
            <p className="text-xs text-muted-foreground">
              {age} ans · {phone}
            </p>
          </div>
        </div>
        <StatusBadge status={status} />
      </CardContent>
    </Card>
  );
}
