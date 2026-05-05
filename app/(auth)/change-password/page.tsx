import { KeyRound } from "lucide-react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ChangePasswordForm } from "@/components/auth/change-password-form";

export default async function ChangePasswordPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-light p-6">
      <section className="soft-card w-full max-w-md p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-pink text-white">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-semibold text-brand-gray">
              Changer le mot de passe
            </h1>
            <p className="text-sm text-muted-foreground">
              Ce changement est obligatoire à la première connexion.
            </p>
          </div>
        </div>
        <ChangePasswordForm />
      </section>
    </main>
  );
}
