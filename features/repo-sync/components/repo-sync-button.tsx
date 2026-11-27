"use client";

import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCwIcon, CheckIcon, AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RepoSyncStatus } from "@/features/dashboard/lib/type";
import { githubRepoKeys } from "@/features/github/lib/repo-query";
import { syncRepotoCodebase } from "../actions/repo-sync";

type SyncRepoButtonProps = {
  repoFullName: string;
  branch: string;
  syncStatus: RepoSyncStatus | null;
};

export function SyncRepoButton({
  repoFullName,
  branch,
  syncStatus,
}: SyncRepoButtonProps) {
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const isSyncing = isPending || syncStatus === "pending" || syncStatus === "syncing";

  function handleSync() {
    startTransition(async () => {
      await syncRepotoCodebase(repoFullName, branch);
      await queryClient.invalidateQueries({ queryKey: githubRepoKeys.all });
    });
  }

  let label = "Sync";
  let Icon = RefreshCwIcon;

  if (isSyncing) {
    label = "Syncing…";
  } else if (syncStatus === "synced") {
    label = "Synced";
    Icon = CheckIcon;
  } else if (syncStatus === "failed") {
    label = "Retry";
    Icon = AlertCircleIcon;
  }

  return (
    <Button
      size="sm"
      variant={syncStatus === "synced" ? "outline" : "default"}
      disabled={isSyncing}
      onClick={handleSync}
    >
      <Icon className={isSyncing ? "size-3 animate-spin" : "size-3"} />
      {label}
    </Button>
  );
}
