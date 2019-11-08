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
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cached');
const htmlmin = require('gulp-htmlmin');
const critical = require('critical').stream;
const sync = require('browser-sync');
const { folders, assets, optimize } = require('config');
const path = require('path');

const { workbox } = require('./workbox.js');

const production = process.env.NODE_ENV === 'production';

/**
 * Optimizes and moves images
 *
 * @param {object} gulp - User instance of Gulp
 *
 * @return {function} Gulp task
 */
function imagesTask(gulp) {
  const src = path.join(folders.source, assets.images, '**/*');
  const dest = path.join(folders.output, assets.images);
  return function optimizeImages() {
    return gulp
      .src(src)
      .pipe(cache('images'))
      .pipe(imagemin())
      .pipe(gulp.dest(dest))
      .pipe(sync.stream())
      .on('end', workbox);
  };
}

/**
 * Moves videos
 *
 * @param {object} gulp - User instance of Gulp
 *
 * @return {function} Gulp task
 */
function videosTask(gulp) {
  const src = path.join(folders.source, assets.videos, '**/*');
  const dest = path.join(folders.output, assets.videos);
  return function moveVideos() {
    return gulp
      .src(src)
      .pipe(cache('videos'))
      .pipe(gulp.dest(dest))
      .pipe(sync.stream())
      .on('end', workbox);
  };
}

/**
 * Moves fonts
 *
 * @param {object} gulp - User instance of Gulp
 *
 * @return {function} Gulp task
 */
function fontsTask(gulp) {
  const src = path.join(folders.source, assets.fonts, '**/*');
  const dest = path.join(folders.output, assets.fonts);
  return function moveFonts() {
    return gulp
      .src(src)
      .pipe(cache('fonts'))
      .pipe(gulp.dest(dest))
      .pipe(sync.stream())
      .on('end', workbox);
  };
}

/**
 * Optimizes HTML using Critical and minimizes output, if in production
 *
 * @param {object} gulp - User instance of Gulp
 * @param {object} config - Configuration of the function
 * @param {string} config.src - Source file glob
 * @param {string} config.dest - Output destination
 *
 * @return {function} Gulp task
 */
function htmlTask(gulp) {
  return function optimizeHTML() {
    const src = path.join(folders.output, '**/*.html');
    const dest = folders.output;
    optimize.critical.base = dest;
    return gulp
      .src(src)
      .pipe(gulpif(production, critical(optimize.critical)))
      .pipe(gulpif(production, htmlmin(optimize.htmlmin)))
      .pipe(gulp.dest(dest));
  };
}

module.exports = {
  imagesTask,
  videosTask,
  fontsTask,
  htmlTask,
};
