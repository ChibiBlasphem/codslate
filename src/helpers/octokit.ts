import { Octokit } from '@octokit/rest';

export type GithubUser = {
  id: number;
  username: string;
};

export type GithubRepo = {
  id: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  defaultBranch: string;
};

export const token = process.env['GH_TOKEN'] || process.env['GITHUB_TOKEN'];

export const octokit = new Octokit({
  auth: token,
});

export async function createRepo(repoName: string, organizationName?: string): Promise<void> {
  await octokit.request(organizationName ? 'POST /orgs/{org}/repos' : 'POST /user/repos', {
    org: organizationName,
    name: repoName,
  });
}

export async function repoExists(owner: string, repo: string): Promise<boolean> {
  return false;
  // try {
  //   await octokit.repos.get({ owner, repo });
  //   return true;
  // } catch (err) {
  //   return false;
  // }
}

export async function getRepo(owner: string, repo: string): Promise<GithubRepo | undefined> {
  try {
    const {
      data: { id, name, full_name, html_url, default_branch },
    } = await octokit.repos.get({ owner, repo });
    return {
      id,
      name,
      fullName: full_name,
      htmlUrl: html_url,
      defaultBranch: default_branch,
    };
  } catch (err) {
    return undefined;
  }
}

export async function getAuthenticatedUser(): Promise<GithubUser | undefined> {
  try {
    const {
      data: { id, login },
    } = await octokit.users.getAuthenticated();
    return {
      id,
      username: login,
    };
  } catch (err) {
    return undefined;
  }
}
