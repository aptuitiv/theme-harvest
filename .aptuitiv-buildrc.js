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
                'node_modules/@splidejs/splide-extension-video/dist/css/splide-extension-video.min.css',
            ],
            dest: 'splide',
        },
        {
            src: 'node_modules/just-validate/dist/just-validate.production.min.js',
            dest: 'just-validate',
        },
        {
            src: 'node_modules/masonry-layout/dist/*.{pkgd.min.js, min.js}',
            dest: 'masonry',
        },
    ],
    css: {
        buildFiles: '*.css',
    },
    eslint: {
        ignores: ['fslightbox.js'],
    },
    javascript: {
        bundles: [
            {
                build: 'lightbox.js',
                src: ['fslightbox.js'],
            },
        ],
        entryPoints: [
            {
                in: 'main.js',
                out: 'main',
                config: { globalName: 'main' },
                bundle: {
                    nodeModules: ['micromodal/dist/micromodal.min.js'],
                    src: ['form.js', 'iframe-loader.js', 'script-loader.js'],
                },
            },
        ],
        files: ['tabs.js'],
    },
};
