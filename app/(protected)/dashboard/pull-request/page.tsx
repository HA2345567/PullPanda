import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { requireAuth } from "@/features/auth/actions";
import { getUserInstallationId } from "@/features/github/server/intallation";
import { PrReviewList } from "@/features/reviews/components/pr-review-list";
import { prisma } from "@/lib/db";

export const instant = false;

export default async function PullRequestsPage() {
  const session = await requireAuth();
  const installationId = await getUserInstallationId(session.user.id);

  const rawPrs = installationId
    ? await prisma.pullRequest.findMany({
        where: { installationId },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const pullRequests = rawPrs.map((pr) => ({
    id: pr.id,
    repoFullName: pr.repoFullName,
    prNumber: pr.prNumber,
    title: pr.title,
    authorLogin: pr.authorLogin,
    headSha: pr.headSha,
    baseBranch: pr.baseBranch,
    status: pr.status,
    reviewComment: pr.reviewComment,
    reviewAt: pr.reviewAt ? pr.reviewAt.toISOString() : null,
    createdAt: pr.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader
        title="Pull Requests"
        description="AI code reviews and webhook activity across your repositories"
      />
      <PrReviewList
        pullRequests={pullRequests}
        connected={Boolean(installationId)}
      />
    </div>
  );
}
