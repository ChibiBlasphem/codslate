import { mocked } from 'ts-jest/utils';
import { createRepo, repoExists } from 'helpers/octokit';
import { writeConfig, getConfigFile } from 'helpers/config';
import { runCommand } from '../../jest/helpers';
import * as init from './init';

const user = { id: 1, username: 'kiki' };

describe('init command', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should not create repo if it exists on github', async () => {
    const projectName = 'mock-project';
    const config = { projectName, userType: 'user' } as const;

    mocked(repoExists).mockImplementationOnce(() => Promise.resolve(true));

    await runCommand(init, { ...config, user });

    expect(createRepo).not.toHaveBeenCalled();
  });

  describe('create a project as user', () => {
    it('Should call github to create repo and not write config if it exists', async () => {
      const projectName = 'mock-project';
      const config = { projectName, userType: 'user' } as const;

      await runCommand(init, { ...config, user });

      expect(createRepo).toHaveBeenCalledTimes(1);
      expect(createRepo).toHaveBeenCalledWith(projectName, undefined);

      expect(mocked(writeConfig)).not.toHaveBeenCalled();
    });

    it('Should call github to create repo and write config if it does not exist', async () => {
      const projectName = 'mock-project';
      const config = { projectName, userType: 'user' } as const;

      mocked(getConfigFile).mockImplementationOnce(() => undefined);

      await runCommand(init, { ...config, user });

      expect(createRepo).toHaveBeenCalledTimes(1);
      expect(createRepo).toHaveBeenCalledWith(projectName, undefined);

      expect(mocked(writeConfig)).toHaveBeenCalledTimes(1);
      expect(mocked(writeConfig)).toHaveBeenCalledWith(config);
    });
  });

  describe('create a project as an organization', () => {
    it('Should call github to create repo and not write config if it exists', async () => {
      const projectName = 'mock-project';
      const organizationName = 'mock-org';
      const config = { projectName, userType: 'organization', organizationName } as const;

      await runCommand(init, { ...config, user });

      expect(createRepo).toHaveBeenCalledTimes(1);
      expect(createRepo).toHaveBeenCalledWith(projectName, organizationName);

      expect(mocked(writeConfig)).not.toHaveBeenCalled();
    });

    it('Should call github to create repo and write config if it does not exist', async () => {
      const projectName = 'mock-project';
      const organizationName = 'mock-org';
      const config = { projectName, userType: 'organization', organizationName } as const;

      mocked(getConfigFile).mockImplementationOnce(() => undefined);

      await runCommand(init, { ...config, user });

      expect(createRepo).toHaveBeenCalledTimes(1);
      expect(createRepo).toHaveBeenCalledWith(projectName, organizationName);

      expect(mocked(writeConfig)).toHaveBeenCalledTimes(1);
      expect(mocked(writeConfig)).toHaveBeenCalledWith(config);
    });
  });
});
