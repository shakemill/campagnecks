"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  ClipboardCheck,
  FilePlus2,
  HeartHandshake,
  Loader2,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { HygienoDietChecklist } from "@/components/medical/HygienoDietChecklist";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Textarea } from "@/components/ui/textarea";
import { buildVitalsGuidance } from "@/lib/medical/vitals-guidance";
import { screeningFormSchema, type ScreeningFormInput } from "@/lib/schemas/screening-form";
import type { ScreeningRecord, UserRole } from "@/lib/types/domain";

type ScreeningFormProps = {
  role: UserRole;
  campaignId: string;
  campaigns?: Array<{ id: string; name: string; status: "ACTIVE" | "DRAFT" | "ARCHIVED" }>;
  screeningId?: string;
  initialRecord?: ScreeningRecord;
};

export function ScreeningForm({
  role,
  campaignId,
  campaigns = [],
  screeningId,
  initialRecord,
}: ScreeningFormProps) {
  const router = useRouter();
  const doctorOnlySectionLocked = role === "INFIRMIER_TECH";
  const form = useForm<ScreeningFormInput>({
    resolver: zodResolver(screeningFormSchema),
    defaultValues: initialRecord
      ? {
          campaignId: initialRecord.campaignId,
          patient: initialRecord.patient,
          riskFactors: initialRecord.riskFactors,
          vitalsBiology: initialRecord.vitalsBiology,
          interpretation: initialRecord.interpretation,
          cardiovascularRisk: initialRecord.cardiovascularRisk,
          orientationDecision: initialRecord.orientationDecision,
          staffIdentity: initialRecord.staffIdentity,
          hygienoDietAdvice: initialRecord.hygienoDietAdvice,
        }
      : {
          campaignId,
          patient: {
            date: new Date().toISOString().slice(0, 10),
            fullName: "",
            age: 40,
            sex: "M",
            residence: "",
            profession: "",
            phone1: "",
            phone2: "",
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
            bloodPressureRight: { systolic: Number.NaN, diastolic: Number.NaN },
            bloodPressureLeft: { systolic: Number.NaN, diastolic: Number.NaN },
            weightKg: Number.NaN,
            heightCm: Number.NaN,
            bmi: Number.NaN,
            waistCm: Number.NaN,
            fastingGlucoseGl: Number.NaN,
          },
          interpretation: { labels: [], other: "" },
          cardiovascularRisk: { enabled: false, level: "FAIBLE", scoreNote: "" },
          orientationDecision: { items: [], other: "", followUpDate: "", followUpTime: "" },
          staffIdentity: { nurseName: "", doctorName: "" },
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
        },
  });

  const isSubmitting = form.formState.isSubmitting;
  const weightKg = form.watch("vitalsBiology.weightKg");
  const heightCm = form.watch("vitalsBiology.heightCm");
  const watchedPatient = useWatch({ control: form.control, name: "patient" });
  const watchedVitals = useWatch({ control: form.control, name: "vitalsBiology" });
  const vitalsGuidancePreview = useMemo(
    () => buildVitalsGuidance({ patient: watchedPatient, vitalsBiology: watchedVitals }),
    [watchedPatient, watchedVitals],
  );

  const patientAge = watchedPatient?.age;
  const showScoreOmsSection =
    typeof patientAge === "number" && Number.isFinite(patientAge) && patientAge <= 40;

  useEffect(() => {
    const hasWeight = Number.isFinite(weightKg) && weightKg > 0;
    const hasHeight = Number.isFinite(heightCm) && heightCm > 0;
    if (!hasWeight || !hasHeight) {
      form.setValue("vitalsBiology.bmi", Number.NaN, { shouldDirty: true });
      return;
    }
    const heightM = heightCm / 100;
    const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));
    form.setValue("vitalsBiology.bmi", bmi, { shouldDirty: true });
  }, [form, heightCm, weightKg]);

  const submitForm = async (values: ScreeningFormInput) => {
    try {
      const response = await fetch("/api/screenings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          id: screeningId,
        }),
      });

      if (!response.ok) {
        toast.error("Échec de sauvegarde de la fiche.");
        return;
      }

      const data = (await response.json()) as { id: string };
      toast.success("Fiche enregistrée.");

      if (role === "MEDECIN") {
        const validateRes = await fetch(`/api/screenings/${data.id}/validate`, { method: "POST" });
        if (validateRes.ok) {
          toast.success("Validation médicale et génération PDF déclenchées.");
        } else {
          const raw = await validateRes.text();
          let message: string | undefined;
          if (raw) {
            try {
              const parsed = JSON.parse(raw) as { message?: string };
              message = parsed.message;
            } catch {
              message = raw.slice(0, 180);
            }
          }
          console.error("Validation API failed", {
            status: validateRes.status,
            statusText: validateRes.statusText,
            body: raw,
          });
          toast.error(
            message ??
              `Validation impossible (HTTP ${validateRes.status}). Vérifiez les logs Vercel et BLOB_READ_WRITE_TOKEN.`,
          );
        }
      }

      router.push("/screenings");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Une erreur réseau est survenue.");
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(submitForm)}
      className="space-y-6"
      aria-busy={isSubmitting}
    >
      <fieldset disabled={isSubmitting} className="contents">
        {!initialRecord ? (
          <section className="soft-card space-y-3 p-4">
            <SectionHeader
              icon={FilePlus2}
              title="Campagne cible"
              description="Sélectionnez la campagne correspondante avant création de la fiche"
            />
            <div className="space-y-1">
              <Label>Campagne</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2"
                {...form.register("campaignId")}
              >
                {campaigns.map((item) => (
                  <option key={item.id} value={item.id} disabled={item.status !== "ACTIVE"}>
                    {item.name}
                    {item.status === "ARCHIVED" ? " (clôturée)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </section>
        ) : null}

        <section className="soft-card space-y-3 p-4">
          <SectionHeader icon={UserRound} title="I. Identification du patient" />
          {initialRecord ? (
            <p className="rounded-md bg-surface-muted px-3 py-2 text-xs text-muted-foreground">
              N° d&apos;enregistrement : {initialRecord.registrationNumber}
            </p>
          ) : null}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Date</Label>
              <Input type="date" {...form.register("patient.date")} />
            </div>
            <div className="space-y-1">
              <Label>Nom et prénom</Label>
              <Input {...form.register("patient.fullName")} />
            </div>
            <div className="space-y-1">
              <Label>Âge</Label>
              <Input type="number" {...form.register("patient.age", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label>Résidence</Label>
              <Input {...form.register("patient.residence")} />
            </div>
            <div className="space-y-1">
              <Label>Profession</Label>
              <Input {...form.register("patient.profession")} />
            </div>
            <div className="space-y-1">
              <Label>Téléphone principal</Label>
              <Input {...form.register("patient.phone1")} />
            </div>
            <div className="space-y-1">
              <Label>Téléphone secondaire</Label>
              <Input {...form.register("patient.phone2")} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Sexe</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" value="M" {...form.register("patient.sex")} />
                  Masculin
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" value="F" {...form.register("patient.sex")} />
                  Féminin
                </label>
              </div>
            </div>
          </div>
        </section>

        <section className="soft-card space-y-3 p-4">
          <SectionHeader
            icon={AlertTriangle}
            title="II. Facteurs de risque et antécédents"
          />
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Tabagisme</Label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    value="NON"
                    disabled={doctorOnlySectionLocked}
                    {...form.register("riskFactors.smoking")}
                  />
                  Non
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    value="FUMEUR_ACTIF"
                    disabled={doctorOnlySectionLocked}
                    {...form.register("riskFactors.smoking")}
                  />
                  Fumeur actif
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    value="ANCIEN_FUMEUR"
                    disabled={doctorOnlySectionLocked}
                    {...form.register("riskFactors.smoking")}
                  />
                  Ancien fumeur
                </label>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>PA (pack-years)</Label>
                  <Input
                    type="number"
                    disabled={doctorOnlySectionLocked}
                    {...form.register("riskFactors.packYears", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Années depuis sevrage</Label>
                  <Input
                    type="number"
                    disabled={doctorOnlySectionLocked}
                    {...form.register("riskFactors.yearsSinceQuit", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Consommation d&apos;alcool</Label>
              <div className="flex flex-wrap gap-4">
                {[
                  { value: "JAMAIS", label: "Jamais" },
                  { value: "OCCASIONNELLE", label: "Occasionnelle" },
                  { value: "REGULIERE", label: "Régulière" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      value={option.value}
                      disabled={doctorOnlySectionLocked}
                      {...form.register("riskFactors.alcohol")}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Activité physique (30 min)</Label>
              <div className="flex flex-wrap gap-4">
                {[
                  { value: "JAMAIS", label: "Jamais" },
                  { value: "LT_5_SEMAINE", label: "< 5 fois/semaine" },
                  { value: "GT_5_SEMAINE", label: "> 5 fois/semaine" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      value={option.value}
                      disabled={doctorOnlySectionLocked}
                      {...form.register("riskFactors.physicalActivity")}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <Controller
              control={form.control}
              name="riskFactors.personalHistory"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Antécédents personnels</Label>
                  <div className="grid gap-2 md:grid-cols-3">
                    {["HTA", "DIABETE", "IRC", "AVC", "IDM"].map((item) => (
                      <label key={item} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          disabled={doctorOnlySectionLocked}
                          checked={field.value.includes(item as (typeof field.value)[number])}
                          onCheckedChange={(checked) => {
                            const current = field.value ?? [];
                            field.onChange(
                              checked
                                ? [...current, item]
                                : current.filter((value) => value !== item),
                            );
                          }}
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="riskFactors.familyHistory"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Antécédents familiaux</Label>
                  <div className="grid gap-2 md:grid-cols-3">
                    {["HTA", "DIABETE", "AVC", "IDM", "MORT_SUBITE"].map((item) => (
                      <label key={item} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          disabled={doctorOnlySectionLocked}
                          checked={field.value.includes(item as (typeof field.value)[number])}
                          onCheckedChange={(checked) => {
                            const current = field.value ?? [];
                            field.onChange(
                              checked
                                ? [...current, item]
                                : current.filter((value) => value !== item),
                            );
                          }}
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            />

            <div className="space-y-1">
              <Label>Traitement en cours</Label>
              <Textarea
                disabled={doctorOnlySectionLocked}
                {...form.register("riskFactors.ongoingTreatment")}
              />
            </div>
          </div>
        </section>

        <section className="soft-card space-y-3 p-4">
          <SectionHeader icon={Activity} title="III. Constantes et biologie" />
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label>PA droite systolique</Label>
              <Input
                type="number"
                {...form.register("vitalsBiology.bloodPressureRight.systolic", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1">
              <Label>PA droite diastolique</Label>
              <Input
                type="number"
                {...form.register("vitalsBiology.bloodPressureRight.diastolic", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1">
              <Label>PA gauche systolique</Label>
              <Input
                type="number"
                {...form.register("vitalsBiology.bloodPressureLeft.systolic", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1">
              <Label>PA gauche diastolique</Label>
              <Input
                type="number"
                {...form.register("vitalsBiology.bloodPressureLeft.diastolic", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1">
              <Label>Poids (kg)</Label>
              <Input type="number" {...form.register("vitalsBiology.weightKg", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label>Taille (cm)</Label>
              <Input type="number" {...form.register("vitalsBiology.heightCm", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label>IMC</Label>
              <Input
                type="number"
                step="0.1"
                readOnly
                {...form.register("vitalsBiology.bmi", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">Calculé automatiquement selon poids et taille.</p>
            </div>
            <div className="space-y-1">
              <Label>Tour de taille (cm)</Label>
              <Input type="number" {...form.register("vitalsBiology.waistCm", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label>Glycémie (g/L)</Label>
              <Input
                type="number"
                step="0.01"
                {...form.register("vitalsBiology.fastingGlucoseGl", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div
            className="mt-4 space-y-3 rounded-lg border border-border bg-surface-muted/40 p-4"
            aria-live="polite"
          >
            <p className="text-sm font-semibold text-brand-gray">
              Aide à l&apos;interprétation (automatique)
            </p>
            <p className="text-xs text-muted-foreground">
              Informations dérivées des constantes et du sexe du patient ; non modifiables ; ne se substituent pas
              au jugement clinique.
            </p>
            {!vitalsGuidancePreview ? (
              <p className="text-sm text-muted-foreground">
                Saisissez au moins une mesure exploitable (PA complète des deux bras, IMC, tour de taille ou
                glycémie) pour afficher une synthèse.
              </p>
            ) : (
              <ul className="space-y-3 text-sm text-brand-gray">
                {vitalsGuidancePreview.bloodPressureAvg ? (
                  <li className="space-y-1">
                    <span className="font-medium text-brand-gray">Pression arterielle (moyenne bras droit/gauche)</span>
                    <div className="pl-0 text-muted-foreground">
                      {vitalsGuidancePreview.bloodPressureAvg.systolic}/
                      {vitalsGuidancePreview.bloodPressureAvg.diastolic} mmHg —{" "}
                      {vitalsGuidancePreview.bloodPressureAvg.classification}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Risque CV : {vitalsGuidancePreview.bloodPressureAvg.cardiovascularRisk}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Action : {vitalsGuidancePreview.bloodPressureAvg.action}
                    </div>
                  </li>
                ) : null}
                {vitalsGuidancePreview.bmi ? (
                  <li className="space-y-1">
                    <span className="font-medium text-brand-gray">IMC</span>
                    <div className="text-muted-foreground">
                      {vitalsGuidancePreview.bmi.value} kg/m² — {vitalsGuidancePreview.bmi.weightStatus} (
                      {vitalsGuidancePreview.bmi.intervalLabel})
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Risque métabolique : {vitalsGuidancePreview.bmi.metabolicRisk}
                    </div>
                  </li>
                ) : null}
                {vitalsGuidancePreview.waist ? (
                  <li className="space-y-1">
                    <span className="font-medium text-brand-gray">Tour de taille</span>
                    <div className="text-muted-foreground">
                      {vitalsGuidancePreview.waist.value} cm — {vitalsGuidancePreview.waist.thresholdLabel}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {vitalsGuidancePreview.waist.cardiometabolicRisk}
                    </div>
                  </li>
                ) : null}
                {vitalsGuidancePreview.glucose ? (
                  <li className="space-y-1">
                    <span className="font-medium text-brand-gray">Glycémie à jeun</span>
                    <div className="text-muted-foreground">
                      {vitalsGuidancePreview.glucose.valueGPerL} g/L — {vitalsGuidancePreview.glucose.status}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {vitalsGuidancePreview.glucose.clinicalRisk}
                    </div>
                  </li>
                ) : null}
              </ul>
            )}
          </div>
        </section>

        <section className="soft-card space-y-3 p-4">
          <SectionHeader icon={ClipboardCheck} title="IV. Interprétation globale" />
          <Controller
            control={form.control}
            name="interpretation.labels"
            render={({ field }) => (
              <div className="grid gap-2 md:grid-cols-2">
                {[
                  "DEP_NORM",
                  "HTA",
                  "DIABETE",
                  "PREDIABETE",
                  "OBESITE",
                  "SURPOIDS",
                  "OBESITE_ABDOMINALE",
                ].map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      disabled={doctorOnlySectionLocked}
                      checked={field.value.includes(item)}
                      onCheckedChange={(checked) => {
                        const current = field.value ?? [];
                        field.onChange(
                          checked ? [...current, item] : current.filter((value) => value !== item),
                        );
                      }}
                    />
                    {item}
                  </label>
                ))}
              </div>
            )}
          />
          <Textarea
            disabled={doctorOnlySectionLocked}
            {...form.register("interpretation.other")}
            placeholder="Autre interprétation..."
          />
        </section>

        {showScoreOmsSection ? (
          <section className="soft-card space-y-3 p-4">
            <SectionHeader
              icon={ShieldCheck}
              title="V. Évaluation du risque cardiovasculaire"
              description="Patients de 40 ans ou moins (SCORE OMS)"
            />
            <Controller
              control={form.control}
              name="cardiovascularRisk.enabled"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    disabled={doctorOnlySectionLocked}
                    checked={Boolean(field.value)}
                    onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                  />
                  Évaluation activée (patients &lt;= 40 ans)
                </label>
              )}
            />
            <div className="grid gap-2 md:grid-cols-2">
              {[
                { value: "FAIBLE", label: "Risque faible (<5%)" },
                { value: "MODERE", label: "Risque modéré (5-10%)" },
                { value: "ELEVE", label: "Risque élevé (10-20%)" },
                { value: "TRES_ELEVE", label: "Risque très élevé (20-30%)" },
                { value: "TRES_TRES_ELEVE", label: "Risque très très élevé (&gt;=30%)" },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    value={option.value}
                    disabled={doctorOnlySectionLocked}
                    {...form.register("cardiovascularRisk.level")}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            <Textarea
              disabled={doctorOnlySectionLocked}
              {...form.register("cardiovascularRisk.scoreNote")}
              placeholder="Note SCORE OMS..."
            />
          </section>
        ) : null}

        <section className="soft-card space-y-3 p-4">
          <SectionHeader
            icon={Stethoscope}
            title={`${showScoreOmsSection ? "VI" : "V"}. Orientation et décision médicale`}
          />
          <Controller
            control={form.control}
            name="orientationDecision.items"
            render={({ field }) => (
              <div className="grid gap-2">
                {[
                  "Risque faible sans HTA",
                  "Risque modéré sans HTA",
                  "Hypertension artérielle",
                  "Risque élevé",
                  "Risque très élevé",
                  "Risque très très élevé",
                ].map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      disabled={doctorOnlySectionLocked}
                      checked={field.value.includes(item)}
                      onCheckedChange={(checked) => {
                        const current = field.value ?? [];
                        field.onChange(
                          checked ? [...current, item] : current.filter((value) => value !== item),
                        );
                      }}
                    />
                    {item}
                  </label>
                ))}
              </div>
            )}
          />
          <Textarea
            disabled={doctorOnlySectionLocked}
            {...form.register("orientationDecision.other")}
            placeholder="Autre orientation..."
          />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                Rendez-vous de contrôle (date)
              </Label>
              <Input
                type="date"
                disabled={doctorOnlySectionLocked}
                {...form.register("orientationDecision.followUpDate")}
              />
            </div>
            <div className="space-y-1">
              <Label>Heure</Label>
              <Input
                type="time"
                disabled={doctorOnlySectionLocked}
                {...form.register("orientationDecision.followUpTime")}
              />
            </div>
          </div>
        </section>

        <section className="soft-card space-y-3 p-4">
          <SectionHeader
            icon={Users}
            title={`${showScoreOmsSection ? "VII" : "VI"}. Identification du personnel`}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Infirmier(ère)</Label>
              <Input
                disabled={doctorOnlySectionLocked}
                {...form.register("staffIdentity.nurseName")}
              />
            </div>
            <div className="space-y-1">
              <Label>Médecin</Label>
              <Input
                disabled={doctorOnlySectionLocked}
                {...form.register("staffIdentity.doctorName")}
              />
            </div>
          </div>
        </section>

        <section className="soft-card space-y-3 p-4">
          <SectionHeader
            icon={HeartHandshake}
            title="Conseils hygiéno-diététiques"
            description="5 réflexes pour protéger votre cœur"
          />
          <HygienoDietChecklist
            control={form.control}
            disabled={doctorOnlySectionLocked}
            onCheckAll={() => {
              const keys = [
                "reduceSaltBouillon",
                "reduceSaltMeals",
                "avoidProcessedFood",
                "avoidSedentaryLifestyle",
                "activity30mFiveDays",
                "addVegetables",
                "eatFruitsRegularly",
                "replaceSugaryDrinks",
                "stopSmoking",
                "reduceAlcohol",
                "monitorBloodPressureWeightSugar",
                "consultIfHighRisk",
              ] as const;
              for (const key of keys) {
                form.setValue(`hygienoDietAdvice.${key}`, true, { shouldDirty: true });
              }
            }}
            onUncheckAll={() => {
              const keys = [
                "reduceSaltBouillon",
                "reduceSaltMeals",
                "avoidProcessedFood",
                "avoidSedentaryLifestyle",
                "activity30mFiveDays",
                "addVegetables",
                "eatFruitsRegularly",
                "replaceSugaryDrinks",
                "stopSmoking",
                "reduceAlcohol",
                "monitorBloodPressureWeightSugar",
                "consultIfHighRisk",
              ] as const;
              for (const key of keys) {
                form.setValue(`hygienoDietAdvice.${key}`, false, { shouldDirty: true });
              }
            }}
          />
        </section>
      </fieldset>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isSubmitting
            ? "Traitement en cours..."
            : doctorOnlySectionLocked
              ? "Enregistrer"
              : initialRecord
                ? "Compléter, valider et générer PDF"
                : "Valider et générer PDF"}
        </Button>
      </div>
    </form>
  );
}
