import { HeartPulse } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { getStorageAdapter } from "@/lib/storage/storage-adapter";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/admin");
  }
  const state = await getStorageAdapter().readState();

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-light p-6">
      <section className="soft-card w-full max-w-md p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-pink text-white">
            <HeartPulse className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-brand-gray">Connexion campagne MCV</h1>
            <p className="text-sm text-muted-foreground">Plenitude Clinique Kouam Samuel</p>
          </div>
        </div>
        <LoginForm />
        {state.campaignUsers.length === 0 ? (
          <p className="mt-4 text-xs text-muted-foreground">
            Aucun compte detecte.{" "}
            <Link href="/setup" className="text-brand-pink underline">
              Initialiser le premier compte
            </Link>
          </p>
        ) : null}
      </section>
    </main>
  );
}
