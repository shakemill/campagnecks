import { Rocket } from "lucide-react";
import { redirect } from "next/navigation";

import { SetupForm } from "@/components/auth/setup-form";
import { getStorageAdapter } from "@/lib/storage/storage-adapter";

export default async function SetupPage() {
  const state = await getStorageAdapter().readState();
  if (state.campaignUsers.length > 0) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-light p-6">
      <section className="soft-card w-full max-w-lg p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-pink text-white">
            <Rocket className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-semibold text-brand-gray">
              Initialisation Cks Manager
            </h1>
            <p className="text-sm text-muted-foreground">
              Créez le premier compte médecin administrateur.
            </p>
          </div>
        </div>
        <SetupForm />
      </section>
    </main>
  );
}
