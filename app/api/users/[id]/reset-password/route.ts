import { NextRequest, NextResponse } from "next/server";

import { requireApiRole } from "@/lib/auth/api-guard";
import { logAuditEvent } from "@/lib/audit/audit-log";
import { sendCredentialsEmail } from "@/lib/email/send-credentials";
import { hashPassword, generateTemporaryPassword } from "@/lib/security/password";
import { getStorageAdapter } from "@/lib/storage/storage-adapter";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, context: RouteContext) {
  const guard = await requireApiRole(["MEDECIN"]);
  if (guard.response) return guard.response;

  const { id } = await context.params;
  const adapter = getStorageAdapter();
  const state = await adapter.readState();

  const user = state.campaignUsers.find((u) => u.id === id);
  if (!user) {
    return NextResponse.json({ message: "Utilisateur introuvable." }, { status: 404 });
  }

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  const campaign = state.campaigns.find((c) => c.id === user.campaignId);
  const campaignName = campaign?.name ?? "Campagne MCV";

  const emailResult = await sendCredentialsEmail({
    to: user.email,
    firstName: user.firstName,
    campaignName,
    temporaryPassword,
  });

  if (!emailResult.accepted.length) {
    return NextResponse.json(
      { message: "Email non accepté par le serveur SMTP.", rejected: emailResult.rejected },
      { status: 502 },
    );
  }

  await adapter.patchState((draft) => {
    const target = draft.campaignUsers.find((u) => u.id === id);
    if (target) {
      target.passwordHash = passwordHash;
      target.mustChangePassword = true;
    }
  });

  await logAuditEvent({
    actorUserId: guard.session.user.id,
    action: "RESET_USER_PASSWORD",
    targetType: "CAMPAIGN_USER",
    targetId: id,
    metadata: { email: user.email },
  });

  return NextResponse.json({ success: true, email: user.email });
}
