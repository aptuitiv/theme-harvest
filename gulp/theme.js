/* =========================================================================== *\
    Work with theme files
\* =========================================================================== */


// Configuration and utilities
const config = require('./config.js');
const util = require('./utilities.js');

// Require gulp
const gulp = require('gulp');

// Require plugins
const changed = require('gulp-changed');
const mergeStream = require('merge-stream');
const newer = require('gulp-newer');
const plumber = require('gulp-plumber');
const tap = require('gulp-tap');

/**
 * Exports the theme files to be used in another website
 * @returns {PassThrough}
 */
function exportTheme() {
    var assets = config.export.src.map(function (entry) {
        return gulp.src(entry.src)
            .pipe(newer(config.export.dist + '/' + entry.src))
            .pipe(tap((file) => {
                util.logFileTo('Exporting the file', file, config.export.dest + '/' + entry.dest);
            }))
            .pipe(plumber({errorHandler: util.onError}))
            .pipe(gulp.dest(config.export.dest + '/' + entry.dest));
    });
    return mergeStream(assets);
}

// Set the display properties of the theme export function
exportTheme.description = 'Exports the theme files into the _export folder to be used in another website';

/**
 * Process the theme files
 */
function processTheme() {
    return gulp.src(config.paths.src.theme)
        .pipe(changed(config.paths.dist.theme, {hasChanged: changed.compareContents}))
        .pipe(tap((file) => {
            util.logFile(file, 'Theme');
        }))
        .pipe(gulp.dest(config.paths.dist.theme));
}

// Set the display properties of the theme process function
processTheme.description = 'Copies the theme files from the src directory to the dist theme directory when they are changed';

/**
 * Processes the theme config files
 */
function processThemeConfig() {
    return gulp.src(config.paths.src.base + '/theme.json')
        .pipe(tap((file) => {
            util.logFile(file, 'Theme Config');
        }))
        .pipe(gulp.dest(config.paths.dist.base));
}

// Set the display properties of the theme process function
processThemeConfig.description = 'Copies the theme configuration file from the src directory to the dist directory it is changed';

/**
 * Push theme files from the src directory to the dist directory
 */
function pushTheme() {
    return gulp.src(config.paths.src.theme)
        .pipe(gulp.dest(config.paths.dist.theme));
}

// Set the display properties of the theme push function
pushTheme.description = 'Copies all the theme files from the src directory to the dist theme directory';

/**
 * Pull theme files from the dist directory to the src directory
 */
function pullTheme() {
    return gulp.src(config.paths.dist.themeFiles)
        .pipe(gulp.dest(config.paths.src.themeFolder));
}

// Set the display properties of the theme pull function
pullTheme.description = 'Copies all the theme files from the dist theme directory to the src directory';

// Export
module.exports = {
    config: processThemeConfig,
    exportTheme: exportTheme,
    pull: pullTheme,
    push: pushTheme,
    theme: processTheme
};
