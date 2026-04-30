export type UserRole = "MEDECIN" | "INFIRMIER_TECH";

export type CampaignStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export type ScreeningSection =
  | "IDENTIFICATION_PATIENT"
  | "FACTEURS_RISQUE"
  | "CONSTANTES_BIOLOGIE"
  | "INTERPRETATION_GLOBALE"
  | "RISQUE_CARDIO"
  | "ORIENTATION_DECISION"
  | "IDENTIFICATION_PERSONNEL"
  | "CONSEILS_HYGIENO_DIET";

export interface Campaign {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  status: CampaignStatus;
  createdAt: string;
  createdByUserId: string;
}

export interface CampaignUser {
  id: string;
  campaignId: string;
  firstName: string;
  lastName: string;
  title: "Dr" | "Professeur" | "M." | "Mme";
  role: UserRole;
  email: string;
  mustChangePassword: boolean;
  passwordHash: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorFirstName?: string;
  actorLastName?: string;
  actorRole?: UserRole;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
}

/** Synthèse automatique des constantes (tableaux OMS / référence clinique), non saisie manuellement. */
export interface VitalsGuidance {
  computedAt: string;
  bloodPressureAvg?: {
    systolic: number;
    diastolic: number;
    classification: string;
    cardiovascularRisk: string;
    action: string;
  };
  bmi?: {
    value: number;
    weightStatus: string;
    intervalLabel: string;
    metabolicRisk: string;
  };
  waist?: {
    value: number;
    thresholdLabel: string;
    cardiometabolicRisk: string;
  };
  glucose?: {
    valueGPerL: number;
    status: string;
    clinicalRisk: string;
  };
}

export interface Checklist5Reflexes {
  reduceSaltBouillon: boolean;
  reduceSaltMeals: boolean;
  avoidProcessedFood: boolean;
  avoidSedentaryLifestyle: boolean;
  activity30mFiveDays: boolean;
  addVegetables: boolean;
  eatFruitsRegularly: boolean;
  replaceSugaryDrinks: boolean;
  stopSmoking: boolean;
  reduceAlcohol: boolean;
  monitorBloodPressureWeightSugar: boolean;
  consultIfHighRisk: boolean;
}

export interface ScreeningRecord {
  id: string;
  campaignId: string;
  registrationNumber: string;
  createdByUserId: string;
  updatedByUserId: string;
  validatedByDoctorUserId?: string;
  validatedAt?: string;
  reportBlobUrl?: string;
  qrPayload?: string;
  createdAt: string;
  updatedAt: string;
  patient: {
    date: string;
    fullName: string;
    age: number;
    sex: "M" | "F";
    residence: string;
    profession: string;
    phone1: string;
    phone2?: string;
  };
  riskFactors: {
    smoking: "NON" | "FUMEUR_ACTIF" | "ANCIEN_FUMEUR";
    packYears?: number;
    yearsSinceQuit?: number;
    alcohol: "JAMAIS" | "OCCASIONNELLE" | "REGULIERE";
    physicalActivity: "JAMAIS" | "LT_5_SEMAINE" | "GT_5_SEMAINE";
    personalHistory: Array<"HTA" | "DIABETE" | "IRC" | "AVC" | "IDM">;
    familyHistory: Array<"HTA" | "DIABETE" | "AVC" | "IDM" | "MORT_SUBITE">;
    ongoingTreatment: string;
  };
  vitalsBiology: {
    bloodPressureRight: { systolic: number; diastolic: number };
    bloodPressureLeft: { systolic: number; diastolic: number };
    weightKg: number;
    heightCm: number;
    bmi: number;
    waistCm: number;
    fastingGlucoseGl: number;
  };
  interpretation: {
    labels: string[];
    other?: string;
  };
  cardiovascularRisk: {
    enabled: boolean;
    level?: "FAIBLE" | "MODERE" | "ELEVE" | "TRES_ELEVE" | "TRES_TRES_ELEVE";
    scoreNote?: string;
  };
  orientationDecision: {
    items: string[];
    other?: string;
    followUpDate?: string;
    followUpTime?: string;
  };
  staffIdentity: {
    nurseName?: string;
    doctorName?: string;
  };
  hygienoDietAdvice: Checklist5Reflexes;
  vitalsGuidance?: VitalsGuidance;
}

export interface AppState {
  version: number;
  campaigns: Campaign[];
  campaignUsers: CampaignUser[];
  screenings: ScreeningRecord[];
  audits: AuditLog[];
}
