import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "@/lib/security/password";
import { getStorageAdapter } from "@/lib/storage/storage-adapter";
import { generateId } from "@/lib/utils/id";

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  const state = await getStorageAdapter().readState();
  if (state.campaignUsers.length > 0) {
    return NextResponse.json({ message: "Setup deja effectue." }, { status: 400 });
  }

  const raw = await request.json();
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await getStorageAdapter().patchState((draft) => {
    draft.campaignUsers.push({
      id: generateId("usr"),
      campaignId: "bootstrap",
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      title: "Dr",
      role: "MEDECIN",
      email: parsed.data.email,
      mustChangePassword: false,
      passwordHash,
      isActive: true,
      createdAt: new Date().toISOString(),
    });
  });

  return NextResponse.json({ ok: true });
}
