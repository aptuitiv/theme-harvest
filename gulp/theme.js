/* =========================================================================== *\
    Work with theme files
\* =========================================================================== */


// Configuration and utilities
import {config} from './config.js';
import * as util from './utilities.js';

// Require gulp
import gulp from 'gulp';

// Require plugins
// Importing the default export from commonJs modules.
import changed from 'gulp-changed';
import tap from 'gulp-tap';

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
export {
    processThemeConfig,
    pullTheme,
    pushTheme,
    processTheme
}
