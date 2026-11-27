import Link from "next/link";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { requireAuth } from "@/features/auth/actions";
import { getInstallationStatus } from "@/features/github/server/intallation";
import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import { statusBadge } from "@/features/dashboard/lib/status-style";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const instant = false;

export default async function SettingsPage() {
  const session = await requireAuth();
  const installation = await getInstallationStatus(session.user.id);

  const pineconeIndex = process.env.PINECONE_INDEX_NAME ?? "Not configured";
  const openRouterConfigured = Boolean(process.env.OPENROUTER_API_KEY);
  const webhookConfigured = Boolean(process.env.GITHUB_APP_WEBHOOK_SECRET);

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader
        title="Settings"
        description="Account, GitHub App, and AI review pipeline configuration"
      />
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="mx-auto grid w-full max-w-4xl gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Signed-in developer profile</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium">{session.user.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{session.user.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>GitHub App Integration</CardTitle>
                <CardDescription>
                  App slug: {process.env.GITHUB_APP_SLUG ?? "pullpanda-dev"}
                </CardDescription>
              </div>
              <span
                className={statusBadge(
                  installation.connected ? "success" : "warning"
                )}
              >
                {installation.connected ? "Connected" : "Disconnected"}
              </span>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">
                {installation.connected && installation.accountLogin
                  ? `Installed for @${installation.accountLogin}`
                  : "No GitHub installation linked yet."}
              </div>
              <Link
                href={DASHBOARD_ROUTES.github}
                className="text-xs font-medium text-primary hover:underline"
              >
                Manage connection
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI & RAG Pipeline</CardTitle>
              <CardDescription>
                Environment health for codebase indexing and PR reviews
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">OpenRouter AI</p>
                <span
                  className={statusBadge(
                    openRouterConfigured ? "success" : "danger"
                  )}
                >
                  {openRouterConfigured ? "Configured" : "Missing"}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Pinecone Index</p>
                <p className="font-mono text-xs font-medium">{pineconeIndex}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Webhook Secret</p>
                <span
                  className={statusBadge(
                    webhookConfigured ? "success" : "danger"
                  )}
                >
                  {webhookConfigured ? "Configured" : "Missing"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
