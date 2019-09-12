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
const cache = require('gulp-cached');
const gulpif = require('gulp-if');
const sass = require('gulp-sass');
const sassLint = require('gulp-sass-lint');
const eslint = require('gulp-eslint');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const workboxBuild = require('workbox-build');
const critical = require('critical').stream;
const sync = require('browser-sync');

const path = require('path');

const production = process.env.NODE_ENV === 'production';

/**
 * Reusable function to generate a Workbox precache for determined files
 *
 * @return {object} injected resources
 */
async function updateWorkbox() {
  try {
    const resources = await workboxBuild.injectManifest({
      swSrc: 'src/sw.js',
      swDest: 'public/sw.js',
      globDirectory: 'public',
      globPatterns: ['css/**/*.css', 'js/**/*.js', 'fonts/**/*', 'images/icons/**/*', 'index.html'],
    });
    console.log(`Injected ${resources.count} resources for precaching`);
    return resources;
  } catch (e) {
    console.log('Uh oh 😬', e);
  }
}

// Sass
const sassConfig = { outputStyle: 'compressed' };
sass.compiler = require('node-sass');

/**
 * Compiles Sass files to CSS
 *
 * @return {object} Gulp object
 */
function compileSass() {
  return gulp
    .src('./src/sass/**/*.scss')
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(gulpif(production, sassLint.failOnError()))
    .pipe(sourcemaps.init())
    .pipe(gulpif(production, sass(sassConfig), sass(sassConfig).on('error', sass.logError)))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./public/css'))
    .pipe(sync.stream())
    .on('end', updateWorkbox);
}

/**
 * Watches a Sass glob and runs compileSass
 *
 * @return {object} Gulp watch object
 */
function watchSass() {
  return gulp.watch('./src/sass/**/*.scss', compileSass);
}

gulp.task('sass', compileSass);
gulp.task('watch:sass', gulp.parallel(compileSass, watchSass));

/**
 * Runs a BrowserSync server
 *
 * @return {object} BrowserSync instance
 */
function staticServer() {
  return sync.init({
    server: './public',
  });
}

/**
 * Watches files compiled from 11ty and Rollup to reload the server and rebuild the Service Worker
 *
 * @return {object} Gulp watch object
 */
function watchServer() {
  const src = ['./public/**/*.{js,html}', '!./public/sw.js'];
  return gulp.watch(src, () =>
    gulp
      .src(src)
      .pipe(cache('server'))
      .pipe(sync.stream())
      .on('end', updateWorkbox),
  );
}

gulp.task('server', gulp.parallel(staticServer, watchServer));

// Static Assets
/**
 * Optimizes and moves images
 *
 * @return {object} Gulp object
 */
function optimizeImages() {
  return gulp
    .src('./src/images/**/*')
    .pipe(cache('images'))
    .pipe(imagemin())
    .pipe(gulp.dest('./public/images'))
    .pipe(sync.stream());
}

/**
 * Watches images and runs moveImages
 *
 * @return {object} Gulp watch object
 */
function watchImages() {
  return gulp.watch('./src/images/**/*', optimizeImages);
}

/**
 * Moves videos
 *
 * @return {object} Gulp object
 */
function moveVideos() {
  return gulp
    .src('./src/videos/**/*')
    .pipe(cache('videos'))
    .pipe(gulp.dest('./public/videos'))
    .pipe(sync.stream());
}

/**
 * Watches videos and runs moveVideos
 *
 * @return {object} Gulp watch object
 */
function watchVideos() {
  return gulp.watch('./src/videos/**/*', moveVideos);
}

/**
 * Moves fonts
 *
 * @return {object} Gulp object
 */
function moveFonts() {
  return gulp
    .src('./src/fonts/**/*')
    .pipe(cache('fonts'))
    .pipe(gulp.dest('./public/fonts'))
    .pipe(sync.stream())
    .on('end', updateWorkbox);
}

/**
 * Watches fonts and runs moveFonts
 *
 * @return {object} Gulp watch object
 */
function watchFonts() {
  return gulp.watch('./src/fonts/**/*', moveFonts);
}

/**
 * Lints Service Worker and moves Manifest file and Service Worker over, and updates Service Worker
 *
 * @return {object} Gulp object
 */
function movePWA() {
  return gulp
    .src(['./src/manifest.json', './src/sw.js'])
    .pipe(gulpif(file => path.basename(file.path) === 'sw.js', eslint()))
    .pipe(eslint.format())
    .pipe(gulpif(production, eslint.failAfterError()))
    .pipe(gulp.dest('./public'))
    .pipe(sync.stream())
    .on('end', updateWorkbox);
}

/**
 * Watches manifest and service worker and runs movePWA
 *
 * @return {object} Gulp watch object
 */
function watchPWA() {
  return gulp.watch(['./src/manifest.json', './src/sw.js'], movePWA);
}

/**
 * Optimizes HTML using Critical and minimizes output, if in production
 *
 * @return {object} Gulp object
 */
function optimizeHTML() {
  return gulp
    .src('./public/**/*.html')
    .pipe(
      gulpif(
        production,
        critical({
          inline: true,
          base: 'public/',
          minify: true,
        }),
      ),
    )
    .pipe(
      gulpif(
        production,
        htmlmin({
          collapseWhitespace: true,
          sortAttributes: true,
          sortClassName: true,
        }),
      ),
    )
    .pipe(gulp.dest('./public'));
}

gulp.task('build:static', gulp.parallel(optimizeImages, moveVideos, moveFonts, movePWA));
gulp.task('watch:static', gulp.parallel(watchImages, watchVideos, watchFonts, watchPWA));

// ////////////////////////////
// Pipelines
// ////////////////////////////
gulp.task('build', gulp.series(gulp.parallel('sass', 'build:static'), optimizeHTML));
gulp.task('watch', gulp.parallel('watch:sass', 'watch:static'));

gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'server')));
