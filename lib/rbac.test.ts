import { canEditSection, canValidateRecord } from "@/lib/rbac";

describe("rbac", () => {
  it("allows medecin to edit all sections", () => {
    expect(canEditSection("MEDECIN", "CONSEILS_HYGIENO_DIET")).toBe(true);
  });

  it("restricts infirmier to specific sections", () => {
    expect(canEditSection("INFIRMIER_TECH", "IDENTIFICATION_PATIENT")).toBe(true);
    expect(canEditSection("INFIRMIER_TECH", "ORIENTATION_DECISION")).toBe(false);
  });

  it("allows only medecin for validation", () => {
    expect(canValidateRecord("MEDECIN")).toBe(true);
    expect(canValidateRecord("INFIRMIER_TECH")).toBe(false);
  });
});
