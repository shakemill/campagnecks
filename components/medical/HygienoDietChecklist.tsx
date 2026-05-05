import { Controller, type Control } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ScreeningFormInput } from "@/lib/schemas/screening-form";

type AdviceField =
  | "reduceSaltBouillon"
  | "reduceSaltMeals"
  | "avoidProcessedFood"
  | "avoidSedentaryLifestyle"
  | "activity30mFiveDays"
  | "addVegetables"
  | "eatFruitsRegularly"
  | "replaceSugaryDrinks"
  | "stopSmoking"
  | "reduceAlcohol"
  | "monitorBloodPressureWeightSugar"
  | "consultIfHighRisk";

type HygienoDietChecklistProps = {
  control: Control<ScreeningFormInput>;
  disabled?: boolean;
  onCheckAll?: () => void;
  onUncheckAll?: () => void;
};

const adviceSections: Array<{
  title: string;
  items: Array<{ key: AdviceField; label: string }>;
}> = [
  {
    title: "1. Réduisez le sel",
    items: [
      {
        key: "reduceSaltBouillon",
        label: "Arrêtez d'utiliser les cubes et bouillons d'assaisonnement.",
      },
      {
        key: "reduceSaltMeals",
        label: "Réduisez au maximum la quantité de sel dans vos repas.",
      },
      {
        key: "avoidProcessedFood",
        label: "Évitez les aliments transformés.",
      },
    ],
  },
  {
    title: "2. Bougez chaque jour",
    items: [
      {
        key: "avoidSedentaryLifestyle",
        label:
          "Évitez la sédentarité : réduisez au maximum votre temps d'éveil passé assis ou allongé. Marchez, prenez les escaliers, faites des pauses actives. Faites au moins 7 000 à 10 000 pas chaque jour.",
      },
      {
        key: "activity30mFiveDays",
        label:
          "Faites au moins 30 minutes d'activité physique modérée (exemples : marche rapide, footing, danse, natation...) minimum 5 jours par semaine.",
      },
    ],
  },
  {
    title: "3. Mangez \"vivant\"",
    items: [
      {
        key: "addVegetables",
        label: "Remplissez la moitié de votre assiette avec des légumes.",
      },
      {
        key: "eatFruitsRegularly",
        label: "Consommez régulièrement des fruits.",
      },
      {
        key: "replaceSugaryDrinks",
        label: "Remplacez les boissons sucrées et sodas par de l'eau.",
      },
    ],
  },
  {
    title: "4. Stop au tabac, moins d'alcool",
    items: [
      {
        key: "stopSmoking",
        label: "Le tabac bouche vos artères dès la première cigarette.",
      },
      {
        key: "reduceAlcohol",
        label: "Limitez l'alcool à des occasions exceptionnelles.",
      },
    ],
  },
  {
    title: "5. Surveillez vos paramètres",
    items: [
      {
        key: "monitorBloodPressureWeightSugar",
        label: "Connaissez votre tension, votre poids et votre sucre (glycémie).",
      },
      {
        key: "consultIfHighRisk",
        label:
          "Si votre risque est Orange (élevé), Rouge clair (très élevé) ou Rouge foncé (très très élevé), consultez un médecin rapidement.",
      },
    ],
  },
];

export function HygienoDietChecklist({
  control,
  disabled,
  onCheckAll,
  onUncheckAll,
}: HygienoDietChecklistProps) {
  return (
    <div className="grid gap-2 rounded-lg border bg-surface-muted/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-heading text-sm font-semibold text-brand-gray">
          VOTRE CŒUR EST PRÉCIEUX : 5 RÉFLEXES POUR LE PROTÉGER
        </h3>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={onCheckAll}>
            Cocher tout
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={onUncheckAll}>
            Tout décocher
          </Button>
        </div>
      </div>
      {adviceSections.map((section) => (
        <div key={section.title} className="space-y-2 rounded-md bg-white/70 p-3">
          <p className="text-sm font-semibold text-brand-gray">{section.title}</p>
          <div className="space-y-2">
            {section.items.map((item) => (
              <Controller
                key={item.key}
                control={control}
                name={`hygienoDietAdvice.${item.key}`}
                render={({ field }) => (
                  <label className="flex items-start gap-2 text-sm leading-relaxed">
                    <Checkbox
                      checked={Boolean(field.value)}
                      disabled={disabled}
                      onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                    />
                    <span>{item.label}</span>
                  </label>
                )}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
