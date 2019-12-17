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
const ISO6391 = require('iso-639-1');
const fs = require('fs');
const path = require('path');
const config = require('config');
const { outputFile } = require('fs-extra');

const languages = fs
  .readdirSync(path.join(__dirname, '..'))
  .filter(f => fs.lstatSync(path.join(__dirname, '..', f)).isDirectory())
  .filter(f => ISO6391.validate(f))
  .map(f => require(path.join(__dirname, '..', f, `${f}.json`)).locale.code)
  .sort(a => {
    if (a === 'en') return -1;
    return 0;
  });

const output = path.join(process.cwd(), config.folders.output, 'js/languages.js');

outputFile(output, `const languages = ${JSON.stringify(languages)};`, err => {
  if (err) console.error(err);
});

module.exports = {
  languages,
};
