import { NextRequest, NextResponse } from "next/server";

import { requireApiRole } from "@/lib/auth/api-guard";
import { logAuditEvent } from "@/lib/audit/audit-log";
import { campaignSchema } from "@/lib/schemas/campaign";
import { getStorageAdapter } from "@/lib/storage/storage-adapter";
import { generateId } from "@/lib/utils/id";

export async function GET() {
  const guard = await requireApiRole(["MEDECIN", "INFIRMIER_TECH"]);
  if (guard.response) {
    return guard.response;
  }

  const state = await getStorageAdapter().readState();
  return NextResponse.json(state.campaigns);
}

export async function POST(request: NextRequest) {
  const guard = await requireApiRole(["MEDECIN"]);
  if (guard.response) {
    return guard.response;
  }

  const raw = await request.json();
  const parsed = campaignSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  const created = {
    id: generateId("camp"),
    name: parsed.data.name,
    startsAt: parsed.data.startsAt,
    endsAt: parsed.data.endsAt,
    status: "ACTIVE" as const,
    createdAt: new Date().toISOString(),
    createdByUserId: guard.session.user.id,
  };

  await getStorageAdapter().patchState((draft) => {
    draft.campaigns.push(created);
  });

  await logAuditEvent({
    actorUserId: guard.session.user.id,
    action: "CREATE_CAMPAIGN",
    targetType: "CAMPAIGN",
    targetId: created.id,
  });

  return NextResponse.json(created, { status: 201 });
}
