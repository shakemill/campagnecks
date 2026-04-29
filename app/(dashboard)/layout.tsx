import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default async function MainDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.mustChangePassword) {
    redirect("/change-password");
  }

  return (
    <DashboardLayout role={session.user.role} fullName={session.user.name ?? "Utilisateur"}>
      {children}
    </DashboardLayout>
  );
}
