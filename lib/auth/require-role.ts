import { redirect } from "next/navigation";

import { auth } from "@/auth";
import type { UserRole } from "@/lib/types/domain";

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  if (!allowedRoles.includes(session.user.role)) {
    redirect("/forbidden");
  }

  return session;
}
