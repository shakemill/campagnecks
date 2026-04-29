import type { UserRole } from "@/lib/types/domain";

export const EDITABLE_SECTIONS_BY_ROLE: Record<UserRole, string[]> = {
  INFIRMIER_TECH: ["IDENTIFICATION_PATIENT", "CONSTANTES_BIOLOGIE"],
  MEDECIN: ["*"],
};

export function canEditSection(role: UserRole, section: string): boolean {
  const permissions = EDITABLE_SECTIONS_BY_ROLE[role] ?? [];
  return permissions.includes("*") || permissions.includes(section);
}

export function canValidateRecord(role: UserRole): boolean {
  return role === "MEDECIN";
}
