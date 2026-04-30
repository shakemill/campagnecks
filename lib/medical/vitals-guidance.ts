import type { ScreeningRecord, VitalsGuidance } from "@/lib/types/domain";

/** Moyenne PAS/PAD — nécessite les 4 valeurs numériques finies (bras droit + gauche). */
export function averageBloodPressure(
  right: ScreeningRecord["vitalsBiology"]["bloodPressureRight"],
  left: ScreeningRecord["vitalsBiology"]["bloodPressureLeft"],
): { systolic: number; diastolic: number } | null {
  const values = [
    right.systolic,
    right.diastolic,
    left.systolic,
    left.diastolic,
  ] as const;
  if (!values.every((n) => typeof n === "number" && Number.isFinite(n))) {
    return null;
  }
  const [rs, rd, ls, ld] = values;
  return {
    systolic: Math.round(((rs + ls) / 2) * 10) / 10,
    diastolic: Math.round(((rd + ld) / 2) * 10) / 10,
  };
}

/**
 * Classification tensionnelle selon grille discrète type OMS (PAS/PAD combinées).
 *
 * Ordre d'évaluation (priorité décroissante) :
 * 1. HTA grade 3 — PAS ≥180 ET PAD ≥110
 * 2. HTA grade 2 — PAS 160–179 ET PAD 100–109
 * 3. HTA systolique isolée — PAS ≥140 ET PAD &lt;90 (avant grade 1 pour ne pas classer 150/85 en grade 1)
 * 4. HTA grade 1 — PAS 140–159 ET PAD 90–99
 * 5. Normale élevée — PAS 130–139 ET PAD 85–89
 * 6. Normale — PAS 120–129 ET PAD 80–84
 * 7. Optimale — PAS &lt;120 ET PAD &lt;80
 * 8. Sinon : indéterminé (zones entre classes)
 */
export function classifyBloodPressure(
  systolic: number,
  diastolic: number,
): Pick<
  NonNullable<VitalsGuidance["bloodPressureAvg"]>,
  "classification" | "cardiovascularRisk" | "action"
> {
  const sys = systolic;
  const dia = diastolic;

  if (sys >= 180 && dia >= 110) {
    return {
      classification: "Hypertension arterielle grade 3 (severe)",
      cardiovascularRisk: "Risque cardiovasculaire tres eleve",
      action:
        "Consultation medicale rapprochee ou urgente selon le contexte clinique ; bilan et traitement adapte.",
    };
  }
  if (sys >= 160 && sys <= 179 && dia >= 100 && dia <= 109) {
    return {
      classification: "Hypertension arterielle grade 2 (moderee)",
      cardiovascularRisk: "Risque cardiovasculaire eleve",
      action:
        "Suivi medical rapproche ; mesures hygieno-dietetiques et evaluation therapeutique selon les recommandations.",
    };
  }
  if (sys >= 140 && dia < 90) {
    return {
      classification: "Hypertension systolique isolee",
      cardiovascularRisk: "Risque cardiovasculaire variable selon l'age et les comorbidites",
      action:
        "Confirmation par mesures repetees ; recherche d'atteinte d'organes et adaptation du suivi cardiometabolique.",
    };
  }
  if (sys >= 140 && sys <= 159 && dia >= 90 && dia <= 99) {
    return {
      classification: "Hypertension arterielle grade 1 (legere)",
      cardiovascularRisk: "Risque cardiovasculaire a stratifier (facteurs associes)",
      action:
        "Mesures de vie et suivi ; reevaluation selon le risque global et les guides en vigueur.",
    };
  }
  if (sys >= 130 && sys <= 139 && dia >= 85 && dia <= 89) {
    return {
      classification: "Tension arterielle normale elevee",
      cardiovascularRisk: "Risque cardiometabolique modere selon le profil",
      action:
        "Renforcer prevention (sel, activite physique, poids) ; controle tensionnel regulier.",
    };
  }
  if (sys >= 120 && sys <= 129 && dia >= 80 && dia <= 84) {
    return {
      classification: "Tension arterielle normale",
      cardiovascularRisk: "Risque faible sur ce critere isole",
      action: "Maintenir les habitudes de vie favorables ; depistage selon l'age.",
    };
  }
  if (sys < 120 && dia < 80) {
    return {
      classification: "Tension arterielle optimale",
      cardiovascularRisk: "Risque faible sur ce critere isole",
      action: "Conserver une alimentation equilibree et une activite physique reguliere.",
    };
  }

  return {
    classification:
      "Classification PA : indeterminee par le tableau (valeurs hors plages discretes)",
    cardiovascularRisk: "Interpretation non applicable selon les classes definies.",
    action: "Reevaluation clinique et mesures repetees.",
  };
}

