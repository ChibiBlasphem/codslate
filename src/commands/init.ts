import path from 'path';
import { prompt } from 'inquirer';
import { Arguments, CommandBuilder } from 'yargs';
import { GlobalArgs } from 'types';
import { getConfigFile, writeConfig } from 'helpers/config';
import { createRepo, getRepo, repoExists } from 'helpers/octokit';
import { cloneRepo, createAndPushInitialCommit, hasBeenCloned } from 'helpers/repo';
import { questions, InitAnswers } from './questions/init';

export const command = 'init';

export const describe = 'Initialize a translation project';

export const builder: CommandBuilder<any, GlobalArgs & InitAnswers> = {
  projectName: {
    type: 'string',
    normalize: false,
  },
  userType: {
    type: 'string',
    choices: ['user', 'organization'],
  },
  organizationName: {
    type: 'string',
    normalize: false,
  },
};

export const handler = async ({ _, $0, user, ...config }: Arguments<GlobalArgs & InitAnswers>) => {
  // Asking questions to user to init the project
  const answers = await prompt<InitAnswers>(questions, config);

  const repoOwner = answers.userType === 'user' ? user.username : answers.organizationName;
  const repoName = answers.projectName;
  const doesRepoExists = await repoExists(repoOwner, repoName);

  // Create github repo if it does not exist
  if (!doesRepoExists) {
    const orgName = 'organizationName' in answers ? answers.organizationName : undefined;
    await createRepo(repoName, orgName);
  }

  const repository = await getRepo(repoOwner, repoName);
  if (!repository) {
    console.error('Something went wrong while trying to get the repository');
    process.exit(1);
  }

  // Pull repository if it hasn't been pulled
  const repoLocalPath = path.resolve(process.cwd(), 'dump-clone');
  if (!hasBeenCloned(repoLocalPath)) {
    await cloneRepo(repository.htmlUrl, repoLocalPath);
    await createAndPushInitialCommit(repoLocalPath);
  }

  // If repo is "new" write a first commit to init default branch

  // Write config informations so we don't ask the user again
  if (!getConfigFile()) {
    writeConfig({
      projectName: answers.projectName,
      userType: answers.userType,
      ...('organizationName' in answers ? { organizationName: answers.organizationName } : {}),
    });
  }
};
