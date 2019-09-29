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
const gulp = require('gulp');

const { sassTask } = require('./lib/gulp/sass');
const { server } = require('./lib/gulp/server');
const { pwaTask, externalRebuildTask } = require('./lib/gulp/workbox');
const assets = require('./lib/gulp/assets');

const sass = sassTask(gulp);
const pwa = pwaTask(gulp);
const external = externalRebuildTask(gulp);

const images = assets.imagesTask(gulp);
const videos = assets.videosTask(gulp);
const fonts = assets.fontsTask(gulp);
const html = assets.htmlTask(gulp);

/**
 * Watches a Sass glob and runs compileSass
 *
 * @return {object} Gulp watch object
 */
function watchSass() {
  return gulp.watch('./src/sass/**/*.scss', sass);
}

gulp.task('sass', sass);
gulp.task('watch:sass', gulp.parallel(sass, watchSass));

// Static Assets

/**
 * Watches images and runs moveImages
 *
 * @return {object} Gulp watch object
 */
function watchImages() {
  return gulp.watch('./src/images/**/*', images);
}

/**
 * Watches videos and runs moveVideos
 *
 * @return {object} Gulp watch object
 */
function watchVideos() {
  return gulp.watch('./src/videos/**/*', videos);
}

/**
 * Watches fonts and runs moveFonts
 *
 * @return {object} Gulp watch object
 */
function watchFonts() {
  return gulp.watch('./src/fonts/**/*', fonts);
}

/**
 * Watches manifest and service worker and runs movePWA
 *
 * @return {object} Gulp watch object
 */
function watchPWA() {
  return gulp.watch(['./src/manifest.json', './src/sw.js'], pwa);
}

gulp.task('server', gulp.parallel(server, external));
gulp.task('build:static', gulp.parallel(images, videos, fonts, pwa));
gulp.task('watch:static', gulp.parallel(watchImages, watchVideos, watchFonts, watchPWA));

// ////////////////////////////
// Pipelines
// ////////////////////////////
gulp.task('build', gulp.series(gulp.parallel('sass', 'build:static'), html));
gulp.task('watch', gulp.parallel('watch:sass', 'watch:static'));
gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'server')));
