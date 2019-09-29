/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-env node */
const nodeResolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const babel = require('rollup-plugin-babel');
const { eslint } = require('rollup-plugin-eslint');

const production = process.env.NODE_ENV === 'production';

const plugins = [];

plugins.push(
  replace({
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

module.exports = {
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
