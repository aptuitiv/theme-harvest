/* =========================================================================== *\
    Work with SVG files
\* =========================================================================== */

// Configuration and utilities
const config = require('./config.js');
const util = require('./utilities.js');

// Require gulp
const gulp = require('gulp');

// Require plugins
const rename = require('gulp-rename');
const svgmin = require('gulp-svgmin');
const svgstore = require('gulp-svgstore');
const tap = require('gulp-tap');

// Load node packages
const path = require('path');

/**
 * Processes the SVG icons and creates a single svg sprite
 */
function generateIconSprite() {
    return gulp.src(config.paths.src.base + '/icons/**/*.svg')
        .pipe(tap((file) => {
            util.logFile(file, 'SVG Icon Sprite');
        }))
        .pipe(rename({prefix: 'icon-'}))
        .pipe(svgmin(function (file) {
            var prefix = path.basename(file.relative, path.extname(file.relative));
            return {
                plugins: [
                    {
                        cleanupIDs: {
                            prefix: prefix + '-',
                            minify: true
                        }
                    },
                    {removeViewBox: false}
                ]
            }
        }))
        .pipe(svgstore({ inlineSvg: true }))
        .pipe(rename('svg-icons.twig'))
        .pipe(gulp.dest(config.paths.src.themeFolder + '/snippets'))
        .pipe(tap((file) => {
            util.logFile(file, 'Generated SVG Twig File');
        }));
}

// Set the display properties of the svg sprite function
generateIconSprite.displayName = 'svgSprite';
generateIconSprite.description = 'Combines SVG icons into a sprite snippet';

exports.sprite = generateIconSprite;
