/* =========================================================================== *\
    Work with font files
 \* =========================================================================== */


// Configuration and utilities
const config = require('./config.js');
const util = require('./utilities.js');

// Require gulp
const gulp = require('gulp');

// Require plugins
const changed = require('gulp-changed');
const tap = require('gulp-tap');

/**
 * Processes the font files
 */
function processFonts() {
    return gulp.src(config.paths.src.font)
        .pipe(changed(config.paths.dist.font, {hasChanged: changed.compareContents}))
        .pipe(tap((file) => {
            util.logFile(file, 'Font');
        }))
        .pipe(gulp.dest(config.paths.dist.font));
}

// Set the display properties of the theme process function
processFonts.description = 'Copies the font files from the src directory to the dist font directory when they are changed';

// Export
module.exports = {
    font: processFonts,
};
