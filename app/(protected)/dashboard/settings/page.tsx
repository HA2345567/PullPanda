import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";

export const instant = false;

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader
        title="Settings"
        description="Manage workspace preferences"
      />
      <div className="flex-1 p-4 md:p-6" />
    </div>
  );
}
