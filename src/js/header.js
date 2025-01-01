/**
 * Handle all functionality pertaining to the sticky header
 */
const stickyHeader = { // eslint-disable-line no-unused-vars
    init() {
        this.observeSticky();
    },

    /**
     * Watches a DOM element and adds a class to it if it's sticky or not.
     * Depends on certain browser features so this will only work in modern browsers.
     * Inspired by https://developers.google.com/web/updates/2017/09/sticky-headers
     */
    observeSticky() {
        /**
         * Test to see if the required features exist before doing anything else.
         * Browsers that don't support all this either won't have the sticky
         * element (because it doesn't support the CSS) or it won't have the notification that
         * the element is sticky because it doesn't support the following Javascript features.
         */
        if ('IntersectionObserver' in window && typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('position', 'sticky')) {
            const headerEl = document.querySelector('.js-stickyHeader');
            if (headerEl) {
                const config = {
                    offset: 0,
                    lowThreshold: 0.25,
                    highThreshold: 0.75,
                };
                /**
                 * Create an element before the sticky element to watch.
                 * Because styles could be changing on the sticky element (like height) it's important
                 * for this sentinel element to be at least half the height of the sticky element. That
                 * way the sticky element won't be changed to quickly. If you're scrolling really slowly
                 * then it would be possible to trigger the sticky/unsticky event rapidly, which looks
                 * bad. This sentinel element prevents that.
                 */
                const sentinel = document.createElement('div');
                let style = `position: absolute; z-index: -1; width: 1px; height: ${headerEl.clientHeight / 2}px;`;
                if (typeof config.offset === 'number') {
                    style += ` top: -${config.offset}px;`;
                }
                sentinel.style = style;
                headerEl.parentNode.insertBefore(sentinel, headerEl);

                // Setup the observer
                const observer = new IntersectionObserver(((entries) => {
                    entries.forEach((entry) => {
                        // Check for stickyness by checking how much of the element is visible
                        if (entry.intersectionRatio <= config.lowThreshold) {
                            // Less than the low threshold percentage of the
                            // sentinel is visible so mark the element as sticky
                            headerEl.classList.add('is-sticky');
                        } else if (entry.intersectionRatio >= config.highThreshold) {
                            // More than this high threshold of the sentinel is visible,
                            // almost to the top of the element so mark it as not sticky
                            headerEl.classList.remove('is-sticky');
                        }
                    });
                }), {
                    threshold: [config.lowThreshold, config.highThreshold],
                });
                // Observe the visibility of the sentinel
                observer.observe(sentinel);
            }
        }
    },
};
