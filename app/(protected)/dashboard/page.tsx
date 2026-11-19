import { DashboardHeader } from "@/app/features/dashboard/components/dashboard-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const instant = false;

const overviewItems = [
  {
    title: "Repositories",
    description: "Connect and manage GitHub repositories.",
  },
  {
    title: "Pull requests",
    description: "Review AI-generated findings and suggestions.",
  },
  {
    title: "GitHub App",
    description: "Configure repository access and installations.",
  },
] as const;

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader
        title="Overview"
        description="Your code review workspace"
      />
      <div className="flex-1 p-4 md:p-6">
        <div className="mx-auto grid w-full max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {overviewItems.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
