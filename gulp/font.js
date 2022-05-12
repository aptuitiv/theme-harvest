/* =========================================================================== *\
    Work with font files
 \* =========================================================================== */


// Configuration and utilities
import {config} from './config.js';
import * as util from './utilities.js';

// Require gulp
import gulp from 'gulp';

// Require plugins
// Importing the default export from commonJs modules
import changed from 'gulp-changed';
import tap from 'gulp-tap';


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
export {
    processFonts as font
}
