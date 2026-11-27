"use server";

import { getServerSession } from "../../auth/actions";
import { redirect } from "next/navigation";
import { DASHBOARD_ROUTES } from "../../dashboard/lib/routes";
import { deleteInstallation } from "../server/intallation";




export async function disconnectGithubApp() {
    const session = await getServerSession();
  
    if (!session) {
      redirect("/sign-in");
      return;
    }
  
    await deleteInstallation(session.user.id);
    redirect(DASHBOARD_ROUTES.github);
  }