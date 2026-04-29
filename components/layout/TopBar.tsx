import { LogOut, ShieldCheck, UserRound } from "lucide-react";

import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/lib/types/domain";

type TopBarProps = {
  fullName: string;
  role: UserRole;
};

export function TopBar({ fullName, role }: TopBarProps) {
  const roleLabel = role === "MEDECIN" ? "Medecin" : "Infirmier / Technicien";

  return (
    <header className="soft-card flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-pink/10 text-brand-pink">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-heading text-base font-semibold text-brand-gray">
            Campagne de depistage des MCV
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <UserRound className="h-3.5 w-3.5" />
            <span className="truncate">
              {fullName} · {roleLabel}
            </span>
          </p>
        </div>
      </div>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <Button type="submit" variant="outline" aria-label="Se deconnecter" className="gap-2">
          <LogOut className="h-4 w-4" />
          Se deconnecter
        </Button>
      </form>
    </header>
  );
}
