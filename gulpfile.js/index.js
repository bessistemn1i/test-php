'use strict';

const gulp = require('gulp');
const pug = require('gulp-pug');
const htmlBeautify = require('gulp-html-beautify');
const browserSync = require('browser-sync');
const sass = require('gulp-sass');
const sassImporter = require('sass-module-importer');
const csso = require('gulp-csso');
const autoprefixer = require('gulp-autoprefixer');
const webpack = require('webpack-stream');
const rename = require('gulp-rename');
const dirs = {
  pug: './src/pug/*.pug',
  pugModules: './src/pug/pug-modules/*.pug',
  scss: './src/sass/**/*.scss',
  styles: './src/sass/styles.scss',
  js: './src/js/**/*.js',
  php: './wp/*.php',
  wp: 'C:/xampp/htdocs/test-php/wp-content/themes/test-php',

  dist: './dist'
};

// Webpack config
const webpackConfig = {
  entry: {
    main: './src/js/main.js'
  },

  output: {
    filename: '[name].js'
  },

  // mode: 'production'
  mode: 'development'
};


/**
 * Renders html from pug
 */
let pugRender = () => (
  gulp.src(dirs.pug)
    .pipe(pug({
      path: dirs.pugModules
    }))
    .pipe(htmlBeautify())
    .pipe(gulp.dest(dirs.dist))
);

/**
 * Compiles scss files to styles.css
 */
let styles = () => (
  gulp.src(dirs.scss)
    .pipe(sass({ importer: sassImporter() }))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(csso({comments: 'exclamation'}))
    .pipe(gulp.dest(dirs.dist))
    .pipe(browserSync.reload({stream: true}))
    .pipe(rename('style.css'))
    .pipe(gulp.dest(dirs.wp))
);


/**
 * Compiles js files
 */
let scripts = () => (
  gulp.src(dirs.js)
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(dirs.dist))
    .pipe(gulp.dest(dirs.wp))
);


let copyPHP = () => (
  gulp.src(dirs.php)
    .pipe(gulp.dest(dirs.wp))
);
/**
 * Runs browserSync server
 * @param {Function} done callback
 */
let browserSyncInit = (done) => {
  browserSync.init({
    server: {
      baseDir: dirs.dist
    },
    port: 3000
  });
  done();
};


/**
 * Reloads browserSync server
 * @param {Function} done callback
 */
let browserSyncReload = (done) => {
  browserSync.reload();
  done();
};

/**
 * Watches files for changes
 */
let watchFiles = () => {
  gulp.watch(dirs.pugModules, gulp.series(pugRender, browserSyncReload));
  gulp.watch(dirs.pug, gulp.series(pugRender, browserSyncReload));
  gulp.watch(dirs.scss, gulp.parallel(styles));
  gulp.watch(dirs.js, gulp.series(scripts, browserSyncReload));
  gulp.watch(dirs.php, gulp.series(copyPHP));
};

const watch = gulp.parallel(watchFiles, browserSyncInit);
exports.wordpress = copyPHP;
exports.pugRender = pugRender;
exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch;