import type { ScreeningRecord, UserRole } from "@/lib/types/domain";

export function mergeRecordByRole(
  role: UserRole,
  existing: ScreeningRecord | null,
  incoming: ScreeningRecord,
): ScreeningRecord {
  if (role === "MEDECIN" || !existing) {
    return incoming;
  }

  return {
    ...existing,
    patient: incoming.patient,
    vitalsBiology: incoming.vitalsBiology,
    updatedAt: incoming.updatedAt,
    updatedByUserId: incoming.updatedByUserId,
  };
}
