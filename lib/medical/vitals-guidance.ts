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
      classification: "Hypertension artérielle grade 3 (sévère)",
      cardiovascularRisk: "Risque cardiovasculaire très élevé",
      action:
        "Consultation médicale rapprochée ou urgente selon le contexte clinique ; bilan et traitement adapté.",
    };
  }
  if (sys >= 160 && sys <= 179 && dia >= 100 && dia <= 109) {
    return {
      classification: "Hypertension artérielle grade 2 (modérée)",
      cardiovascularRisk: "Risque cardiovasculaire élevé",
      action:
        "Suivi médical rapproché ; mesures hygiéno-diététiques et évaluation thérapeutique selon les recommandations.",
    };
  }
  if (sys >= 140 && dia < 90) {
    return {
      classification: "Hypertension systolique isolée",
      cardiovascularRisk: "Risque cardiovasculaire variable selon l'âge et les comorbidités",
      action:
        "Confirmation par mesures répétées ; recherche d'atteinte d'organes et adaptation du suivi cardiométabolique.",
    };
  }
  if (sys >= 140 && sys <= 159 && dia >= 90 && dia <= 99) {
    return {
      classification: "Hypertension artérielle grade 1 (légère)",
      cardiovascularRisk: "Risque cardiovasculaire à stratifier (facteurs associés)",
      action:
        "Mesures de vie et suivi ; réévaluation selon le risque global et les guides en vigueur.",
    };
  }
  if (sys >= 130 && sys <= 139 && dia >= 85 && dia <= 89) {
    return {
      classification: "Tension artérielle normale élevée",
      cardiovascularRisk: "Risque cardiométabolique modéré selon le profil",
      action:
        "Renforcer prévention (sel, activité physique, poids) ; contrôle tensionnel régulier.",
    };
  }
  if (sys >= 120 && sys <= 129 && dia >= 80 && dia <= 84) {
    return {
      classification: "Tension artérielle normale",
      cardiovascularRisk: "Risque faible sur ce critère isolé",
      action: "Maintenir les habitudes de vie favorables ; dépistage selon l'âge.",
    };
  }
  if (sys < 120 && dia < 80) {
    return {
      classification: "Tension artérielle optimale",
      cardiovascularRisk: "Risque faible sur ce critère isolé",
      action: "Conserver une alimentation équilibrée et une activité physique régulière.",
    };
  }

  return {
    classification:
      "Classification PA : indéterminée par le tableau (valeurs hors plages discrètes)",
    cardiovascularRisk: "Interprétation non applicable selon les classes définies.",
    action: "Réévaluation clinique et mesures répétées.",
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
      weightStatus: "Insuffisance pondérale",
      intervalLabel: "IMC < 18,5 kg/m²",
      metabolicRisk: "Risque nutritionnel et global à évaluer cliniquement",
    };
  }
  if (bmi < 25) {
    return {
      value,
      weightStatus: "Corpulence normale",
      intervalLabel: "IMC 18,5–24,9 kg/m²",
      metabolicRisk: "Risque métabolique faible sur ce critère isolé",
    };
  }
  if (bmi < 30) {
    return {
      value,
      weightStatus: "Surpoids",
      intervalLabel: "IMC 25,0–29,9 kg/m²",
      metabolicRisk:
        "Risque cardiométabolique accru selon la distribution graisseuse et les autres facteurs",
    };
  }
  if (bmi < 35) {
    return {
      value,
      weightStatus: "Obésité classe I",
      intervalLabel: "IMC 30,0–34,9 kg/m²",
      metabolicRisk:
        "Risque cardiométabolique élevé ; dépistage du syndrome métabolique recommandé",
    };
  }
  if (bmi < 40) {
    return {
      value,
      weightStatus: "Obésité classe II (sévère)",
      intervalLabel: "IMC 35,0–39,9 kg/m²",
      metabolicRisk: "Risque cardiométabolique et cardiovasculaire majoré",
    };
  }
  return {
    value,
    weightStatus: "Obésité classe III (morbide)",
    intervalLabel: "IMC ≥ 40 kg/m²",
    metabolicRisk:
      "Risque cardiométabolique et complications très élevés ; prise en charge spécialisée",
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
        thresholdLabel: "En dessous du seuil augmenté (94 cm — homme)",
        cardiometabolicRisk:
          "Risque abdominal faible selon ce critère isolé ; dépend des autres facteurs de risque",
      };
    }
    if (waistCm < 102) {
      return {
        value,
        thresholdLabel: "Seuil augmenté (94–101 cm — homme)",
        cardiometabolicRisk:
          "Risque cardiométabolique accru ; synergies avec tension, glycémie et lipidogramme",
      };
    }
    return {
      value,
      thresholdLabel: "Seuil très augmenté (≥ 102 cm — homme)",
      cardiometabolicRisk:
        "Risque cardiométabolique élevé ; dépistage intensif du syndrome métabolique recommandé",
    };
  }

  if (waistCm < 80) {
    return {
      value,
      thresholdLabel: "En dessous du seuil augmenté (80 cm — femme)",
      cardiometabolicRisk:
        "Risque abdominal faible selon ce critère isolé ; dépend des autres facteurs de risque",
    };
  }
  if (waistCm < 88) {
    return {
      value,
      thresholdLabel: "Seuil augmenté (80–87 cm — femme)",
      cardiometabolicRisk:
        "Risque cardiométabolique accru ; synergies avec tension, glycémie et lipidogramme",
    };
  }
  return {
    value,
    thresholdLabel: "Seuil très augmenté (≥ 88 cm — femme)",
    cardiometabolicRisk:
      "Risque cardiométabolique élevé ; dépistage intensif du syndrome métabolique recommandé",
  };
}

/** Glycémie à jeun en g/L (seuils usuels français). */
export function classifyFastingGlucoseGPerL(
  glucoseGPerL: number,
): Pick<NonNullable<VitalsGuidance["glucose"]>, "status" | "clinicalRisk"> & {
  valueGPerL: number;
} {
  const valueGPerL = Math.round(glucoseGPerL * 1000) / 1000;

  if (glucoseGPerL < 1.1) {
    return {
      valueGPerL,
      status: "Normoglycémie à jeun",
      clinicalRisk:
        "Risque glycémique faible sur cette mesure isolée ; dépistage selon les facteurs de risque",
    };
  }
  if (glucoseGPerL < 1.26) {
    return {
      valueGPerL,
      status: "Hyperglycémie à jeun / prédiabète",
      clinicalRisk:
        "Risque de progression vers le diabète ; confirmation biologique et mesures hygiéno-diététiques",
    };
  }
  return {
    valueGPerL,
    status: "Hyperglycémie à jeun compatible avec un diabète (à confirmer)",
    clinicalRisk:
      "Risque cardiométabolique élevé ; bilan glycémique structuré et avis médical selon les protocoles",
  };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Assemble la synthèse dérivée ; `undefined` si aucune mesure exploitable. */
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
