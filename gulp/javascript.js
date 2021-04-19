/* =========================================================================== *\
    Handle Javascript files
\* =========================================================================== */


// Configuration and utilities
const config = require('./config.js');
const util = require('./utilities.js');

// Require gulp
const gulp = require('gulp');

// Require plugins
const concat = require('gulp-concat');
const eslint = require('gulp-eslint');
const gulpIf = require('gulp-if');
const header = require('gulp-header');
const mergeStream = require('merge-stream');
const newer = require('gulp-newer');
const plumber = require('gulp-plumber');
const remember = require('gulp-remember');
const tap = require('gulp-tap');
const terser = require('gulp-terser');

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
        return gulp.src(entry.src, { base: 'src' })
            .pipe(newer(config.paths.dist.js + '/' + entry.name))
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


exports.jslint = lintJs
exports.scripts = scripts;