/**
 * Configuration for the aptuitiv-build package.
 * See https://github.com/aptuitiv/website-build-tools/blob/main/docs/Configuration.md for more information.
 */
export default {
    copy: [
        {
            src: [
                'node_modules/@splidejs/splide/dist/css/splide.min.css',
                'node_modules/@splidejs/splide/dist/js/splide.min.js',
                'node_modules/@splidejs/splide-extension-video/dist/js/splide-extension-video.min.js',
                'node_modules/@splidejs/splide-extension-video/dist/css/splide-extension-video.min.css'
            ],
            dest: 'splide'
        },
        {
            src: 'node_modules/just-validate/dist/just-validate.production.min.js',
            dest: 'just-validate'
        },
        {
            src: 'node_modules/masonry-layout/dist/*.{pkgd.min.js, min.js}',
            dest: 'masonry'
        }
    ],
    css: {
        buildFiles: '*.css'
    },
    eslint: {
        ignores: ['fslightbox.js']
    },
    javascript: {
        bundles: [
            {
                build: 'main.js',
                nodeModules: [
                    'micromodal/dist/micromodal.min.js'
                ],
                src: [
                    'script-loader.js',
                    'iframe-loader.js',
                    'notifications.js',
                    'navigation.js',
                    'accordion.js',
                    'main.js'
                ]
            },
            {
                build: 'lightbox.js',
                src: [
                    'fslightbox.js'
                ]
            }
        ],
        files: []
    }
};
