import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import configExternalDependencies from 'rollup-config-external-dependencies';

const external = configExternalDependencies(require('./package.json'));
const extensions = ['.ts', '.js'];
const haltWarnings = [
  'NON_EXISTENT_EXPORT',
  'UNUSED_EXTERNAL_IMPORT',
  'UNRESOLVED_IMPORT',
];

export default {
  input: './src/index.ts',
  output: {
    file: 'lib/index.js',
    format: 'cjs',
  },
  external,

  onwarn(warning, warn) {
    if (haltWarnings.includes(warning.code)) {
      throw new Error(warning.message);
    }
    warn(warning);
  },

  plugins: [
    nodeResolve({
      extensions,
    }),
    babel({ extensions, babelHelpers: 'bundled' }),
  ],
};
