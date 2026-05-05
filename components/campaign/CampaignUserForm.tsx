"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, UserPlus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { campaignUserSchema, type CampaignUserInput } from "@/lib/schemas/campaign";

type CampaignUserFormProps = {
  campaigns: Array<{ id: string; name: string; status: "ACTIVE" | "DRAFT" | "ARCHIVED" }>;
};

export function CampaignUserForm({ campaigns }: CampaignUserFormProps) {
  const selectableCampaigns = campaigns.filter((item) => item.status === "ACTIVE");
  const defaultCampaignId = selectableCampaigns[0]?.id ?? "";
  const form = useForm<CampaignUserInput>({
    resolver: zodResolver(campaignUserSchema),
    defaultValues: {
      campaignId: defaultCampaignId,
      firstName: "",
      lastName: "",
      title: "Dr",
      role: "INFIRMIER_TECH",
      email: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const submit = async (values: CampaignUserInput) => {
    try {
      const response = await fetch("/api/campaigns/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        toast.error("Création du compte impossible.");
        return;
      }
      toast.success("Compte créé et identifiants envoyés par e-mail.");
      form.reset({ ...form.getValues(), firstName: "", lastName: "", email: "" });
    } catch (error) {
      console.error(error);
      toast.error("Erreur réseau lors de la création du compte.");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-3" aria-busy={isSubmitting}>
      <fieldset disabled={isSubmitting} className="contents">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <Label>Campagne liée</Label>
            <Controller
              control={form.control}
              name="campaignId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une campagne active" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectableCampaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {!selectableCampaigns.length ? (
              <p className="text-xs text-amber-700">Aucune campagne active disponible.</p>
            ) : null}
          </div>
          <div className="space-y-1">
            <Label>Prénom</Label>
            <Input {...form.register("firstName")} />
          </div>
          <div className="space-y-1">
            <Label>Nom</Label>
            <Input {...form.register("lastName")} />
          </div>
          <div className="space-y-1">
            <Label>Titre</Label>
            <Controller
              control={form.control}
              name="title"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr">Dr</SelectItem>
                    <SelectItem value="Professeur">Professeur</SelectItem>
                    <SelectItem value="M.">M.</SelectItem>
                    <SelectItem value="Mme">Mme</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1">
            <Label>Rôle</Label>
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEDECIN">Médecin</SelectItem>
                    <SelectItem value="INFIRMIER_TECH">Infirmier/Technicien labo</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Email professionnel
            </Label>
            <Input type="email" {...form.register("email")} />
          </div>
        </div>
      </fieldset>
      <Button type="submit" disabled={isSubmitting || !selectableCampaigns.length} className="gap-2">
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
        {isSubmitting ? "Création en cours..." : "Créer le compte"}
      </Button>
    </form>
  );
}
