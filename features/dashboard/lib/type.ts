

export type RepoSyncStatus = "pending" | "syncing" | "synced" | "failed";

/** Whether a repository is visible to everyone or only to collaborators. */
export type RepoVisibility = "public" | "private";

export type DashboardRepo={
    id:string,
    name: string,
    fullName:string,
    visibility: RepoVisibility;
    defaultBranch: string;
    description?: string;
    updatedAt:string;
    language:string | null;
    stars: number;
    syncStatus?: RepoSyncStatus | null;
};

export type GithubInstallationStatus = {
    connected: boolean;
    accountLogin: string | null;
    installedAt: string | null;
};

export type SubscriptionPlan = "free" | "pro";

export type UserSubscription = {
    plan: SubscriptionPlan;
    status: "active" | "canceled" | "past_due" | "unpaid";
    renewAt:string | null;
}

