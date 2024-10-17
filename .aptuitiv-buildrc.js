/**
 * Configuration for the aptuitiv-build package.
 * See https://github.com/aptuitiv/website-build-tools/blob/main/docs/Configuration.md for more information.
 */
export default {
    copy: [
        {
            src: 'node_modules/@splidejs/splide/dist/**/*',
            dest: 'splide'
        },
        {
            src: 'node_modules/just-validate/dist/just-validate.production.min.js',
            dest: 'just-validate'
        },
        {
            src: 'node_modules/masonry-layout/dist/*.{pkgd.min.js, min.js}',
            dest: 'masonry'
        },
        {
            src: 'node_modules/fslightbox/index.js',
            dest: 'fslightbox'
        }
    ],
    css: {
        buildFiles: 'main.css'
    },
    javascript: {
        bundles: [
            {
                build: 'main.js',
                nodeModules: [
                    'jquery/dist/jquery.js'
                ],
                src: [
                    'navigation.js',
                    'main.js'
                ]
            }
        ],
        files: [
            'forms.js'
        ]
    }
};