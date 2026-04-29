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
  campaignId: string;
};

export function CampaignUserForm({ campaignId }: CampaignUserFormProps) {
  const form = useForm<CampaignUserInput>({
    resolver: zodResolver(campaignUserSchema),
    defaultValues: {
      campaignId,
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
        toast.error("Creation du compte impossible.");
        return;
      }
      toast.success("Compte cree et identifiants envoyes par email.");
      form.reset({ ...form.getValues(), firstName: "", lastName: "", email: "" });
    } catch (error) {
      console.error(error);
      toast.error("Erreur reseau lors de la creation du compte.");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-3" aria-busy={isSubmitting}>
      <fieldset disabled={isSubmitting} className="contents">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Prenom</Label>
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
            <Label>Role</Label>
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEDECIN">Medecin</SelectItem>
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
      <Button type="submit" disabled={isSubmitting} className="gap-2">
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
        {isSubmitting ? "Creation en cours..." : "Creer le compte"}
      </Button>
    </form>
  );
}
