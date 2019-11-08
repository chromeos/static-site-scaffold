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
const gulpif = require('gulp-if');
const workboxBuild = require('workbox-build');
const eslint = require('gulp-eslint');
const path = require('path');
const sync = require('browser-sync');
const cache = require('gulp-cached');
const { folders, serviceWorker, manifest } = require('config');

const production = process.env.NODE_ENV === 'production';

const srcServiceWorker = path.join(folders.source, serviceWorker.src);
const srcManifest = path.join(folders.source, manifest.src);
const destServiceWorker = path.join(folders.output, serviceWorker.dest);
const srcExternal = [path.join(folders.output, '**/*.{js,html}'), `!${destServiceWorker}`];

/**
 * Reusable function to generate a Workbox precache for determined files
 *
 * @return {object} injected resources
 */
async function updateWorkbox() {
  try {
    const resources = await workboxBuild.injectManifest({
      swSrc: srcServiceWorker,
      swDest: destServiceWorker,
      globDirectory: folders.output,
      globPatterns: serviceWorker.pattern,
    });

    console.log(`Injected ${resources.count} resources for precaching`);
    if (resources.warnings.length) {
      console.log(`Workbox finished with ${resources.warnings.length} warning(s)`);
    }
    return resources;
  } catch (e) {
    console.log('Uh oh 😬\n', e);
  }
}

/**
 * Lints Service Worker and moves Manifest file and Service Worker over, and updates Service Worker
 *
 * @param {object} gulp - User instance of Gulp
 *
 * @return {function} Gulp task to lint the Service Worker and move and compile the Service Worker and Web App Manifest
 */
function pwaTask(gulp) {
  return function updateManifestAndServiceWorker() {
    return gulp
      .src([srcManifest, srcServiceWorker])
      .pipe(gulpif(file => path.basename(file.path) === 'sw.js', eslint()))
      .pipe(eslint.format())
      .pipe(gulpif(production, eslint.failAfterError()))
      .pipe(gulp.dest(folders.output))
      .pipe(sync.stream())
      .on('end', updateWorkbox);
  };
}

/**
 * Watches files compiled from 11ty and Rollup to reload the server and rebuild the Service Worker
 *
 * @param {object} gulp - User instance of Gulp
 *
 * @return {object} Gulp watch object
 */
function externalRebuildTask(gulp) {
  return function rebuildServiceWorker() {
    return gulp.watch(srcExternal, () =>
      gulp
        .src(srcExternal)
        .pipe(cache('server'))
        .pipe(sync.stream())
        .on('end', updateWorkbox),
    );
  };
}

module.exports = {
  workbox: updateWorkbox,
  pwaTask,
  externalRebuildTask,
};
