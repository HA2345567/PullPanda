import { getGithubApp } from "../utils/github-app";

export async function getInstallationRepositories(installationId: number) {
  const app = getGithubApp();
  const octokit = await app.getInstallationOctokit(installationId);
  const { data } = await octokit.request("GET /installation/repositories");
  return data.repositories;
}
