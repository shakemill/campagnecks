import { StatusBadge } from "@/components/data/StatusBadge";

type PatientHeaderProps = {
  fullName: string;
  age: number;
  bloodPressure: string;
  status: "ACTIF" | "INACTIF" | "EN_ATTENTE" | "URGENT";
};

export function PatientHeader({ fullName, age, bloodPressure, status }: PatientHeaderProps) {
  return (
    <section className="soft-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-heading text-xl font-semibold text-brand-gray">{fullName}</h2>
          <p className="text-sm text-muted-foreground">
            {age} ans · PA actuelle: {bloodPressure}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>
    </section>
  );
}
