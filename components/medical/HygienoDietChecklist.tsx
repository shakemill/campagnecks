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

const adviceItems: Array<{ key: AdviceField; label: string }> = [
  { key: "reduceSaltBouillon", label: "Arrêter les cubes et bouillons" },
  { key: "reduceSaltMeals", label: "Réduire la quantité de sel" },
  { key: "avoidProcessedFood", label: "Éviter les aliments transformés" },
  { key: "avoidSedentaryLifestyle", label: "Éviter la sédentarité" },
  { key: "activity30mFiveDays", label: "30 minutes d'activité, 5 jours/semaine" },
  { key: "addVegetables", label: "Moitié de l'assiette en légumes" },
  { key: "eatFruitsRegularly", label: "Consommer régulièrement des fruits" },
  { key: "replaceSugaryDrinks", label: "Remplacer sodas par eau" },
  { key: "stopSmoking", label: "Arrêt du tabac" },
  { key: "reduceAlcohol", label: "Limiter l'alcool" },
  { key: "monitorBloodPressureWeightSugar", label: "Suivre tension, poids, glycémie" },
  { key: "consultIfHighRisk", label: "Consulter rapidement si risque élevé" },
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
