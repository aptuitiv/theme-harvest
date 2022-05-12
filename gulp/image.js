/* =========================================================================== *\
    Image management functions
\* =========================================================================== */



// Configuration and utilities
import {config} from './config.js';
import * as util from './utilities.js';

// Require gulp
import gulp from 'gulp';

// Require plugins
// Importing the default export from commonJs modules.
import plumber from 'gulp-plumber';
// Importing objects from commonJs modules
import Newer from 'gulp-newer';
// ES modules
import image from 'gulp-image';


/**
 * Minify images
 * gulp-image has dependences on libjpg and libpng on macOS
 * @link https://www.npmjs.com/package/gulp-image
 * brew install libjpeg libpng on macOS
 * apt-get install -y libjpeg libpng on Ubuntu
 */
function images() {
    return gulp.src(config.paths.src.img)
        .pipe(Newer(config.paths.dist.img))
        .pipe(plumber({errorHandler: util.onError}))
        .pipe(image())
        .pipe(gulp.dest(config.paths.dist.img));
}
// Set the display properties of the images function
images.description = 'Minifies the images and moves them to the dist folder';

export {images}
