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

const { workbox } = require('./workbox.js');

const production = process.env.NODE_ENV === 'production';

/**
 * Optimizes and moves images
 *
 * @param {object} gulp - User instance of Gulp
 * @param {object} config - Configuration of the function
 * @param {string} config.src - Source file glob
 * @param {string} config.dest - Output destination
 * @param {function} config.workbox - Workbox build function to use
 *
 * @return {function} Gulp task
 */
function imagesTask(gulp, config = { src: './src/images/**/*', dest: './public/images', workbox }) {
  return function optimizeImages() {
    return gulp
      .src(config.src)
      .pipe(cache('images'))
      .pipe(imagemin())
      .pipe(gulp.dest(config.dest))
      .pipe(sync.stream())
      .on('end', config.workbox);
  };
}

/**
 * Moves videos
 *
 * @param {object} gulp - User instance of Gulp
 * @param {object} config - Configuration of the function
 * @param {string} config.src - Source file glob
 * @param {string} config.dest - Output destination
 * @param {function} config.workbox - Workbox build function to use
 *
 * @return {function} Gulp task
 */
function videosTask(gulp, config = { src: './src/videos/**/*', dest: './public/videos', workbox }) {
  return function moveVideos() {
    return gulp
      .src(config.src)
      .pipe(cache('videos'))
      .pipe(gulp.dest(config.dest))
      .pipe(sync.stream())
      .on('end', config.workbox);
  };
}

/**
 * Moves fonts
 *
 * @param {object} gulp - User instance of Gulp
 * @param {object} config - Configuration of the function
 * @param {string} config.src - Source file glob
 * @param {string} config.dest - Output destination
 * @param {function} config.workbox - Workbox build function to use
 *
 * @return {function} Gulp task
 */
function fontsTask(gulp, config = { src: './src/fonts/**/*', dest: './public/fonts', workbox }) {
  return function moveFonts() {
    return gulp
      .src('./src/fonts/**/*')
      .pipe(cache('fonts'))
      .pipe(gulp.dest('./public/fonts'))
      .pipe(sync.stream())
      .on('end', config.workbox);
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
function htmlTask(
  gulp,
  config = {
    src: './public/**/*.html',
    dest: './public',
    critical: {
      inline: true,
      base: 'public/',
      minify: true,
    },
    htmlmin: {
      collapseWhitespace: true,
      sortAttributes: true,
      sortClassName: true,
    },
  },
) {
  return function optimizeHTML() {
    return gulp
      .src(config.src)
      .pipe(gulpif(production, critical(config.critical)))
      .pipe(gulpif(production, htmlmin(config.htmlmin)))
      .pipe(gulp.dest(config.dest));
  };
}

module.exports = {
  imagesTask,
  videosTask,
  fontsTask,
  htmlTask,
};
