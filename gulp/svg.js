/* =========================================================================== *\
    Work with SVG files
\* =========================================================================== */

// Configuration and utilities
import {config} from './config.js';
import * as util from './utilities.js';

// Require gulp
import gulp from 'gulp';

// Require plugins
// Importing the default export from commonJs modules.
import rename from 'gulp-rename';
import svgstore from 'gulp-svgstore';
import tap from 'gulp-tap';

// ES modules
import svgmin from 'gulp-svgmin';

// Load node packages
import path from 'path';

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

export {
    generateIconSprite as sprite
}
