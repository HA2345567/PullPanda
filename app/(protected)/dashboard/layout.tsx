

import { requireAuth } from "@/app/features/auth/actions";
import { DashboardShell } from "@/app/features/dashboard/components/dashboard-shell";

export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <DashboardShell user={session.user}>
      {children}
    </DashboardShell>
  );
}
