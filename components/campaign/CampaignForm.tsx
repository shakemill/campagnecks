"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarRange, Loader2, Lock, PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
      name: "Campagne de dépistage des MCV",
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
        toast.error("Création de campagne impossible.");
        return;
      }
      toast.success("Campagne créée.");
      form.reset({
        name: "Campagne de dépistage des MCV",
        startsAt: new Date().toISOString().slice(0, 10),
        endsAt: new Date().toISOString().slice(0, 10),
      });
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur réseau lors de la création.");
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
              <CalendarRange className="h-4 w-4" /> Date de début
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
        {isSubmitting ? "Création en cours..." : "Créer la campagne"}
      </Button>
    </form>
  );
}

type DeleteCampaignButtonProps = {
  campaignId: string;
  campaignName: string;
};

type CloseCampaignButtonProps = {
  campaignId: string;
  campaignName: string;
  disabled?: boolean;
};

export function DeleteCampaignButton({ campaignId, campaignName }: DeleteCampaignButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    const confirmed = window.confirm(
      `Supprimer la campagne « ${campaignName} » ? Cette action est irréversible.`,
    );
    if (!confirmed || isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/campaigns?id=${encodeURIComponent(campaignId)}`, {
        method: "DELETE",
      });
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        toast.error(payload.message ?? "Suppression de la campagne impossible.");
        return;
      }
      toast.success("Campagne supprimée.");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur réseau lors de la suppression.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isDeleting}
      onClick={onDelete}
      className="gap-1.5 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
      aria-label={`Supprimer la campagne ${campaignName}`}
    >
      {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      Supprimer
    </Button>
  );
}

export function CloseCampaignButton({ campaignId, campaignName, disabled }: CloseCampaignButtonProps) {
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);

  const onCloseCampaign = async () => {
    const confirmed = window.confirm(
      `Clôturer la campagne « ${campaignName} » ? Après clôture, aucune nouvelle fiche ne pourra être créée.`,
    );
    if (!confirmed || isClosing || disabled) return;

    setIsClosing(true);
    try {
      const response = await fetch(
        `/api/campaigns?id=${encodeURIComponent(campaignId)}&action=close`,
        { method: "PATCH" },
      );
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        toast.error(payload.message ?? "Clôture de campagne impossible.");
        return;
      }
      toast.success("Campagne clôturée.");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur réseau lors de la clôture.");
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled || isClosing}
      onClick={onCloseCampaign}
      className="gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-700"
      aria-label={`Clôturer la campagne ${campaignName}`}
    >
      {isClosing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
      Clôturer
    </Button>
  );
}
