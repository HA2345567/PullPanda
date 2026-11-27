import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  DatabaseIcon,
  GitForkIcon,
  GitPullRequestIcon,
  SparklesIcon,
} from "lucide-react";

import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import { statusBadge } from "@/features/dashboard/lib/status-style";
import { requireAuth } from "@/features/auth/actions";
import {
  getInstallationStatus,
  getUserInstallationId,
} from "@/features/github/server/intallation";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const instant = false;

export default async function DashboardPage() {
  const session = await requireAuth();
  const [installationStatus, installationId] = await Promise.all([
    getInstallationStatus(session.user.id),
    getUserInstallationId(session.user.id),
  ]);

  const [syncedReposCount, chunkAggregate, totalPrs, reviewedPrs, recentPrs] =
    installationId
      ? await Promise.all([
          prisma.repoSync.count({
            where: { installationId, status: "synced" },
          }),
          prisma.repoSync.aggregate({
            where: { installationId, status: "synced" },
            _sum: { chunkCount: true },
          }),
          prisma.pullRequest.count({ where: { installationId } }),
          prisma.pullRequest.count({
            where: { installationId, status: "reviewed" },
          }),
          prisma.pullRequest.findMany({
            where: { installationId },
            orderBy: { createdAt: "desc" },
            take: 5,
          }),
        ])
      : [0, { _sum: { chunkCount: 0 } }, 0, 0, []];

  const totalChunks = chunkAggregate._sum.chunkCount ?? 0;

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader
        title="Overview"
        description="Your PullPanda AI code review workspace"
      />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="mx-auto grid w-full max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between">
                <span>GitHub App</span>
                <GitForkIcon className="size-4 text-primary" />
              </CardDescription>
              <CardTitle className="text-xl">
                {installationStatus.connected ? "Connected" : "Not connected"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {installationStatus.connected && installationStatus.accountLogin
                ? `@${installationStatus.accountLogin}`
                : "Install PullPanda on your GitHub account"}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between">
                <span>Synced Codebases</span>
                <DatabaseIcon className="size-4 text-primary" />
              </CardDescription>
              <CardTitle className="text-xl">{syncedReposCount}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {totalChunks.toLocaleString()} code chunks indexed
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between">
                <span>Pull Requests</span>
                <GitPullRequestIcon className="size-4 text-primary" />
              </CardDescription>
              <CardTitle className="text-xl">{totalPrs}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {reviewedPrs} AI reviews completed
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between">
                <span>Review Pipeline</span>
                <SparklesIcon className="size-4 text-primary" />
              </CardDescription>
              <CardTitle className="flex items-center gap-1.5 text-xl">
                <CheckCircle2Icon className="size-4 text-primary" />
                Active
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Pinecone RAG + OpenRouter AI
            </CardContent>
          </Card>
        </div>

        <div className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Pull Requests</CardTitle>
                <CardDescription>
                  Latest webhook events and AI review status
                </CardDescription>
              </div>
              <Link
                href={DASHBOARD_ROUTES.pullRequest}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all
                <ArrowRightIcon className="size-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentPrs.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  No pull requests received yet. Open a PR on a connected repository to see reviews here.
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {recentPrs.map((pr) => (
                    <div
                      key={pr.id}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          #{pr.prNumber} {pr.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {pr.repoFullName} ·{" "}
                          {formatDistanceToNow(pr.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                      <span
                        className={statusBadge(
                          pr.status === "reviewed"
                            ? "success"
                            : pr.status === "processing"
                              ? "info"
                              : "warning"
                        )}
                      >
                        {pr.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <Link href={DASHBOARD_ROUTES.repos} className="block">
              <Card className="transition-colors hover:border-primary/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>Repositories</span>
                    <ArrowRightIcon className="size-4 text-muted-foreground" />
                  </CardTitle>
                  <CardDescription>
                    Browse connected repos and sync codebases for RAG context.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href={DASHBOARD_ROUTES.pullRequest} className="block">
              <Card className="transition-colors hover:border-primary/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>Pull Requests</span>
                    <ArrowRightIcon className="size-4 text-muted-foreground" />
                  </CardTitle>
                  <CardDescription>
                    Inspect AI-generated reviews, status, and PR comments.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href={DASHBOARD_ROUTES.github} className="block">
              <Card className="transition-colors hover:border-primary/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>GitHub App</span>
                    <ArrowRightIcon className="size-4 text-muted-foreground" />
                  </CardTitle>
                  <CardDescription>
                    Manage installation access and repository permissions.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
