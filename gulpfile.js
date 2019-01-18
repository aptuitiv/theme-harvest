// Configuration and utilities
const config = require('./gulp/config.js');
const util = require('./gulp/utilities.js');

// Load gulp
const gulp = require('gulp');

// Load gulp modules
const css = require('./gulp/css');
const copy = require('./gulp/copy');
const font = require('./gulp/font');
const image = require('./gulp/image');
const js = require('./gulp/javascript');
const svg = require('./gulp/svg');
const theme = require('./gulp/theme');


/**
 * Watch for file changes and then process the files
 * @param {function} done
 */
function watch(done) {
    // Copy static assets
    gulp.watch(config.copy.reduce(util.flatten, []), {events: 'all'}, copy.copy);

    // CSS
    gulp.watch(config.paths.watch.css, {events: 'all'}, css.css);

    // Fonts
    gulp.watch(config.paths.src.font, {events: ['add', 'change']}, font.font)
        .on('unlink', function(file) {
            util.deleteFile(file, config.paths.src.font, config.paths.dist.font, 'font');
        });

    // Images
    gulp.watch(config.paths.src.img, {events: ['add', 'change']}, image.images)
        .on('unlink', function(file) {
            util.deleteFile(file, config.paths.src.img, config.paths.dist.img, 'image');
        });

    // Scripts
    gulp.watch(config.scripts.reduce(util.flatten, []), {events: 'all'}, js.scripts);

    // SVG Icons
    gulp.watch(config.paths.src.icon, svg.sprite);

    // Theme
    gulp.watch(config.paths.src.theme, {events: ['add', 'change']}, theme.theme)
        .on('unlink', function(file) {
            util.deleteFile(file, config.paths.src.img, config.paths.dist.img, 'image');
        });

    // Theme configuration JSON
    gulp.watch(config.paths.src.base + '/theme.json', theme.config);

    done();
}

// Set the display properties of the theme pull function
watch.description = 'Watch for file changes and then process the files';


// Build tasks
const build = gulp.series(
    gulp.parallel(
        copy.copy,
        css.css,
        font.font,
        image.images,
        js.scripts,
        svg.sprite,
        theme.config,
        theme.theme
    ),
    theme.push
);

// Export gulp methods
module.exports = {
    build: build,
    default: gulp.series(build, watch),
    copy: copy.copy,
    criticalCss: css.criticalCss,
    css: css.css,
    exportTheme: theme.exportTheme,
    font: font.font,
    images: image.images,
    pullTheme: theme.pull,
    pushTheme: theme.push,
    scripts: js.scripts,
    stylelint: css.stylelint,
    svgSprite: svg.sprite,
    theme: theme.theme,
    themeConfig: theme.config,
    watch: watch
};
