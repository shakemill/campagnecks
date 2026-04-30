import { describe, expect, it } from "vitest";

import {
  averageBloodPressure,
  buildVitalsGuidance,
  classifyBloodPressure,
  classifyBmi,
  classifyFastingGlucoseGPerL,
  classifyWaist,
} from "@/lib/medical/vitals-guidance";
import type { ScreeningRecord } from "@/lib/types/domain";

const emptyVitals = (): ScreeningRecord["vitalsBiology"] => ({
  bloodPressureRight: { systolic: Number.NaN, diastolic: Number.NaN },
  bloodPressureLeft: { systolic: Number.NaN, diastolic: Number.NaN },
  weightKg: Number.NaN,
  heightCm: Number.NaN,
  bmi: Number.NaN,
  waistCm: Number.NaN,
  fastingGlucoseGl: Number.NaN,
});

describe("averageBloodPressure", () => {
  it("retourne la moyenne des 4 valeurs lorsque toutes sont finies", () => {
    expect(
      averageBloodPressure(
        { systolic: 120, diastolic: 80 },
        { systolic: 124, diastolic: 82 },
      ),
    ).toEqual({ systolic: 122, diastolic: 81 });
  });

  it("retourne null si une valeur manque", () => {
    expect(
      averageBloodPressure(
        { systolic: 120, diastolic: 80 },
        { systolic: Number.NaN, diastolic: 82 },
      ),
    ).toBeNull();
  });
});

describe("classifyBloodPressure", () => {
  it("optimale pour PAS/PAD sous les seuils", () => {
    const r = classifyBloodPressure(118, 78);
    expect(r.classification).toContain("optimale");
  });

  it("HTA systolique isolee pour 150/85", () => {
    const r = classifyBloodPressure(150, 85);
    expect(r.classification).toContain("isolee");
  });

  it("signale une classification indeterminee pour une zone grise", () => {
    const r = classifyBloodPressure(175, 95);
    expect(r.classification).toContain("indeterminee");
  });
});

describe("classifyBmi", () => {
  it("surpoids pour IMC dans la plage 25–29,9", () => {
    expect(classifyBmi(27.5).weightStatus).toBe("Surpoids");
  });
});

describe("classifyWaist", () => {
  it("homme 95 cm : seuil augmente", () => {
    const r = classifyWaist(95, "M");
    expect(r.thresholdLabel).toContain("94–101");
  });
});

describe("classifyFastingGlucoseGPerL", () => {
  it("1,15 g/L : hyperglycemie a jeun / prediabete", () => {
    const r = classifyFastingGlucoseGPerL(1.15);
    expect(r.status).toContain("prediabete");
  });
});

describe("buildVitalsGuidance", () => {
  it("retourne undefined sans aucune mesure exploitable", () => {
    expect(
      buildVitalsGuidance({
        patient: { sex: "M" } as ScreeningRecord["patient"],
        vitalsBiology: emptyVitals(),
      }),
    ).toBeUndefined();
  });

  it("inclut la glycemie seule lorsque les autres mesures sont absentes", () => {
    const v = emptyVitals();
    v.fastingGlucoseGl = 1.0;
    const g = buildVitalsGuidance({
      patient: { sex: "F" } as ScreeningRecord["patient"],
      vitalsBiology: v,
    });
    expect(g?.glucose?.status).toContain("Normoglycemie");
    expect(g?.bloodPressureAvg).toBeUndefined();
  });
});
