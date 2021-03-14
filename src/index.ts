import yargs from 'yargs';
import { getConfig } from 'helpers/config';
import { commands } from 'commands';
import { githubAuth } from 'middlewares/githubAuth';

const config = getConfig();

let cli = yargs(process.argv.slice(2)).config(config);

cli = commands.reduce((y, command) => y.command(command), cli);

cli.middleware([githubAuth]).argv;
