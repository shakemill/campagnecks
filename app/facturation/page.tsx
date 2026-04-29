import { FacturePreview } from "@/components/medical/FacturePreview";
import { requireRole } from "@/lib/auth/require-role";

export default async function FacturationPage() {
  await requireRole(["MEDECIN", "INFIRMIER_TECH"]);
  return (
    <div className="p-6">
      <FacturePreview total={15000} assureurPart={5000} />
    </div>
  );
}
