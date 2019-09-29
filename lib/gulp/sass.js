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
const lazypipe = require('lazypipe');
const gulpif = require('gulp-if');

const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const sassLint = require('gulp-sass-lint');
const sourcemaps = require('gulp-sourcemaps');
const sync = require('browser-sync');

const { workbox } = require('./workbox.js');

const production = process.env.NODE_ENV === 'production';

const lintSass = lazypipe()
  .pipe(sassLint)
  .pipe(sassLint.format)
  .pipe(() => gulpif(production, sassLint.failOnError()));

const sassConfig = {
  src: './src/sass/**/*.scss',
  dest: './public/css',
  config: { outputStyle: 'compressed' },
  lint: lintSass,
  workbox,
};

/**
 * Compiles Sass files to CSS
 *
 * @param {object} gulp - User instance of Gulp
 * @param {object} config - Configuration object for the function
 * @param {string} config.src - Glob of Sass files to compile
 * @param {string} config.dest - Location to place the output CSS file
 * @param {string} config.config - Sass compiler configuration
 * @param {stream|false} config.lint - Linting substream to run
 * @param {string} config.workbox - Workbox build function to use
 *
 * @return {function} Gulp task to lint and compile Sass
 */
function sassTask(gulp, config = sassConfig) {
  return function compileSass() {
    return gulp
      .src(config.src)
      .pipe(gulpif(config.lint, config.lint()))
      .pipe(sourcemaps.init())
      .pipe(gulpif(production, sass(config.config), sass(config.config).on('error', sass.logError)))
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest(config.dest))
      .pipe(sync.stream())
      .on('end', config.workbox);
  };
}

module.exports = {
  lintSass,
  sassTask,
};
