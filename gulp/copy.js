/* =========================================================================== *\
    Copy static assets
\* =========================================================================== */


// Configuration and utilities
import {config} from './config.js';
import * as util from './utilities.js';

// Require gulp
import gulp from 'gulp';
// import gulp from 'gulp';

// Require plugins
// Importing the default export from commonJs modules
import mergeStream from 'merge-stream';
import plumber from 'gulp-plumber';
import tap from 'gulp-tap';

// Importing objects from commonJs modules
import Newer from 'gulp-newer';

/**
 * Copy Static assets
 * @param {function} cb Gulp callback function
 */
function copy(cb) {
    if (config.copy.length > 0) {
        let assets = config.copy.map(function(entry) {
            return gulp.src(entry.src)
                .pipe(Newer(config.paths.dist.base + '/' + entry.dest))
                .pipe(tap((file) => {
                    util.logFileTo('Copying', file, config.paths.dist.base + '/' + entry.dest);
                }))
                .pipe(plumber({errorHandler: util.onError}))
                .pipe(gulp.dest(config.paths.dist.base + '/' + entry.dest));
        });
        return mergeStream(assets);
    } else {
        return cb();
    }
}

// Set the display properties of the copy function
copy.description = 'Copies assets from the node_modules folder to the dist directory';

// Export module
export default copy;
