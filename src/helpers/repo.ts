import fs from 'fs';
import simpleGit from 'simple-git';

export const git = simpleGit();

export function hasBeenCloned(localPath: string): boolean {
  return fs.existsSync(localPath);
}

export async function cloneRepo(url: string, localPath: string): Promise<void> {
  await git.clone(url, localPath);
}

export async function createAndPushInitialCommit(pathToRepo: string): Promise<void> {
  const git = simpleGit(pathToRepo);

  await git.commit('initial commit', ['--allow-empty']);
  await git.branch(['-M', 'main']);
  await git.push('origin', 'main');
}
