/* =========================================================================== *\
    Export theme files. Used if this is a theme site
\* =========================================================================== */


// Configuration and utilities
import {config} from './config.js';
import * as util from './utilities.js';

// Require gulp
import gulp from 'gulp';

// Require plugins
// Importing the default export from commonJs modules
import mergeStream from 'merge-stream';
import plumber from 'gulp-plumber';
import tap from 'gulp-tap';

// Importing objects from commonJs modules
import Newer from 'gulp-newer';

const exportConfig = {
    /**
    * Path to export the theme files to and from.
    * This creates a folder that can simply be copied to start a new website from this theme
    */

    dest: '_export',
    src: [
        {
            src: config.paths.src.base + '/**/*',
            dest: 'src'
        },
        {
            src: '.editorconfig',
            dest: ''
        },
        {
            src: '.eslintignore',
            dest: ''
        },
        {
            src: '.eslintrc.cjs',
            dest: ''
        },
        {
            src: '.gitignore',
            dest: ''
        },
        {
            src: '.prettierignore',
            dest: ''
        },
        {
            src: '.prettierrc.js',
            dest: ''
        },
        {
            src: '.stylelintrc',
            dest: ''
        },
        {
            src: 'gulp/**/*',
            dest: 'gulp'
        },
        {
            src: 'gulpfile.js',
            dest: ''
        },
        {
            src: 'package.json',
            dest: ''
        }
    ]
}

/**
 * Exports the theme files to be used in another website
 * @returns {PassThrough}
 */
 function exportTheme() {
    var assets = exportConfig.src.map(function (entry) {
        return gulp.src(entry.src)
            .pipe(Newer(exportConfig.dist + '/' + entry.src))
            .pipe(tap((file) => {
                util.logFileTo('Exporting the file', file, exportConfig.dest + '/' + entry.dest);
            }))
            .pipe(plumber({errorHandler: util.onError}))
            .pipe(gulp.dest(exportConfig.dest + '/' + entry.dest));
    });
    return mergeStream(assets);
}

// Set the display properties of the theme export function
exportTheme.description = 'Exports the theme files into the _export folder to be used in another website';

export {
    exportTheme
}
