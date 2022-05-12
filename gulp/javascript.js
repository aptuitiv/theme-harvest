/* =========================================================================== *\
    Handle Javascript files
\* =========================================================================== */


// Configuration and utilities
import {config} from './config.js';
import * as util from './utilities.js';

// Require gulp
import gulp from 'gulp';

// Require plugins
// Importing the default export from commonJs modules.
import concat from 'gulp-concat';
import eslint from 'gulp-eslint';
import gulpIf from 'gulp-if';
import header from 'gulp-header';
import mergeStream from 'merge-stream';
import plumber from 'gulp-plumber';
import remember from 'gulp-remember';
import tap from 'gulp-tap';
import terser from 'gulp-terser';

// Importing objects from commonJs modules
import Newer from 'gulp-newer';

// const concat = require('gulp-concat');
// const eslint = require('gulp-eslint');
//const gulpIf = require('gulp-if');
// const header = require('gulp-header');
// const mergeStream = require('merge-stream');
// import Newer from 'gulp-newer';
// import plumber from 'gulp-plumber';
// const remember = require('gulp-remember');
// const tap = require('gulp-tap');
// const terser = require('gulp-terser');

/**
 * Check to see if the file has been fixed by eslint
 * @param {object} file
 * @returns {boolean|boolean|(() => string)|*}
 */
function isFixed(file) {
    // Has ESLint fixed the file contents?
    return file.eslint != null && file.eslint.fixed;
}

/**
 * Run eslint on the Javascript files
 * Eslint functionality based on https://stackoverflow.com/a/37108027
 *
 * @returns {*}
 */
function lintJs() {
    return gulp.src(config.paths.src.jslint)
        .pipe(tap((file) => {
            util.logFile(file, 'JS Linting');
        }))
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint({fix:true}))
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // if fixed, write the file to dest
        .pipe(gulpIf(isFixed, gulp.dest(config.paths.src.js)))
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError
    // last.
    //.pipe(eslint.failAfterError());
}

lintJs.description = 'Lint Javascript files with eslint';


/**
 * Concat and compress scripts
 */
function scripts() {
    let tasks = config.scripts.map(function (entry, index) {
        return gulp.src(entry.src)
            .pipe(Newer(config.paths.dist.js + '/' + entry.name))
            // Lint the script using eslint
            .pipe(tap((file) => {
                util.logFile(file, 'JS Linting');
            }))
            .pipe(eslint({fix:true}))
            .pipe(eslint.format())
            // if fixed, write the file to dest
            .pipe(gulpIf(isFixed, gulp.dest(config.paths.src.js)))
            // Compress and merge the script
            .pipe(tap((file) => {
                util.logFileTo('Merging script', file, config.paths.dist.js + '/' + entry.name);
            }))
            .pipe(plumber({errorHandler: util.onError}))
            .pipe(terser({
                mangle: false,
                compress: {
                    defaults: false
                }
            }))
            .pipe(remember('scripts' + index))
            .pipe(concat(entry.name))
            .pipe(header(util.banner))
            .pipe(gulp.dest(config.paths.dist.js));
    });
    return mergeStream(tasks);
}

// Set the display properties of the javascript function
scripts.description = 'Concatenates and minifies Javascript files';

export {
    lintJs as jslint,
    scripts
}
