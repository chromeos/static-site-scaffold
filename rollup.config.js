/* eslint-env node */
const nodeResolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const babel = require('rollup-plugin-babel');
const { eslint } = require('rollup-plugin-eslint');

const production = process.env.NODE_ENV === 'production';

const plugins = [];

plugins.push(
  replace({
    // 'process.env.NODE_ENV': `'${JSON.stringify(process.env.NODE_ENV).replace(/\"/gm, '')}'`,
    PRODUCTION: production,
  }),
);

plugins.push(nodeResolve());

plugins.push(
  eslint({
    throwOnError: production,
  }),
);

plugins.push(babel());

export default {
  input: {
    'js/main': 'src/js/main.js',
    // sw: 'src/sw.js',
  },
  plugins,

  output: {
    format: 'esm',
    sourcemap: true,
    dir: 'public',
  },
};
