"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarRange, Loader2, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { campaignSchema, type CampaignInput } from "@/lib/schemas/campaign";

export function CampaignForm() {
  const router = useRouter();
  const form = useForm<CampaignInput>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "Campagne de depistage des MCV",
      startsAt: new Date().toISOString().slice(0, 10),
      endsAt: new Date().toISOString().slice(0, 10),
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: CampaignInput) => {
    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        toast.error("Creation de campagne impossible.");
        return;
      }
      toast.success("Campagne creee.");
      form.reset({
        name: "Campagne de depistage des MCV",
        startsAt: new Date().toISOString().slice(0, 10),
        endsAt: new Date().toISOString().slice(0, 10),
      });
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur reseau lors de la creation.");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3" aria-busy={isSubmitting}>
      <fieldset disabled={isSubmitting} className="contents">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1 md:col-span-3">
            <Label>Nom de la campagne</Label>
            <Input {...form.register("name")} />
          </div>
          <div className="space-y-1">
            <Label className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4" /> Date de debut
            </Label>
            <Input type="date" {...form.register("startsAt")} />
          </div>
          <div className="space-y-1">
            <Label className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4" /> Date de fin
            </Label>
            <Input type="date" {...form.register("endsAt")} />
          </div>
        </div>
      </fieldset>
      <Button type="submit" disabled={isSubmitting} className="gap-2">
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <PlusCircle className="h-4 w-4" />
        )}
        {isSubmitting ? "Creation en cours..." : "Creer la campagne"}
      </Button>
    </form>
  );
}
