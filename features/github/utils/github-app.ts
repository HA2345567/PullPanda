
import {App} from "octokit";

let githubApp: App | null = null;

export function getGithubApp(){
    if(!githubApp){
        githubApp = new App({
            appId: process.env.GITHUB_APP_ID as string,
            privateKey: process.env.GITHUB_APP_PRIVATE_KEY as string,
            webhooks: {
                secret: process.env.GITHUB_APP_WEBHOOK_SECRET as string,
            },
        })
    }
    return githubApp;
}

export function getGithubInstallUrl(userId: string) {
    const appSlug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG || process.env.GITHUB_APP_SLUG || "pullpanda-dev";
    const url = new URL(`https://github.com/apps/${appSlug}/installations/new`);
    url.searchParams.set("state", userId);
    return url.toString();
}

