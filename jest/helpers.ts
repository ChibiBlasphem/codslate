import yargs, { Arguments, CommandModule } from 'yargs';

type ExtractArguments<T> = T extends CommandModule<any, infer U> ? U : never;

const makeArguments = <T>(args: T): Arguments<T> => {
  return {
    $0: '',
    _: [],
    ...args,
  };
};

export const runCommand = <T extends CommandModule<any, any>>(
  command: T,
  config: ExtractArguments<T>
): Promise<void> => {
  const args = makeArguments(config);
  return command.handler(args) as any;
};
