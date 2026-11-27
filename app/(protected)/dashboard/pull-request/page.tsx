import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";

export const instant = false;

export default function PullRequestsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader
        title="Pull requests"
        description="Review open pull requests"
      />
      <div className="flex-1 p-4 md:p-6" />
    </div>
  );
}
