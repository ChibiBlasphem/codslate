import findUp from 'find-up';
import fs from 'fs';
import path from 'path';

export function getConfigFile() {
  return findUp.sync(['.codslaterc', '.codslaterc.json']);
}

export function getConfig() {
  const configFile = getConfigFile();
  return configFile ? JSON.parse(fs.readFileSync(configFile, 'utf-8')) : {};
}

export function writeConfig(config: {}) {
  let configFile = getConfigFile();
  if (!configFile) {
    configFile = path.resolve(process.cwd(), '.codslaterc.json');
  }

  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}
