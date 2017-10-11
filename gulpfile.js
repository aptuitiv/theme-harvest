// Configuration
const config = require('./config.js');
const fontelloConfig = require('./' + config.paths.src.fontello);

// Load gulp
const gulp = require('gulp');


// Load all variables in "devDependencies" into the variable $
const $ = require('gulp-load-plugins')({
    pattern: ['*'],
    scope: ['devDependencies']
});

// Load node packages
const del = require('del');
//const map = require('map-stream');
const path = require('path');

// Error handler
const onError = (err) => {
    console.log(err);
    if (typeof this.emit === 'function') {
        this.emit('end');
    }
};

// Banner to add to the top of files
const banner = [
    "/**",
    " * @build " + $.moment().format("llll Z"),
    " */",
    ""
].join("\n");

// Logging function
function logFile(file, prefix) {
    prefix = prefix || 'Using'
    $.fancyLog($.chalk.cyan(prefix) + ' ' + $.chalk.magenta(path.relative(file.cwd, file.path)));
}

/**
 * Copy Static assets
 */
gulp.task('copy', () => {
    var assets = config.copy.map(function (entry) {
        return gulp.src(entry.src)
            .pipe($.newer(config.paths.dist.base + '/' + entry.dest))
            .pipe($.tap((file) => {
                $.fancyLog($.chalk.cyan('copying ') + $.chalk.blue(path.relative(file.cwd, file.path)) + ' to ' + $.chalk.green(config.paths.dist.base + '/' + entry.dest))
            }))
            .pipe($.plumber({errorHandler: onError}))
            .pipe(gulp.dest(config.paths.dist.base + '/' + entry.dest));
    });
    return $.mergeStream(assets);
});

/**
 * Minify images
 * gulp-image has dependences on libjpg and libpng on macOS
 * @link https://www.npmjs.com/package/gulp-image
 * brew install libjpeg libpng on macOS
 * apt-get install -y libjpeg libpng on Ubuntu
 */
gulp.task('images', () => {
    return gulp.src(config.paths.src.img)
        .pipe($.newer(config.paths.dist.img))

        .pipe($.plumber({errorHandler: onError}))
        .pipe($.image())
        .pipe(gulp.dest(config.paths.dist.img));
});

/**
 * Concat and uglify scripts
 */
gulp.task('scripts', function () {
    var tasks = config.scripts.map(function (entry, index) {
        return gulp.src(entry.src)
            .pipe($.newer(config.paths.dist.js + '/' + entry.name))
            .pipe($.tap((file) => {
                $.fancyLog($.chalk.cyan('Merging script ') + $.chalk.blue(path.relative(file.cwd, file.path)) + ' into ' + $.chalk.green(config.paths.dist.js + '/' + entry.name));
            }))
            .pipe($.plumber({errorHandler: onError}))
            .pipe($.uglify({mangle: false}))
            .pipe($.remember('scripts' + index))
            .pipe($.concat(entry.name))
            .pipe($.header(banner))
            .pipe(gulp.dest(config.paths.dist.js));
    });
    return $.mergeStream(tasks);
});

/**
 * Stylesheets
 * PostCSS processors list order is important. css-import has be first
 * and cssnano needs to be last
 */
var processors = [
    $.postcssImport,
    $.postcssCssnext()
];

gulp.task('buildcss', ['stylelint'], function () {
    return gulp.src(config.paths.src.css)
        .pipe($.tap((file) => {
            logFile(file, 'Build CSS');
        }))
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.postcss(processors))
        .pipe($.rename('main.css'))
        .pipe(gulp.dest(config.paths.build.css));
});

gulp.task('css', ['buildcss'], () => {
    return gulp.src([
        config.paths.build.css + '/' + config.cssName,
        config.paths.build.fontello + '/css/icon.css'
    ])
        .pipe($.tap((file) => {
            $.fancyLog($.chalk.cyan('Merging CSS ') + $.chalk.blue(path.relative(file.cwd, file.path)) + ' into ' + $.chalk.green(config.paths.dist.css + '/' + config.cssName));
        }))
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.concat(config.cssName))
        .pipe($.cleanCss({level: 2, compatibility: 'ie8'}))
        .pipe($.header(banner))
        .pipe(gulp.dest(config.paths.dist.css))
});