export function classifyBmi(
  bmi: number,
): Pick<
  NonNullable<VitalsGuidance["bmi"]>,
  "weightStatus" | "intervalLabel" | "metabolicRisk"
> & { value: number } {
  const value = Math.round(bmi * 10) / 10;

  if (bmi < 18.5) {
    return {
      value,
      weightStatus: "Insuffisance ponderale",
      intervalLabel: "IMC < 18,5 kg/m²",
      metabolicRisk: "Risque nutritionnel et global a evaluer cliniquement",
    };
  }
  if (bmi < 25) {
    return {
      value,
      weightStatus: "Corpulence normale",
      intervalLabel: "IMC 18,5–24,9 kg/m²",
      metabolicRisk: "Risque metabolique faible sur ce critere isole",
    };
  }
  if (bmi < 30) {
    return {
      value,
      weightStatus: "Surpoids",
      intervalLabel: "IMC 25,0–29,9 kg/m²",
      metabolicRisk: "Risque cardiometabolique accru selon la distribution graisseuse et les autres facteurs",
    };
  }
  if (bmi < 35) {
    return {
      value,
      weightStatus: "Obesite classe I",
      intervalLabel: "IMC 30,0–34,9 kg/m²",
      metabolicRisk: "Risque cardiometabolique eleve ; depistage syndrome metabolique recommande",
    };
  }
  if (bmi < 40) {
    return {
      value,
      weightStatus: "Obesite classe II (severe)",
      intervalLabel: "IMC 35,0–39,9 kg/m²",
      metabolicRisk: "Risque cardiometabolique et cardiovasculaire majore",
    };
  }
  return {
    value,
    weightStatus: "Obesite classe III (morbide)",
    intervalLabel: "IMC ≥ 40 kg/m²",
    metabolicRisk: "Risque cardiometabolique et complications tres eleves ; prise en charge specialisee",
  };
}

/** Seuils tour de taille OMS : sexe M/F. */
export function classifyWaist(
  waistCm: number,
  sex: ScreeningRecord["patient"]["sex"],
): Pick<
  NonNullable<VitalsGuidance["waist"]>,
  "thresholdLabel" | "cardiometabolicRisk"
> & { value: number } {
  const value = Math.round(waistCm * 10) / 10;

  if (sex === "M") {
    if (waistCm < 94) {
      return {
        value,
        thresholdLabel: "En dessous du seuil augmente (94 cm — homme)",
        cardiometabolicRisk:
          "Risque abdominal faible selon ce critere isole ; depend des autres facteurs de risque",
      };
    }
    if (waistCm < 102) {
      return {
        value,
        thresholdLabel: "Seuil augmente (94–101 cm — homme)",
        cardiometabolicRisk:
          "Risque cardiometabolique accru ; synergies avec tension, glycemie et lipidogramme",
      };
    }
    return {
      value,
      thresholdLabel: "Seuil tres augmente (≥ 102 cm — homme)",
      cardiometabolicRisk:
        "Risque cardiometabolique eleve ; depistage intensif du syndrome metabolique recommande",
    };
  }

  if (waistCm < 80) {
    return {
      value,
      thresholdLabel: "En dessous du seuil augmente (80 cm — femme)",
      cardiometabolicRisk:
        "Risque abdominal faible selon ce critere isole ; depend des autres facteurs de risque",
    };
  }
  if (waistCm < 88) {
    return {
      value,
      thresholdLabel: "Seuil augmente (80–87 cm — femme)",
      cardiometabolicRisk:
        "Risque cardiometabolique accru ; synergies avec tension, glycemie et lipidogramme",
    };
  }
  return {
    value,
    thresholdLabel: "Seuil tres augmente (≥ 88 cm — femme)",
    cardiometabolicRisk:
      "Risque cardiometabolique eleve ; depistage intensif du syndrome metabolique recommande",
  };
}

