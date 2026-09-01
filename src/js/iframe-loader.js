/* ===========================================================================
    Load an iframe when it becomes visible in the viewport.
    Concatenated into the main bundle, so this is a global rather than a module.
=========================================================================== */

/* eslint-disable no-unused-vars */

/**
 * Load an iframe when it is visible in the viewport
 *
 * @param {Element} element The element to load the iframe into
 * @param {string} src The iframe source
 * @param {string} title The iframe title
 * @param {string} [className] The iframe class name
 */
const loadIframeOnObserve = (element, src, title, className = '') => {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    observer.disconnect();

                    const loadingEl = document.createElement('div');
                    loadingEl.innerText = 'Loading...';
                    loadingEl.className =
                        'flex align-center justify-center h-100';

                    const iframeEl = document.createElement('iframe');
                    iframeEl.title = title;
                    iframeEl.src = src;
                    iframeEl.className = className;
                    // Hide with opacity instead of "display: none" so that the iframe still has
                    // its full width and height while loading. Providers like YouTube pick their
                    // preview image size based on the player size when it initializes and a
                    // display-less iframe would get a low resolution preview image.
                    iframeEl.style.opacity = '0';

                    element.appendChild(loadingEl);
                    element.appendChild(iframeEl);

                    iframeEl.addEventListener('load', () => {
                        element.removeChild(loadingEl);
                        iframeEl.style.opacity = '';
                    });
                }
            });
        },
        {
            rootMargin: '200px',
        },
    );
    observer.observe(element);
};
