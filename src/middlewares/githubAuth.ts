import { token, getAuthenticatedUser } from 'helpers/octokit';
import { Arguments } from 'yargs';

export async function githubAuth(argv: Arguments<any>) {
  const currentUser = await getAuthenticatedUser();
  if (!currentUser) {
    if (token) {
      console.error('Could not authenticate you with the provided access token');
    } else {
      console.error('No token was found to authenticate you. GH_TOKEN or GITHUB_TOKEN must be set');
    }
    process.exit(1);
  }

  argv.user = currentUser;
}
