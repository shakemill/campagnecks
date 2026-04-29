import { screeningFormSchema } from "@/lib/schemas/screening-form";

describe("screeningFormSchema", () => {
  it("validates minimal valid payload", () => {
    const result = screeningFormSchema.safeParse({
      campaignId: "camp_1",
      patient: {
        date: "2026-04-28",
        fullName: "Test Patient",
        age: 45,
        sex: "M",
        residence: "Abidjan",
        profession: "Commercant",
        phone1: "01020304",
      },
      riskFactors: {
        smoking: "NON",
        alcohol: "JAMAIS",
        physicalActivity: "JAMAIS",
        personalHistory: [],
        familyHistory: [],
        ongoingTreatment: "",
      },
      vitalsBiology: {
        bloodPressureRight: { systolic: 120, diastolic: 80 },
        bloodPressureLeft: { systolic: 121, diastolic: 80 },
        weightKg: 80,
        heightCm: 170,
        bmi: 27.7,
        waistCm: 90,
        fastingGlucoseGl: 1.1,
      },
      interpretation: { labels: [], other: "" },
      cardiovascularRisk: { enabled: false },
      orientationDecision: { items: [] },
      staffIdentity: {},
      hygienoDietAdvice: {
        reduceSaltBouillon: false,
        reduceSaltMeals: false,
        avoidProcessedFood: false,
        avoidSedentaryLifestyle: false,
        activity30mFiveDays: false,
        addVegetables: false,
        eatFruitsRegularly: false,
        replaceSugaryDrinks: false,
        stopSmoking: false,
        reduceAlcohol: false,
        monitorBloodPressureWeightSugar: false,
        consultIfHighRisk: false,
      },
    });
    expect(result.success).toBe(true);
  });
});
