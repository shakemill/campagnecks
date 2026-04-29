import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { hashPassword } from "@/lib/security/password";
import { getStorageAdapter } from "@/lib/storage/storage-adapter";

const schema = z.object({
  newPassword: z.string().min(8),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  const raw = await request.json();
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ message: "Mot de passe invalide" }, { status: 400 });
  }

  const hash = await hashPassword(parsed.data.newPassword);
  await getStorageAdapter().patchState((draft) => {
    const user = draft.campaignUsers.find((item) => item.id === session.user.id);
    if (user) {
      user.passwordHash = hash;
      user.mustChangePassword = false;
    }
  });

  return NextResponse.json({ ok: true });
}
