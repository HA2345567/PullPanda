

// import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";

import { requireAuth } from "@/app/features/auth/actions";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    {children}
  );
}
