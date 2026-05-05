"use client";

import { Loader2, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SetupForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/setup/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        toast.error("Échec de l'initialisation.");
        return;
      }

      toast.success("Compte médecin initial créé.");
      router.push("/login");
    } catch (error) {
      console.error(error);
      toast.error("Erreur réseau lors de l'initialisation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3" aria-busy={isSubmitting}>
      <fieldset disabled={isSubmitting} className="contents">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Prenom</Label>
            <Input
              required
              onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>Nom</Label>
            <Input
              required
              onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Email</Label>
          <Input
            type="email"
            required
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label>Mot de passe</Label>
          <Input
            type="password"
            required
            minLength={8}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          />
        </div>
      </fieldset>
      <Button type="submit" disabled={isSubmitting} className="gap-2">
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Rocket className="h-4 w-4" />
        )}
        {isSubmitting ? "Initialisation..." : "Initialiser"}
      </Button>
    </form>
  );
}
