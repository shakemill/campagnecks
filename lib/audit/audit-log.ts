import { getStorageAdapter } from "@/lib/storage/storage-adapter";
import type { AuditLog } from "@/lib/types/domain";
import { generateId } from "@/lib/utils/id";

type AuditInput = Omit<AuditLog, "id" | "createdAt">;

export async function logAuditEvent(input: AuditInput): Promise<void> {
  const storage = getStorageAdapter();
  const state = await storage.readState();
  const actor = state.campaignUsers.find((user) => user.id === input.actorUserId);
  await storage.patchState((draft) => {
    draft.audits.push({
      id: generateId("audit"),
      createdAt: new Date().toISOString(),
      actorFirstName: actor?.firstName,
      actorLastName: actor?.lastName,
      actorRole: actor?.role,
      ...input,
    });
  });
}
