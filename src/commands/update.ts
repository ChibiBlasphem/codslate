import simpleGit, { SimpleGit } from 'simple-git';
import gitUrlParse from 'git-url-parse';
import { getRepo } from 'helpers/octokit';
import { Arguments } from 'yargs';
import { GlobalArgs } from 'types';

type SyncCommandArguments = {
  defaultBranch?: string;
};

export const command = 'update';

export const describe = 'Update your translation branch with default branch';

const getDefaultBranch = async (git: SimpleGit) => {
  const remotes = await git.getRemotes(true);
  const originRemote = remotes.find((remote) => remote.name === 'origin');

  if (!originRemote) {
    throw new Error('Could not find origin remote');
  }

  const { owner, name } = gitUrlParse(originRemote.refs.fetch);
  const githubRepository = await getRepo(owner, name);

  if (!githubRepository) {
    throw new Error('Something went wrong when trying to get remote repository informations');
  }

  return githubRepository.defaultBranch;
};

export const handler = async ({ $0, _, ...args }: Arguments<GlobalArgs & SyncCommandArguments>) => {
  // Is branch default branch?
  // Yes: No need to sync anything
  // No:
  //    Is the branch already exists on the translation repo ?
  //    Yes: Merge main branch into "current branch" in translation repo
  //    No: Create it from master

  const projectGit = simpleGit('.');
  const defaultBranch = args.defaultBranch
    ? args.defaultBranch
    : await getDefaultBranch(projectGit);
  const currentBranch = (await projectGit.branch()).current;

  // No need to update if we are on the default branch
  if (defaultBranch === currentBranch) {
    console.log('You are on the default branch, no need to update the translation repo');
    return;
  }

  const translationGit = simpleGit('./dump-clone');
  const translationBranches = await translationGit.branch();

  const localTranslationBranch = translationBranches.branches[currentBranch];

  // Fetching remote git status
  await translationGit.fetch(['origin', '--prune']);

  if (!localTranslationBranch) {
    const remoteTranslationBranch = translationBranches.branches[`remotes/origin/${currentBranch}`];
    if (!remoteTranslationBranch) {
      // Create a new branch from default branch and push it
      const headCommit = translationBranches.branches['remotes/origin/main']?.commit;
      if (!headCommit) {
        console.error(
          'Something went wrong. We could not find remote main branch for translation repository'
        );
        process.exit(1);
      }

      await translationGit.checkout(['-b', currentBranch, headCommit]);
      await translationGit.push('origin', currentBranch, ['-u']);
      return;
    } else {
      await translationGit.checkout(['-b', currentBranch, remoteTranslationBranch.commit]);
    }
  } else {
    if (translationBranches.current !== currentBranch) {
      await translationGit.checkout([currentBranch]);
    }
    await translationGit.pull('origin', currentBranch);
  }

  // We now need to rebase main branch
  try {
    await translationGit.rebase(['origin/main']);
    console.log('Translation branch updated');
  } catch (err) {
    // What do we want to do when rebase fail?
    await translationGit.rebase(['--abort']);
  }
};
