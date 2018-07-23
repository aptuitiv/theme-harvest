// Configuration
const config = require('./config.js');

// Load gulp
const gulp = require('gulp');


// Load all variables in "devDependencies" into the variable $
const $ = require('gulp-load-plugins')({
    pattern: ['*'],
    scope: ['devDependencies']
});

// Load node packages
const del = require('del');
const path = require('path');
const fs = require('fs');

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

/**
 * Logs the current file being dealt with
 * @param {object} file The file object
 * @param {string} [prefix] The log prefix
 */
function logFile(file, prefix) {
    prefix = prefix || 'Using'
    log(path.relative(file.cwd, file.path), prefix);
}

/**
 * Log something with an optional prefix
 * @param {string} content The string to log
 * @param {string} [prefix] The log prefix
 */
function log(content, prefix) {
    if (typeof prefix !== 'undefined' && prefix.length > 0) {
        $.fancyLog($.chalk.cyan(prefix) + ' ' + $.chalk.magenta(content));
    } else {
        $.fancyLog($.chalk.magenta(content));
    }
}

/**
 * Logs moving a file from one location to another
 * @param {string} message The text to prefix the files
 * @param {object|string} file The file being moved
 * @param {string} dest The destination location
 */
function logFileTo(message, file, dest) {
    if (typeof file === 'string') {
        $.fancyLog($.chalk.cyan(message) + ' ' + $.chalk.blue(file) + ' to ' + $.chalk.green(dest));
    } else {
        $.fancyLog($.chalk.cyan(message) + ' ' + $.chalk.blue(path.relative(file.cwd, file.path)) + ' to ' + $.chalk.green(dest));
    }
}

/**
 * Process an array of data synchronously.
 *
 * @link https://gist.github.com/steve-taylor/5075717
 * Updated slightly to be ES6
 *
 * @param data An array of data.
 * @param processData A function that processes an item of data.
 *                    Signature: function(item, i, callback), where {@code item} is the i'th item,
 *                               {@code i} is the loop index value and {@code calback} is the
 *                               parameterless function to call on completion of processing an item.
 */
function doSynchronousLoop(data, processData, done) {
    if (data.length > 0) {
        const loop = (data, i, processData, done) => {
            processData(data[i], i, () => {
                if (++i < data.length) {
                loop(data, i, processData, done);
            } else {
                done();
            }
        });
        };
        loop(data, 0, processData, done);
    } else {
        done();
    }
}

/**
 * Copy Static assets
 */
gulp.task('copy', () => {
    var assets = config.copy.map(function (entry) {
        return gulp.src(entry.src)
            .pipe($.newer(config.paths.dist.base + '/' + entry.dest))
            .pipe($.tap((file) => {
                    logFileTo('Copying', file, config.paths.dist.base + '/' + entry.dest);
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
                    logFileTo('Merging script', file, config.paths.dist.js + '/' + entry.name);
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

gulp.task('css', ['stylelint'], () => {
    var tasks = config.paths.src.css.map(function(cssFile) {
        return gulp.src(cssFile)
            .pipe($.tap((file) => {
                    logFile(file, 'Start Build CSS');
    }))
        .pipe($.plumber({errorHandler: onError}))
            .pipe($.postcss(processors))
            .pipe($.cleanCss({level: 2, compatibility: 'ie8'}))
            .pipe($.changedInPlace({firstPass: true}))
            .pipe($.header(banner))
            .pipe($.tap((file) => {
                    logFile(file, 'Output CSS');
    }))
        .pipe(gulp.dest(config.paths.dist.css));
    });
return $.mergeStream(tasks);
});

/**
 * Generate the critical CSS for each template
 */
gulp.task('criticalcss', (callback) => {
    doSynchronousLoop(config.criticalCss, generateCriticalCSS, () => {
    callback();
});
});

/**
 * Generate the critical CSS
 * @param {object} data The template data
 * @param {integer} i The loop value index
 * @param {function} callback The parameterless function to call on completion
 */
function generateCriticalCSS(data, i, callback) {
    const src = config.url + data.url;
    const dest = config.paths.src.themeFolder + '/snippets/criticalcss-' + data.template + '.twig';
    logFileTo('Critical CSS', src, dest);

    $.penthouse({
        url: src,
        css: config.paths.dist.css  + '/' + config.cssName,
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
        $.fancyLog($.chalk.red('ERROR generating Critial CSS: ') + err);
    callback();
});
}

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
 * Process the theme config file
 */
gulp.task('theme-config', () => {
    return gulp.src(config.paths.src.base + '/theme.json')
        .pipe($.tap((file) => {
                logFile(file, 'Theme Config');
}))
.pipe(gulp.dest(config.paths.dist.base));
});

/**
 * Export theme files into a folder for distribution
 */
gulp.task('export-theme', () => {
    var assets = config.export.src.map(function (entry) {
        return gulp.src(entry.src)
            .pipe($.newer(config.export.dist + '/' + entry.src))
            .pipe($.tap((file) => {
                    logFileTo('Exporting the file', file, config.export.dest + '/' + entry.dest);
    }))
        .pipe($.plumber({errorHandler: onError}))
            .pipe(gulp.dest(config.export.dest + '/' + entry.dest));
    });
return $.mergeStream(assets);
});

/**
 * Take the icons in src/icons folder and generate an SVG sprite from them.
 * Insert the SVG sprite into a snippet
 */
gulp.task('svg-icon-sprite', () => {
    return gulp.src(config.paths.src.base + '/icons/**/*.svg')
        .pipe($.tap((file) => {
                logFile(file, 'SVG Icon Sprite');
}))
.pipe($.rename({prefix: 'icon-'}))
    .pipe($.svgmin(function (file) {
        var prefix = path.basename(file.relative, path.extname(file.relative));
        return {
            plugins: [{
                cleanupIDs: {
                    prefix: prefix + '-',
                    minify: true
                }
            }]
        }
    }))
    .pipe($.svgstore({ inlineSvg: true }))
    .pipe($.rename('svg-icons.twig'))
    .pipe(gulp.dest(config.paths.src.themeFolder + '/snippets'))
    .pipe($.tap((file) => {
            logFile(file, 'Generated SVG Twig File');
}));
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

    // SVG Icons
    $.globWatcher(config.paths.src.icon, function(cb) {
        $.runSequence('svg-icon-sprite', cb);
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

    // Theme config
    $.globWatcher(config.paths.src.base + '/theme.json', function(cb) {
        $.runSequence('theme-config', cb);
    });
});


/**
 * Main build tasks
 */
var buildTasks = [
    'copy', 'images', 'scripts', 'css', 'stylelint', 'theme', 'push-theme'
];

gulp.task('build', function (cb) {
    $.runSequence(buildTasks, cb);
});

gulp.task('default', function (cb) {
    $.runSequence(buildTasks, 'watch', cb);
});
