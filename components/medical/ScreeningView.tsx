import {
  Activity,
  AlertTriangle,
  ClipboardCheck,
  HeartHandshake,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";

import { SectionHeader } from "@/components/ui/SectionHeader";
import type { ScreeningRecord } from "@/lib/types/domain";
import { formatDateFr } from "@/lib/utils";

type ScreeningViewProps = {
  record: ScreeningRecord;
};

const SMOKING_LABEL: Record<ScreeningRecord["riskFactors"]["smoking"], string> = {
  NON: "Non fumeur",
  FUMEUR_ACTIF: "Fumeur actif",
  ANCIEN_FUMEUR: "Ancien fumeur",
};

const ALCOHOL_LABEL: Record<ScreeningRecord["riskFactors"]["alcohol"], string> = {
  JAMAIS: "Jamais",
  OCCASIONNELLE: "Occasionnelle",
  REGULIERE: "Reguliere",
};

const ACTIVITY_LABEL: Record<ScreeningRecord["riskFactors"]["physicalActivity"], string> = {
  JAMAIS: "Jamais",
  LT_5_SEMAINE: "< 5 fois/semaine",
  GT_5_SEMAINE: "> 5 fois/semaine",
};

const RISK_LEVEL_LABEL: Record<
  NonNullable<ScreeningRecord["cardiovascularRisk"]["level"]>,
  string
> = {
  FAIBLE: "Risque faible (<5%)",
  MODERE: "Risque modere (5-10%)",
  ELEVE: "Risque eleve (10-20%)",
  TRES_ELEVE: "Risque tres eleve (20-30%)",
  TRES_TRES_ELEVE: "Risque tres tres eleve (>=30%)",
};

const ADVICE_LABEL: Record<keyof ScreeningRecord["hygienoDietAdvice"], string> = {
  reduceSaltBouillon: "Arreter les cubes et bouillons",
  reduceSaltMeals: "Reduire la quantite de sel",
  avoidProcessedFood: "Eviter les aliments transformes",
  avoidSedentaryLifestyle: "Eviter la sedentarite",
  activity30mFiveDays: "30 minutes d'activite, 5 jours/semaine",
  addVegetables: "Moitie de l'assiette en legumes",
  eatFruitsRegularly: "Consommer regulierement des fruits",
  replaceSugaryDrinks: "Remplacer sodas par eau",
  stopSmoking: "Arret du tabac",
  reduceAlcohol: "Limiter l'alcool",
  monitorBloodPressureWeightSugar: "Suivre tension, poids, glycemie",
  consultIfHighRisk: "Consulter rapidement si risque eleve",
};

type Row = {
  label: string;
  value: React.ReactNode;
};

function formatValue(value: React.ReactNode) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">-</span>;
  }
  return value;
}

function StripedTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full border-collapse text-sm">
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row.label}-${index}`}
              className={index % 2 === 0 ? "bg-white" : "bg-surface-muted/50"}
            >
              <th
                scope="row"
                className="w-1/2 max-w-[260px] border-r border-b border-border px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                {row.label}
              </th>
              <td className="border-b border-border px-3 py-2 text-brand-gray">
                {formatValue(row.value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChipList({ items }: { items: string[] }) {
  if (!items.length) {
    return <span className="text-muted-foreground">Aucun</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center rounded-full bg-brand-pink/10 px-2.5 py-0.5 text-xs font-medium text-brand-pink"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function ScreeningView({ record }: ScreeningViewProps) {
  const checkedAdvice = (
    Object.keys(ADVICE_LABEL) as Array<keyof typeof ADVICE_LABEL>
  ).filter((key) => record.hygienoDietAdvice[key]);

  const identificationRows: Row[] = [
    { label: "N d'enregistrement", value: record.registrationNumber },
    { label: "Date", value: formatDateFr(record.patient.date) },
    { label: "Nom et prenom", value: record.patient.fullName },
    { label: "Age", value: `${record.patient.age} ans` },
    { label: "Sexe", value: record.patient.sex === "M" ? "Masculin" : "Feminin" },
    { label: "Residence", value: record.patient.residence },
    { label: "Profession", value: record.patient.profession },
    { label: "Telephone principal", value: record.patient.phone1 },
    { label: "Telephone secondaire", value: record.patient.phone2 },
  ];

  const riskRows: Row[] = [
    { label: "Tabagisme", value: SMOKING_LABEL[record.riskFactors.smoking] },
    { label: "Pack-years", value: record.riskFactors.packYears },
    { label: "Annees depuis sevrage", value: record.riskFactors.yearsSinceQuit },
    { label: "Consommation d'alcool", value: ALCOHOL_LABEL[record.riskFactors.alcohol] },
    {
      label: "Activite physique (30 min)",
      value: ACTIVITY_LABEL[record.riskFactors.physicalActivity],
    },
    {
      label: "Antecedents personnels",
      value: <ChipList items={record.riskFactors.personalHistory} />,
    },
    {
      label: "Antecedents familiaux",
      value: <ChipList items={record.riskFactors.familyHistory} />,
    },
    { label: "Traitement en cours", value: record.riskFactors.ongoingTreatment },
  ];

  const vitalsRows: Row[] = [
    {
      label: "PA bras droit (mmHg)",
      value: `${record.vitalsBiology.bloodPressureRight.systolic} / ${record.vitalsBiology.bloodPressureRight.diastolic}`,
    },
    {
      label: "PA bras gauche (mmHg)",
      value: `${record.vitalsBiology.bloodPressureLeft.systolic} / ${record.vitalsBiology.bloodPressureLeft.diastolic}`,
    },
    { label: "Glycemie a jeun (g/L)", value: record.vitalsBiology.fastingGlucoseGl },
    { label: "Poids (kg)", value: record.vitalsBiology.weightKg },
    { label: "Taille (cm)", value: record.vitalsBiology.heightCm },
    { label: "IMC", value: record.vitalsBiology.bmi },
    { label: "Tour de taille (cm)", value: record.vitalsBiology.waistCm },
  ];

  const interpretationRows: Row[] = [
    {
      label: "Diagnostics retenus",
      value: <ChipList items={record.interpretation.labels} />,
    },
    { label: "Autre interpretation", value: record.interpretation.other },
  ];

  const cardioRiskRows: Row[] = [
    {
      label: "Evaluation activee",
      value: record.cardiovascularRisk.enabled ? "Oui" : "Non applicable",
    },
    {
      label: "Niveau de risque",
      value: record.cardiovascularRisk.level
        ? RISK_LEVEL_LABEL[record.cardiovascularRisk.level]
        : "-",
    },
    { label: "Note SCORE OMS", value: record.cardiovascularRisk.scoreNote },
  ];

  const orientationRows: Row[] = [
    {
      label: "Decisions",
      value: <ChipList items={record.orientationDecision.items} />,
    },
    { label: "Autre orientation", value: record.orientationDecision.other },
    { label: "Rendez-vous de controle", value: formatDateFr(record.orientationDecision.followUpDate) },
    { label: "Heure", value: record.orientationDecision.followUpTime },
  ];

  const staffRows: Row[] = [
    { label: "Infirmier(ere)", value: record.staffIdentity.nurseName },
    { label: "Medecin", value: record.staffIdentity.doctorName },
  ];

  const adviceRows: Row[] = (Object.keys(ADVICE_LABEL) as Array<keyof typeof ADVICE_LABEL>).map(
    (key) => ({
      label: ADVICE_LABEL[key],
      value: record.hygienoDietAdvice[key] ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-green/10 px-2.5 py-0.5 text-xs font-medium text-brand-green">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
          Coche
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">Non coche</span>
      ),
    }),
  );

  return (
    <div className="space-y-6">
      <section className="soft-card space-y-4 p-4">
        <SectionHeader icon={UserRound} title="I. Identification du patient" />
        <StripedTable rows={identificationRows} />
      </section>

      <section className="soft-card space-y-4 p-4">
        <SectionHeader icon={AlertTriangle} title="II. Facteurs de risque et antecedents" />
        <StripedTable rows={riskRows} />
      </section>

      <section className="soft-card space-y-4 p-4">
        <SectionHeader icon={Activity} title="III. Constantes et biologie" />
        <StripedTable rows={vitalsRows} />
      </section>

      <section className="soft-card space-y-4 p-4">
        <SectionHeader icon={ClipboardCheck} title="IV. Interpretation globale" />
        <StripedTable rows={interpretationRows} />
      </section>

      <section className="soft-card space-y-4 p-4">
        <SectionHeader
          icon={ShieldCheck}
          title="V. Evaluation du risque cardiovasculaire"
          description="Patients de 40 ans ou plus (SCORE OMS)"
        />
        <StripedTable rows={cardioRiskRows} />
      </section>

      <section className="soft-card space-y-4 p-4">
        <SectionHeader icon={Stethoscope} title="VI. Orientation et decision medicale" />
        <StripedTable rows={orientationRows} />
      </section>

      <section className="soft-card space-y-4 p-4">
        <SectionHeader icon={Users} title="VII. Identification du personnel" />
        <StripedTable rows={staffRows} />
      </section>

      <section className="soft-card space-y-4 p-4">
        <SectionHeader
          icon={HeartHandshake}
          title="Conseils hygieno-dietetiques"
          description={`5 reflexes pour proteger votre coeur (${checkedAdvice.length}/${adviceRows.length} coches)`}
        />
        <StripedTable rows={adviceRows} />
      </section>
    </div>
  );
}
