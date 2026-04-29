import { FeuilleCirculation } from "@/components/medical/FeuilleCirculation";
import { requireRole } from "@/lib/auth/require-role";

export default async function FeuilleCirculationPage() {
  await requireRole(["MEDECIN", "INFIRMIER_TECH"]);
  return (
    <div className="p-6">
      <FeuilleCirculation
        steps={[
          { label: "Accueil", done: true },
          { label: "Medecin", done: false },
          { label: "Pharmacie", done: false },
          { label: "Caisse", done: false },
        ]}
      />
    </div>
  );
}
