import { NextRequest, NextResponse } from "next/server";

import { requireApiRole } from "@/lib/auth/api-guard";
import { logAuditEvent } from "@/lib/audit/audit-log";
import { sendCredentialsEmail } from "@/lib/email/send-credentials";
import { campaignUserSchema } from "@/lib/schemas/campaign";
import { hashPassword, generateTemporaryPassword } from "@/lib/security/password";
import { getStorageAdapter } from "@/lib/storage/storage-adapter";
import { generateId } from "@/lib/utils/id";

export async function GET() {
  const guard = await requireApiRole(["MEDECIN", "INFIRMIER_TECH"]);
  if (guard.response) {
    return guard.response;
  }

  const state = await getStorageAdapter().readState();
  return NextResponse.json(state.campaignUsers);
}

export async function POST(request: NextRequest) {
  const guard = await requireApiRole(["MEDECIN"]);
  if (guard.response) {
    return guard.response;
  }

  const raw = await request.json();
  const parsed = campaignUserSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);
  const created = {
    id: generateId("usr"),
    createdAt: new Date().toISOString(),
    mustChangePassword: true,
    isActive: true,
    passwordHash,
    ...parsed.data,
  };

  const state = await getStorageAdapter().readState();
  const campaign = state.campaigns.find((item) => item.id === created.campaignId);
  const campaignName = campaign?.name ?? "Campagne MCV";

  const emailResult = await sendCredentialsEmail({
    to: created.email,
    firstName: created.firstName,
    campaignName,
    temporaryPassword,
  });

  if (!emailResult.accepted.length) {
    return NextResponse.json(
      {
        message: "Email non accepte par le serveur SMTP.",
        rejected: emailResult.rejected,
      },
      { status: 502 },
    );
  }

  await getStorageAdapter().patchState((draft) => {
    draft.campaignUsers.push(created);
  });

  await logAuditEvent({
    actorUserId: guard.session.user.id,
    action: "CREATE_CAMPAIGN_USER",
    targetType: "CAMPAIGN_USER",
    targetId: created.id,
    metadata: { role: created.role },
  });

  return NextResponse.json(
    {
      ...created,
      passwordHash: undefined,
      emailDelivery: {
        messageId: emailResult.messageId,
        accepted: emailResult.accepted,
      },
    },
    { status: 201 },
  );
}
