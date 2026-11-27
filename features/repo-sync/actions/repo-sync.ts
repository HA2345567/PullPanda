"use server"

import { redirect } from "next/navigation";
import { getServerSession } from "../../auth/actions";

import { DASHBOARD_ROUTES } from "../../dashboard/lib/routes";
import { getUserInstallationId } from "@/features/github/server/intallation";
import { triggerRepoSync } from "../server/repo-sync";





export async function syncRepotoCodebase(repoFullName:string, branch: string){
    const session= await getServerSession();

    if(!session){
        return redirect("/sign-in");
    }

    const installationId = await getUserInstallationId(session.user.id);

    if(!installationId){
        return redirect(DASHBOARD_ROUTES.github);
    }

    await triggerRepoSync(installationId, repoFullName, branch);
}