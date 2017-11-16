// The source directory to build from
var src = 'src';
// The base directory to build into. A temporary location for things that need to be built first before moving to distribution
var build = '_build';
// The full destination folder where assets (images, css, js) will be built into for distribution
var dist = 'dist/theme/custom';

/**
 * Data that is set to the config variable in gulpfile.js
 */
module.exports = {
    /**
     * Holds the name of the CSS file to be generated
     */
    cssName: 'main.css',

    /**
     * Paths for different asset sources and their distribution path
     */
    paths: {
        src: {
            css: [src + '/css/index.css'],
            fontello: src + '/fonts/fontello-config.json',
            img: src + '/images/**/*.{png,jpg,gif,svg}',
            stylelint: [src + '/css/**/*.css'],
            theme: src + '/theme/**/*.twig',
            themeFolder: src + '/theme'
        },
        build: {
            base: build,
            css: build + '/css',
            fontello: build + '/fontello'
        },
        dist: {
            base: dist,
            css: dist + '/css',
            fonts: dist + '/fonts',
            img: dist + '/images',
            js: dist + '/js',
            theme: dist + '/templates',
            themeFiles: dist + '/templates/**/*.twig'
        },
        watch: {
            css: [src + '/css/**/*.css']
        }
    },

    /**
     * Files to copy from another folder, typically node_modules.
     * src is the files to get
     * dest is the folder within the root 'dist' folder to put
     */
    copy: [
        {
            src: ['node_modules/magnific-popup/dist/**/*.{css,min.js}'],
            dest: 'magnific'
        },
        {
            src: ['node_modules/slick-carousel/slick/*.{css,min.js,gif}'],
            dest: 'slick'
        },
        {
            src: ['node_modules/slick-carousel/slick/fonts/*'],
            dest: 'slick/fonts'
        }
    ],

    /**
     * Path to export the theme files to and from.
     * This creates a folder that can simply be copied to start a new website from this theme
     */
    export: {
        dest: '_export',
        src: [
            {
                src: src + '/**/*',
                dest: 'src'
            },
            {
                src: '.editorconfig',
                dest: ''
            },
            {
                src: '.gitignore',
                dest: ''
            },
            {
                src: '.stylelintrc',
                dest: ''
            },
            {
                src: 'config.js',
                dest: ''
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
    },

    /**
     * Scripts to build
     * name: The name of the file to build
     * src: The sources for the file
     */
    scripts: [
        {
            name: 'main.js',
            src: [
                src + '/scripts/modernizr-flexbox-detection.js',
                'node_modules/jquery/dist/jquery.js',
                src + '/js/main.js'
            ]
        },
        {
            name: 'forms.js',
            src: [
                'node_modules/jquery-validation/dist/jquery.validate.js',
                'node_modules/jquery-form/src/jquery.form.js',
                src + '/js/forms.js'
            ]
        }
    ]
};
