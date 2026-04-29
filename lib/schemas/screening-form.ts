import { z } from "zod";

const bloodPressureSchema = z.object({
  systolic: z.number().min(60).max(280),
  diastolic: z.number().min(40).max(180),
});

export const screeningFormSchema = z.object({
  campaignId: z.string().min(1),
  patient: z.object({
    date: z.string().min(1),
    fullName: z.string().min(2),
    age: z.number().min(1).max(120),
    sex: z.enum(["M", "F"]),
    residence: z.string().min(2),
    profession: z.string().min(2),
    phone1: z.string().min(6),
    phone2: z.string().optional(),
  }),
  riskFactors: z.object({
    smoking: z.enum(["NON", "FUMEUR_ACTIF", "ANCIEN_FUMEUR"]),
    packYears: z.number().optional(),
    yearsSinceQuit: z.number().optional(),
    alcohol: z.enum(["JAMAIS", "OCCASIONNELLE", "REGULIERE"]),
    physicalActivity: z.enum(["JAMAIS", "LT_5_SEMAINE", "GT_5_SEMAINE"]),
    personalHistory: z.array(z.enum(["HTA", "DIABETE", "IRC", "AVC", "IDM"])),
    familyHistory: z.array(z.enum(["HTA", "DIABETE", "AVC", "IDM", "MORT_SUBITE"])),
    ongoingTreatment: z.string(),
  }),
  vitalsBiology: z.object({
    bloodPressureRight: bloodPressureSchema,
    bloodPressureLeft: bloodPressureSchema,
    weightKg: z.number().min(10).max(300),
    heightCm: z.number().min(80).max(250),
    bmi: z.number().min(10).max(90),
    waistCm: z.number().min(40).max(250),
    fastingGlucoseGl: z.number().min(0.3).max(8),
  }),
  interpretation: z.object({
    labels: z.array(z.string()),
    other: z.string().optional(),
  }),
  cardiovascularRisk: z.object({
    enabled: z.boolean(),
    level: z.enum(["FAIBLE", "MODERE", "ELEVE", "TRES_ELEVE", "TRES_TRES_ELEVE"]).optional(),
    scoreNote: z.string().optional(),
  }),
  orientationDecision: z.object({
    items: z.array(z.string()),
    other: z.string().optional(),
    followUpDate: z.string().optional(),
    followUpTime: z.string().optional(),
  }),
  staffIdentity: z.object({
    nurseName: z.string().optional(),
    doctorName: z.string().optional(),
  }),
  hygienoDietAdvice: z.object({
    reduceSaltBouillon: z.boolean(),
    reduceSaltMeals: z.boolean(),
    avoidProcessedFood: z.boolean(),
    avoidSedentaryLifestyle: z.boolean(),
    activity30mFiveDays: z.boolean(),
    addVegetables: z.boolean(),
    eatFruitsRegularly: z.boolean(),
    replaceSugaryDrinks: z.boolean(),
    stopSmoking: z.boolean(),
    reduceAlcohol: z.boolean(),
    monitorBloodPressureWeightSugar: z.boolean(),
    consultIfHighRisk: z.boolean(),
  }),
});

export type ScreeningFormInput = z.infer<typeof screeningFormSchema>;
