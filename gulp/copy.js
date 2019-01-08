/* =========================================================================== *\
    Copy static assets
\* =========================================================================== */


// Configuration and utilities
const config = require('./config.js');
const util = require('./utilities.js');

// Require gulp
const gulp = require('gulp');

// Require plugins
const mergeStream = require('merge-stream');
const newer = require('gulp-newer');
const plumber = require('gulp-plumber');
const tap = require('gulp-tap');

/**
 * Copy Static assets
 */
function copy() {
    let assets = config.copy.map(function (entry) {
        return gulp.src(entry.src)
            .pipe(newer(config.paths.dist.base + '/' + entry.dest))
            .pipe(tap((file) => {
                util.logFileTo('Copying', file, config.paths.dist.base + '/' + entry.dest);
            }))
            .pipe(plumber({errorHandler: util.onError}))
            .pipe(gulp.dest(config.paths.dist.base + '/' + entry.dest));
    });
    return mergeStream(assets);
}

// Set the display properties of the copy function
copy.description = 'Copies assets from the node_modules folder to the dist directory';

// Export module
exports.copy = copy;