/**
 * Stylesheet lint
 *
 * BEM Linter options sets the utilitySelectors just like
 * https://github.com/postcss/postcss-bem-linter/blob/master/lib/preset-patterns.js
 * but with "xs-" added in.
 */
var bemlinterOpts = {
    preset: 'suit',
    utilitySelectors: /^\.u-(xl-|xs-|sm-|md-|lg-)?(?:[a-z0-9][a-zA-Z0-9]*)+$/
};

gulp.task('stylelint', function () {
    return gulp.src(config.paths.src.stylelint)
        .pipe($.cached('Stylelint'))
        .pipe($.tap((file) => {
            logFile(file, 'Linting');
        }))
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.postcss([
            $.postcssBemLinter(bemlinterOpts),
            $.stylelint()
        ]));
});

/**
 * BranchCMS theme files
 */
gulp.task('theme', function() {
    return gulp.src(config.paths.src.theme)
        .pipe($.changed(config.paths.dist.theme, {hasChanged: $.changed.compareContents}))
        .pipe($.tap((file) => {
            logFile(file, 'Theme');
        }))
        .pipe(gulp.dest(config.paths.dist.theme))
});

// Copy theme files from the src directory to the dist directory
gulp.task('push-theme', function() {
    return gulp.src(config.paths.src.theme)
        .pipe(gulp.dest(config.paths.dist.theme))
});
// Copy theme files from the dist directory to the src directory
gulp.task('pull-theme', function() {
    return gulp.src(config.paths.dist.themeFiles)
        .pipe(gulp.dest(config.paths.src.themeFolder))
});

/**
 * Build fonts
 */
gulp.task('fontello', (cb) => {
    if (typeof fontelloConfig.glyphs !== 'undefined' && fontelloConfig.glyphs.length > 0) {
        return gulp.src(config.paths.src.fontello)
            .pipe($.fontello({font: 'fonts'}))
            .pipe(gulp.dest(config.paths.build.fontello));
    } else {
        cb();
    }
});

gulp.task('fonts', ['fontello'], () => {
    return gulp.src(config.paths.build.fontello + '/fonts/**')
        .pipe(gulp.dest(config.paths.dist.fonts));
});

/**
 * Flattens an array and joins two together
 * @param {Array} prev
 * @param {Array} current
 * @returns {Array}
 */
function flatten(prev, current) {
    return prev.concat(current.src);
}

/**
 * Deletes a file
 *
 * @param {string} file The file to delete
 * @param {string} src The file source path
 * @param {string} dest The build destination path
 * @param {string} type The type of file. Used in the console message
 */
function deleteFile(file, src, dest, type) {
    // Output message of what is being deleted
    $.fancyLog('Deleting ' + type, $.chalk.red(file));
    // Get the relative path to the file
    var srcPath = path.relative(path.resolve(src), file);
    // Remove "../" from the path as it causes the destination path to be incorrect
    srcPath = srcPath.replace(/(\.\.\/)+/, '');
    // Combine the destination path and the source path to get the full path to the destination file
    var destPath = path.resolve(dest, srcPath);
    // Delete the file
    del.sync(destPath);
}

/**
 * Watch files for changes
 */
gulp.task('watch', function () {
    // Copy static assets
    $.globWatcher(config.copy.reduce(flatten, []), function(cb) {
        $.runSequence('copy', cb);
    });

    // Images
    $.globWatcher(config.paths.src.img, function(cb) {
        $.runSequence('images', cb);
    }).on('unlink', function(file) {
        deleteFile(file, config.paths.src.img, config.paths.dist.img, 'image');
    });

    // Scripts
    $.globWatcher(config.scripts.reduce(flatten, []), function(cb) {
        $.runSequence('scripts', cb);
    });

    // CSS
    $.globWatcher(config.paths.watch.css, function(cb) {
        $.runSequence('css', cb);
    });

    // Theme
    $.globWatcher(config.paths.src.theme, function(cb) {
        $.runSequence('theme', cb);
    }).on('unlink', function(file) {
        deleteFile(file, config.paths.src.theme, config.paths.dist.theme, 'theme file');
    });
});


/**
 * Main build tasks
 */
var buildTasks = [
    'copy', 'images', 'scripts', 'css', 'stylelint', 'theme', 'push-theme'
];

gulp.task('build', function (cb) {
    $.runSequence('fonts', buildTasks, cb);
});

gulp.task('default', function (cb) {
    $.runSequence('fonts', buildTasks, 'watch', cb);
});
