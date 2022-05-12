/* =========================================================================== *\
    Handle CSS files
\* =========================================================================== */


// Configuration and utilities
import {config} from './config.js';
import * as util from './utilities.js';

// Require gulp
import gulp from 'gulp';

// Require node packages
import fs from 'fs';
//const fs = require('fs');

// Require plugins
// Importing the default export from commonJs modules.
import autoprefixer from 'autoprefixer';
import cached from 'gulp-cached';
import changedInPlace from 'gulp-changed-in-place';
import cleanCss from 'gulp-clean-css';
import gulpStylelint from '@ronilaukkarinen/gulp-stylelint';
import header from 'gulp-header';
import mergeStream from 'merge-stream';
import penthouse from 'penthouse';
import plumber from 'gulp-plumber';
import postcss from 'gulp-postcss';
import postcssImport from 'postcss-import';
import postcssCustomMedia from 'postcss-custom-media';
import tap from 'gulp-tap';

/**
 * Run the stylelint
 *
 * BEM Linter options sets the utilitySelectors just like
 * https://github.com/postcss/postcss-bem-linter/blob/master/lib/preset-patterns.js
 * but with "xs-" added in.
 */
function runStylelint() {
    return gulp.src(config.paths.src.stylelint, {base: './'})
        .pipe(cached('Stylelint'))
        .pipe(tap((file) => {
            util.logFile(file, 'Linting');
        }))
        .pipe(plumber({errorHandler: util.onError}))
        .pipe(gulpStylelint({
            failAfterError: false,
            fix: true,
            reporters: [
                {
                    formatter: 'string',
                    console: true
                }
            ]
        }))
        .pipe(gulp.dest('./'));
}

// Set the display properties of the stylelint function
runStylelint.displayName = 'stylelint';
runStylelint.description = 'Runs the CSS linter';

/**
 * Stylesheets
 * PostCSS processors list order is important. css-import has be first
 * and cssnano needs to be last
 */
const processors = [
    postcssImport,
    postcssCustomMedia(),
    autoprefixer()
];

/**
 * Process the CSS files
 */
function processCss() {
    var tasks = config.paths.src.css.map(function(cssFile) {
        return gulp.src(cssFile)
            .pipe(tap((file) => {
                util.logFile(file, 'Start Build CSS');
            }))
            .pipe(plumber({errorHandler: util.onError}))
            .pipe(postcss(processors))
            .pipe(cleanCss({level: 2, compatibility: 'ie8'}))
            .pipe(changedInPlace({firstPass: true}))
            .pipe(header(util.banner))
            .pipe(tap((file) => {
                util.logFile(file, 'Output CSS');
            }))
            .pipe(gulp.dest(config.paths.dist.css));
    });
    return mergeStream(tasks);
}

// Set the display properties of the process CSS function
processCss.displayName = 'css';
processCss.description = 'Combines, minifies, and cleans the CSS files';

/**
 * Generate the critical CSS for each template
 */
function criticalCss(callback) {
    util.synchLoop(config.criticalCss, generateCriticalCSS, () => {
        callback();
    });
}

// Set the display properties of the critical CSS function
criticalCss.description = 'Creates the inline CSS in a snippet to be included in the head for a page.';


/**
 * Generate the critical CSS
 * @param {object} data The template data
 * @param {integer} i The loop value index
 * @param {function} callback The parameterless function to call on completion
 */
function generateCriticalCSS(data, i, callback) {
    const src = config.url + data.url;
    const dest = config.paths.src.themeFolder + '/snippets/criticalcss-' + data.template + '.twig';
    util.logFileTo('Critical CSS', src, dest);

    penthouse({
        url: src,
        css: config.paths.criticalCss.src,
        renderWaitTime: 500,
        width: 1200,
        height: 1200
    }).then(criticalCss => {
        fs.writeFile(
            dest,
            '<style>' + criticalCss + '</style>',
            (err) => {
                if (err) throw err;
            }
        );
        callback();
    }).catch(err => {
        util.log('ERROR generating Critial CSS: ' + err);
        callback();
    });
}

// Process the CSS
const css = gulp.series(runStylelint, processCss);

// Export
export {
    criticalCss,
    css,
    runStylelint as stylelint
};
