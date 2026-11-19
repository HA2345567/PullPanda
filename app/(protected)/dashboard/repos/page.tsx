import { DashboardHeader } from "@/app/features/dashboard/components/dashboard-header";

export const instant = false;

export default function RepositoriesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader
        title="Repositories"
        description="Manage connected repositories"
      />
      <div className="flex-1 p-4 md:p-6" />
    </div>
  );
}
