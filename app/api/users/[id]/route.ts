import { NextRequest, NextResponse } from "next/server";

import { requireApiRole } from "@/lib/auth/api-guard";
import { logAuditEvent } from "@/lib/audit/audit-log";
import { campaignUserUpdateSchema } from "@/lib/schemas/campaign";
import { getStorageAdapter } from "@/lib/storage/storage-adapter";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const guard = await requireApiRole(["MEDECIN"]);
  if (guard.response) return guard.response;

  const { id } = await context.params;
  const raw = await request.json();
  const parsed = campaignUserUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  const adapter = getStorageAdapter();
  const state = await adapter.readState();
  const index = state.campaignUsers.findIndex((u) => u.id === id);
  if (index === -1) {
    return NextResponse.json({ message: "Utilisateur introuvable." }, { status: 404 });
  }

  await adapter.patchState((draft) => {
    Object.assign(draft.campaignUsers[index], parsed.data);
  });

  await logAuditEvent({
    actorUserId: guard.session.user.id,
    action: "UPDATE_CAMPAIGN_USER",
    targetType: "CAMPAIGN_USER",
    targetId: id,
    metadata: parsed.data,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const guard = await requireApiRole(["MEDECIN"]);
  if (guard.response) return guard.response;

  const { id } = await context.params;
  const adapter = getStorageAdapter();
  const state = await adapter.readState();
  const exists = state.campaignUsers.some((u) => u.id === id);
  if (!exists) {
    return NextResponse.json({ message: "Utilisateur introuvable." }, { status: 404 });
  }

  await adapter.patchState((draft) => {
    draft.campaignUsers = draft.campaignUsers.filter((u) => u.id !== id);
  });

  await logAuditEvent({
    actorUserId: guard.session.user.id,
    action: "DELETE_CAMPAIGN_USER",
    targetType: "CAMPAIGN_USER",
    targetId: id,
    metadata: {},
  });

  return NextResponse.json({ success: true });
}
