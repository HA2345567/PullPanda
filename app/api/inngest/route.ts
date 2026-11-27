// src/app/api/inngest/route.ts
import { inngest } from "@/features/inngest/client";
import { serve } from "inngest/next";
import { processTask } from "./function";
import { reviewPullRequest } from "@/features/reviews/server/review-pr-function";
import { syncRepoCodebase } from "@/features/repo-sync/server/repo-sync-function";




export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processTask, reviewPullRequest,syncRepoCodebase]
});