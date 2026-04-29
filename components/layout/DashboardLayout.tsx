import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import type { UserRole } from "@/lib/types/domain";

type DashboardLayoutProps = {
  role: UserRole;
  fullName: string;
  children: React.ReactNode;
};

export function DashboardLayout({ role, fullName, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-surface-light lg:flex">
      <Sidebar role={role} />
      <div className="flex-1 p-4 lg:p-6">
        <TopBar fullName={fullName} role={role} />
        <main className="mt-4 mx-auto w-full max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
