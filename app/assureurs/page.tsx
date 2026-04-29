import { requireRole } from "@/lib/auth/require-role";

export default async function AssureursPage() {
  await requireRole(["MEDECIN", "INFIRMIER_TECH"]);
  return <div className="p-6 text-sm text-muted-foreground">Module assureurs en preparation.</div>;
}
