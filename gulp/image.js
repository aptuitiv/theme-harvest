/* =========================================================================== *\
    Image management functions
\* =========================================================================== */



// Configuration and utilities
const config = require('./config.js');
const util = require('./utilities.js');

// Require gulp
const gulp = require('gulp');

// Require plugins
const image = require('gulp-image');
const newer = require('gulp-newer');
const plumber = require('gulp-plumber');

/**
 * Minify images
 * gulp-image has dependences on libjpg and libpng on macOS
 * @link https://www.npmjs.com/package/gulp-image
 * brew install libjpeg libpng on macOS
 * apt-get install -y libjpeg libpng on Ubuntu
 */
function images() {
    return gulp.src(config.paths.src.img)
        .pipe(newer(config.paths.dist.img))
        .pipe(plumber({errorHandler: util.onError}))
        .pipe(image())
        .pipe(gulp.dest(config.paths.dist.img));
}
// Set the display properties of the images function
images.description = 'Minifies the images and moves them to the dist folder';

exports.images = images;
