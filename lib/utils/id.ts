export function generateId(prefix: string): string {
  const random = crypto.randomUUID().slice(0, 8);
  return `${prefix}_${random}`;
}

export function generateRegistrationNumber(campaignYear: number, sequence: number): string {
  return `MCV-${campaignYear}-${String(sequence).padStart(4, "0")}`;
}
