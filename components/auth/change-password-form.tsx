"use client";

import { KeyRound, Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: value }),
      });

      if (!response.ok) {
        toast.error("Impossible de mettre à jour le mot de passe.");
        return;
      }

      toast.success("Mot de passe mis à jour.");
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error(error);
      toast.error("Erreur réseau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3" aria-busy={isSubmitting}>
      <fieldset disabled={isSubmitting} className="contents">
        <div className="space-y-1">
          <Label className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Nouveau mot de passe
          </Label>
          <Input
            type="password"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            minLength={8}
            required
          />
        </div>
      </fieldset>
      <Button type="submit" disabled={isSubmitting} className="gap-2">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isSubmitting ? "Mise a jour..." : "Mettre a jour"}
      </Button>
    </form>
  );
}
