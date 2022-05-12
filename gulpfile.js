// Configuration and utilities
import * as util from './gulp/utilities.js';
import {config} from './gulp/config.js';

// Load gulp
import gulp from 'gulp';

// Load gulp modules
import copy from './gulp/copy.js';
import {criticalCss, css, stylelint} from './gulp/css.js';
import {font} from './gulp/font.js';
import {images} from './gulp/image.js';
import {jslint, scripts} from './gulp/javascript.js';
import {sprite} from './gulp/svg.js';
import {processTheme, processThemeConfig, pullTheme, pushTheme} from './gulp/theme.js';


/**
 * Watch for file changes and then process the files
 * @param {function} done
 */
function watch(done) {
    // Copy static assets
    gulp.watch(config.copy.reduce(util.flatten, []), {events: 'all'}, copy);

    // CSS
    gulp.watch(config.paths.watch.css, {events: 'all'}, css);

    // Fonts
    gulp.watch(config.paths.src.font, {events: ['add', 'change']}, font)
        .on('unlink', function(file) {
            util.deleteFile(file, config.paths.src.font, config.paths.dist.font, 'font');
        });

    // Images
    gulp.watch(config.paths.src.img, {events: ['add', 'change']}, images)
        .on('unlink', function(file) {
            util.deleteFile(file, config.paths.src.img, config.paths.dist.img, 'image');
        });

    // Scripts
    gulp.watch(config.scripts.reduce(util.flatten, []), {events: 'all'}, scripts);

    // SVG Icons
    gulp.watch(config.paths.src.icon, sprite);

    // Theme
    gulp.watch(config.paths.src.theme, {events: ['add', 'change']}, processTheme)
        .on('unlink', function(file) {
            util.deleteFile(file, config.paths.src.theme, config.paths.dist.theme, 'template');
        });

    // Theme configuration JSON
    gulp.watch(config.paths.src.base + '/theme.json', processThemeConfig);

    done();
}

// Set the display properties of the theme pull function
watch.description = 'Watch for file changes and then process the files';


// Build tasks
const build = gulp.series(
    gulp.parallel(
        copy,
        css,
        font,
        images,
        scripts,
        sprite,
        processThemeConfig,
        processTheme
    ),
    pushTheme
);

const defaultTask = gulp.series(build, watch);

// Export gulp methods
export {
    build,
    copy,
    criticalCss,
    css,
    defaultTask as default,
    font,
    images,
    jslint,
    pullTheme,
    pushTheme,
    processTheme as theme,
    processThemeConfig as themeConfig,
    scripts,
    sprite as svgSprite,
    stylelint,
    watch
}
