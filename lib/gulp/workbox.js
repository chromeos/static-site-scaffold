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

const production = process.env.NODE_ENV === 'production';

/**
 * Reusable function to generate a Workbox precache for determined files
 *
 * @param {object} config - Configuration object for the function
 * @param {string} config.src - Location of the Service Worker source file
 * @param {string} config.dest - Location to place the output Service Worker file
 * @param {string} config.dir - The directory for Workbox to glob for files to precache
 * @param {array<string>} config.pattern - The glob patterns for Workbox to precache
 *
 * @return {object} injected resources
 */
async function updateWorkbox(config = { src: 'src/sw.js', dest: 'public/sw.js', dir: 'public', pattern: ['css/**/*.css', 'js/**/*.js', 'index.html'] }) {
  try {
    const resources = await workboxBuild.injectManifest({
      swSrc: config.src,
      swDest: config.dest,
      globDirectory: config.dir,
      globPatterns: config.pattern,
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
 * @param {object} config - Configuration for this function
 * @param {array<string>} config.src - Location of the source Web App Manifest and Service Worker files
 * @param {string} config.dest - Location to place files when moved
 * @param {function} config.workbox - Workbox build function to use
 *
 * @return {function} Gulp task to lint the Service Worker and move and compile the Service Worker and Web App Manifest
 */
function pwaTask(gulp, config = { src: ['./src/manifest.json', './src/sw.js'], dest: './public', workbox: updateWorkbox }) {
  return function updateManifestAndServiceWorker() {
    return gulp
      .src(config.src)
      .pipe(gulpif(file => path.basename(file.path) === 'sw.js', eslint()))
      .pipe(eslint.format())
      .pipe(gulpif(production, eslint.failAfterError()))
      .pipe(gulp.dest(config.dest))
      .pipe(sync.stream())
      .on('end', config.workbox);
  };
}

/**
 * Watches files compiled from 11ty and Rollup to reload the server and rebuild the Service Worker
 *
 * @param {object} gulp - User instance of Gulp
 * @param {object} config - Configration object for the function
 * @param {array<string>} config.src - Glob patterns for the server to watch to trigger page refreshes and workbox rebuild (things being compiled from other systems)
 * @param {function} config.workbox Workbox build function to use
 *
 * @return {object} Gulp watch object
 */
function externalRebuildTask(gulp, config = { src: ['./public/**/*.{js,html}', '!./public/sw.js'], workbox: updateWorkbox }) {
  return function rebuildServiceWorker() {
    return gulp.watch(config.src, () =>
      gulp
        .src(config.src)
        .pipe(cache('server'))
        .pipe(sync.stream())
        .on('end', config.workbox),
    );
  };
}

module.exports = {
  workbox: updateWorkbox,
  pwaTask,
  externalRebuildTask,
};
