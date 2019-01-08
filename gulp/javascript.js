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
const header = require('gulp-header');
const image = require('gulp-image');
const mergeStream = require('merge-stream');
const newer = require('gulp-newer');
const plumber = require('gulp-plumber');
const remember = require('gulp-remember');
const tap = require('gulp-tap');
const uglify = require('gulp-uglify');

/**
 * Concat and uglify scripts
 */
function scripts() {
    var tasks = config.scripts.map(function (entry, index) {
        return gulp.src(entry.src)
            .pipe(newer(config.paths.dist.js + '/' + entry.name))
            .pipe(tap((file) => {
                util.logFileTo('Merging script', file, config.paths.dist.js + '/' + entry.name);
            }))
            .pipe(plumber({errorHandler: util.onError}))
            .pipe(uglify({mangle: false}))
            .pipe(remember('scripts' + index))
            .pipe(concat(entry.name))
            .pipe(header(util.banner))
            .pipe(gulp.dest(config.paths.dist.js));
    });
    return mergeStream(tasks);
}

// Set the display properties of the javascript function
scripts.description = 'Concatenates and minifies Javascript files';


exports.scripts = scripts;
