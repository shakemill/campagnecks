import { Controller, type Control } from "react-hook-form";

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
};

const adviceItems: Array<{ key: AdviceField; label: string }> = [
  { key: "reduceSaltBouillon", label: "Arreter les cubes et bouillons" },
  { key: "reduceSaltMeals", label: "Reduire la quantite de sel" },
  { key: "avoidProcessedFood", label: "Eviter les aliments transformes" },
  { key: "avoidSedentaryLifestyle", label: "Eviter la sedentarite" },
  { key: "activity30mFiveDays", label: "30 minutes d'activite, 5 jours/semaine" },
  { key: "addVegetables", label: "Moitie de l'assiette en legumes" },
  { key: "eatFruitsRegularly", label: "Consommer regulierement des fruits" },
  { key: "replaceSugaryDrinks", label: "Remplacer sodas par eau" },
  { key: "stopSmoking", label: "Arret du tabac" },
  { key: "reduceAlcohol", label: "Limiter l'alcool" },
  { key: "monitorBloodPressureWeightSugar", label: "Suivre tension, poids, glycemie" },
  { key: "consultIfHighRisk", label: "Consulter rapidement si risque eleve" },
];

export function HygienoDietChecklist({ control, disabled }: HygienoDietChecklistProps) {
  return (
    <div className="grid gap-2 rounded-lg border bg-surface-muted/40 p-3">
      <h3 className="font-heading text-sm font-semibold text-brand-gray">
        VOTRE COEUR EST PRECIEUX : 5 REFLEXES POUR LE PROTEGER
      </h3>
      {adviceItems.map((item) => (
        <Controller
          key={item.key}
          control={control}
          name={`hygienoDietAdvice.${item.key}`}
          render={({ field }) => (
            <label className="flex items-start gap-2 text-sm">
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
  );
}
