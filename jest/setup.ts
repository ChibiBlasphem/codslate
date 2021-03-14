type Inquirer = typeof import('inquirer');

jest.mock('inquirer', () => {
  return {
    __esModule: true,
    prompt: jest.fn<unknown, Parameters<Inquirer['prompt']>>((_q, initialAnswers) =>
      Promise.resolve(initialAnswers ?? {})
    ),
  };
});

jest.mock('helpers/octokit', () => {
  const originalModule = jest.requireActual('helpers/octokit');

  return {
    __esModule: true,
    ...originalModule,

    createRepo: jest.fn(() => Promise.resolve()),
    getRepo: jest.fn(() =>
      Promise.resolve({
        id: 1,
        name: 'repo',
        fullName: 'owner/repo',
        htmlUrl: 'https://github.com/owner/repo',
      })
    ),
    repoExists: jest.fn(() => Promise.resolve(false)),
  };
});

jest.mock('helpers/config', () => {
  return {
    __esModule: true,
    getConfigFile: jest.fn<string | undefined, []>(() => 'path-to-config'),
    writeConfig: jest.fn<void, any>(),
  };
});

jest.mock('helpers/repo', () => {
  return {
    __esModule: true,
    hasBeenCloned: jest.fn<boolean, [string]>(() => true),
    cloneRepo: jest.fn<Promise<void>, [string, string]>(() => Promise.resolve()),
  };
});
