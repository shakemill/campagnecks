"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { campaignUserUpdateSchema, type CampaignUserUpdateInput } from "@/lib/schemas/campaign";
import type { CampaignUser } from "@/lib/types/domain";

type UserTableProps = {
  users: CampaignUser[];
  campaigns: Array<{ id: string; name: string }>;
  /** Si false, les boutons d'action sont masqués (lecture seule) */
  canEdit?: boolean;
};

export function UserTable({ users, campaigns, canEdit = false }: UserTableProps) {
  const router = useRouter();

  const [editTarget, setEditTarget] = useState<CampaignUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CampaignUser | null>(null);
  const [resetTarget, setResetTarget] = useState<CampaignUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const form = useForm<CampaignUserUpdateInput>({
    resolver: zodResolver(campaignUserUpdateSchema),
  });

  function openEdit(user: CampaignUser) {
    setEditTarget(user);
    form.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      title: user.title,
      role: user.role,
      campaignId: user.campaignId,
      isActive: user.isActive,
    });
  }

  async function submitEdit(values: CampaignUserUpdateInput) {
    if (!editTarget) return;
    const res = await fetch(`/api/users/${editTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      toast.error("Modification impossible. Réessayez.");
      return;
    }
    toast.success("Compte mis à jour.");
    setEditTarget(null);
    router.refresh();
  }

  async function confirmReset() {
    if (!resetTarget) return;
    setIsResetting(true);
    const res = await fetch(`/api/users/${resetTarget.id}/reset-password`, { method: "POST" });
    setIsResetting(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      toast.error(data.message ?? "Réinitialisation impossible. Réessayez.");
      return;
    }
    toast.success(`Nouveau mot de passe envoyé à ${resetTarget.email}.`);
    setResetTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await fetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" });
    setIsDeleting(false);
    if (!res.ok) {
      toast.error("Suppression impossible. Réessayez.");
      return;
    }
    toast.success("Compte supprimé.");
    setDeleteTarget(null);
    router.refresh();
  }

  const campaignMap = new Map(campaigns.map((c) => [c.id, c.name]));

  return (
    <>
      <div className="soft-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom complet</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Campagne</TableHead>
              <TableHead>Statut</TableHead>
              {canEdit && <TableHead className="w-32 text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.title} {user.firstName} {user.lastName}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "MEDECIN" ? "default" : "secondary"}>
                    {user.role === "MEDECIN" ? "Médecin" : "Infirmier/Tech"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {campaignMap.get(user.campaignId) ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      user.isActive
                        ? "border-green-600 bg-green-50 text-green-700"
                        : "border-gray-400 bg-gray-50 text-gray-500"
                    }
                  >
                    {user.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </TableCell>
                {canEdit && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-brand-pink"
                        onClick={() => openEdit(user)}
                        aria-label={`Modifier ${user.firstName} ${user.lastName}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-amber-600"
                        onClick={() => setResetTarget(user)}
                        aria-label={`Réinitialiser le mot de passe de ${user.firstName} ${user.lastName}`}
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                        onClick={() => setDeleteTarget(user)}
                        aria-label={`Supprimer ${user.firstName} ${user.lastName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog édition */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le compte</DialogTitle>
            <DialogDescription>
              {editTarget?.email} — les modifications sont immédiates.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(submitEdit)} className="space-y-4">
            <fieldset disabled={form.formState.isSubmitting} className="contents">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Prénom</Label>
                  <Input {...form.register("firstName")} />
                </div>
                <div className="space-y-1">
                  <Label>Nom</Label>
                  <Input {...form.register("lastName")} />
                </div>
                <div className="space-y-1">
                  <Label>Titre</Label>
                  <Controller
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dr">Dr</SelectItem>
                          <SelectItem value="Professeur">Professeur</SelectItem>
                          <SelectItem value="M.">M.</SelectItem>
                          <SelectItem value="Mme">Mme</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Rôle</Label>
                  <Controller
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MEDECIN">Médecin</SelectItem>
                          <SelectItem value="INFIRMIER_TECH">Infirmier/Technicien</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Campagne liée</Label>
                  <Controller
                    control={form.control}
                    name="campaignId"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {campaigns.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Statut du compte</Label>
                  <Controller
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <Select
                        value={field.value ? "true" : "false"}
                        onValueChange={(v) => field.onChange(v === "true")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Actif</SelectItem>
                          <SelectItem value="false">Inactif (accès bloqué)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </fieldset>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>
                Annuler
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className="gap-2">
                {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog confirmation réinitialisation mot de passe */}
      <Dialog open={!!resetTarget} onOpenChange={(open) => !open && setResetTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Réinitialiser le mot de passe ?</DialogTitle>
            <DialogDescription>
              Un nouveau mot de passe temporaire sera généré et envoyé par e-mail à{" "}
              <span className="font-semibold">{resetTarget?.email}</span>.{" "}
              L&apos;utilisateur devra le changer à sa prochaine connexion.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetTarget(null)} disabled={isResetting}>
              Annuler
            </Button>
            <Button
              onClick={confirmReset}
              disabled={isResetting}
              className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isResetting && <Loader2 className="h-4 w-4 animate-spin" />}
              Envoyer le nouveau mot de passe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog confirmation suppression */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer le compte ?</DialogTitle>
            <DialogDescription>
              Le compte de{" "}
              <span className="font-semibold">
                {deleteTarget?.title} {deleteTarget?.firstName} {deleteTarget?.lastName}
              </span>{" "}
              ({deleteTarget?.email}) sera supprimé définitivement. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
