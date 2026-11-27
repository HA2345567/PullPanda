import { getServerSession } from "@/features/auth/actions";
import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import { saveInstallation } from "@/features/github/server/intallation";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";




function buildSignInCallbackUrl(installationId: string | null): string {
    if (installationId) {
      return `/api/github/callback?installation_id=${installationId}`;
    }
  
    return DASHBOARD_ROUTES.github;
  }

export async function GET(request: Request){
    const {searchParams} = new URL(request.url);

    const installationId = searchParams.get("installation_id");
    const state = searchParams.get("state");
    const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

    const session = await getServerSession();
    let userId = session?.user.id ?? null;

    if (!userId && state) {
        const user = await prisma.user.findUnique({
            where: { id: state },
            select: { id: true },
        });
        userId = user?.id ?? null;
    }

    if (!userId) {
        const callbackUrl = buildSignInCallbackUrl(installationId);
        return redirect(`${baseUrl}/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }

    if(installationId){
        await saveInstallation(userId, Number(installationId))
    }

    redirect(`${baseUrl}${DASHBOARD_ROUTES.github}`)
}