/** Glycemie a jeun en g/L (seuils usuels francais). */
export function classifyFastingGlucoseGPerL(
  glucoseGPerL: number,
): Pick<NonNullable<VitalsGuidance["glucose"]>, "status" | "clinicalRisk"> & {
  valueGPerL: number;
} {
  const valueGPerL = Math.round(glucoseGPerL * 1000) / 1000;

  if (glucoseGPerL < 1.1) {
    return {
      valueGPerL,
      status: "Normoglycemie a jeun",
      clinicalRisk: "Risque glycemique faible sur cette mesure isolee ; depistage selon les facteurs de risque",
    };
  }
  if (glucoseGPerL < 1.26) {
    return {
      valueGPerL,
      status: "Hyperglycemie a jeun / prediabete",
      clinicalRisk:
        "Risque de progression vers le diabete ; confirmation biologique et mesures hygieno-dietetiques",
    };
  }
  return {
    valueGPerL,
    status: "Hyperglycemie a jeun compatible avec un diabete (a confirmer)",
    clinicalRisk:
      "Risque cardiometabolique eleve ; bilan glycemique structure et avis medical selon les protocoles",
  };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Assemble la synthèse derivee ; `undefined` si aucune mesure exploitable. */
export function buildVitalsGuidance(
  record: Pick<ScreeningRecord, "patient" | "vitalsBiology">,
): VitalsGuidance | undefined {
  const computedAt = new Date().toISOString();
  const { patient, vitalsBiology: v } = record;

  let bloodPressureAvg: VitalsGuidance["bloodPressureAvg"];
  const avg = averageBloodPressure(v.bloodPressureRight, v.bloodPressureLeft);
  if (avg) {
    const cls = classifyBloodPressure(avg.systolic, avg.diastolic);
    bloodPressureAvg = {
      systolic: avg.systolic,
      diastolic: avg.diastolic,
      ...cls,
    };
  }

  let bmi: VitalsGuidance["bmi"];
  if (isFiniteNumber(v.bmi)) {
    const row = classifyBmi(v.bmi);
    bmi = {
      value: row.value,
      weightStatus: row.weightStatus,
      intervalLabel: row.intervalLabel,
      metabolicRisk: row.metabolicRisk,
    };
  }

  let waist: VitalsGuidance["waist"];
  if (isFiniteNumber(v.waistCm)) {
    const row = classifyWaist(v.waistCm, patient.sex);
    waist = {
      value: row.value,
      thresholdLabel: row.thresholdLabel,
      cardiometabolicRisk: row.cardiometabolicRisk,
    };
  }

  let glucose: VitalsGuidance["glucose"];
  if (isFiniteNumber(v.fastingGlucoseGl)) {
    const row = classifyFastingGlucoseGPerL(v.fastingGlucoseGl);
    glucose = {
      valueGPerL: row.valueGPerL,
      status: row.status,
      clinicalRisk: row.clinicalRisk,
    };
  }

  if (!bloodPressureAvg && !bmi && !waist && !glucose) {
    return undefined;
  }

  return {
    computedAt,
    ...(bloodPressureAvg ? { bloodPressureAvg } : {}),
    ...(bmi ? { bmi } : {}),
    ...(waist ? { waist } : {}),
    ...(glucose ? { glucose } : {}),
  };
}
