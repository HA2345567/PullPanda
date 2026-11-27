"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  GitBranchIcon,
  GitPullRequestIcon,
  MessageSquareTextIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import { statusBadge } from "@/features/dashboard/lib/status-style";

export type DashboardPullRequest = {
  id: string;
  repoFullName: string;
  prNumber: number;
  title: string;
  authorLogin: string | null;
  headSha: string;
  baseBranch: string;
  status: string;
  reviewComment: string | null;
  reviewAt: string | null;
  createdAt: string;
};

type Filter = "all" | "reviewed" | "processing" | "pending";

function getStatusTone(status: string) {
  if (status === "reviewed") return "success" as const;
  if (status === "processing") return "info" as const;
  if (status === "rate_limited" || status === "failed") return "danger" as const;
  return "warning" as const;
}

export function PrReviewList({
  pullRequests,
  connected,
}: {
  pullRequests: DashboardPullRequest[];
  connected: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      all: pullRequests.length,
      reviewed: pullRequests.filter((pr) => pr.status === "reviewed").length,
      processing: pullRequests.filter((pr) => pr.status === "processing").length,
      pending: pullRequests.filter((pr) => pr.status === "pending").length,
    }),
    [pullRequests]
  );

  const visiblePrs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return pullRequests.filter((pr) => {
      if (filter !== "all" && pr.status !== filter) return false;
      if (
        query &&
        !pr.title.toLowerCase().includes(query) &&
        !pr.repoFullName.toLowerCase().includes(query) &&
        !String(pr.prNumber).includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [pullRequests, filter, search]);

  if (!connected) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <GitPullRequestIcon className="size-8 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium">GitHub App not connected</p>
          <p className="text-xs text-muted-foreground">
            Install the PullPanda GitHub App to start receiving and reviewing pull requests.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href={DASHBOARD_ROUTES.github} />}>
          Go to GitHub App
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed ({counts.reviewed})</TabsTrigger>
            <TabsTrigger value="processing">Processing ({counts.processing})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          placeholder="Search PRs by title, repo, or #…"
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-none border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pull Request</TableHead>
              <TableHead>Repository</TableHead>
              <TableHead>Base</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Received</TableHead>
              <TableHead className="text-right">Review</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visiblePrs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  {pullRequests.length === 0
                    ? "No pull requests received yet. Open or update a PR on a connected repository to trigger an AI review."
                    : "No pull requests match your filter."}
                </TableCell>
              </TableRow>
            ) : (
              visiblePrs.map((pr) => {
                const isExpanded = expandedId === pr.id;
                return (
                  <Fragment key={pr.id}>
                    <TableRow>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">
                            #{pr.prNumber} {pr.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {pr.authorLogin ? `@${pr.authorLogin} · ` : ""}
                            {pr.headSha.slice(0, 7)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {pr.repoFullName}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <GitBranchIcon className="size-3" />
                          {pr.baseBranch}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={statusBadge(getStatusTone(pr.status))}>
                          {pr.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDistanceToNow(new Date(pr.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        {pr.reviewComment ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setExpandedId(isExpanded ? null : pr.id)}
                          >
                            <MessageSquareTextIcon className="size-3" />
                            {isExpanded ? "Hide" : "View"}
                            {isExpanded ? (
                              <ChevronUpIcon className="size-3" />
                            ) : (
                              <ChevronDownIcon className="size-3" />
                            )}
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                    {isExpanded && pr.reviewComment ? (
                      <TableRow key={`${pr.id}-review`} className="bg-muted/30 hover:bg-muted/30">
                        <TableCell colSpan={6} className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">
                                AI Review Output
                              </span>
                              {pr.reviewAt ? (
                                <span>
                                  Reviewed{" "}
                                  {formatDistanceToNow(new Date(pr.reviewAt), {
                                    addSuffix: true,
                                  })}
                                </span>
                              ) : null}
                            </div>
                            <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-background p-3 font-sans text-xs leading-relaxed">
                              {pr.reviewComment}
                            </pre>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
