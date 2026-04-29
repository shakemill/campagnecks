import { NextResponse } from "next/server";

import { auth } from "@/auth";
import type { UserRole } from "@/lib/types/domain";

export async function requireApiRole(allowedRoles: UserRole[]) {
  const session = await auth();

  if (!session?.user) {
    return { response: NextResponse.json({ message: "Non autorise" }, { status: 401 }) };
  }

  if (!allowedRoles.includes(session.user.role)) {
    return { response: NextResponse.json({ message: "Acces refuse" }, { status: 403 }) };
  }

  return { session };
}
