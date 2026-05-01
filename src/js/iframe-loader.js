/* eslint-disable no-unused-vars */
/**
 * Load an iframe when it is visible in the viewport
 *
 * @param {Element} element The element to load the iframe into
 * @param {string} src The iframe source
 * @param {string} title The iframe title
 * @param {string} className The iframe class name
 */
const loadIframeOnObserve = (element, src, title, className) => {
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
                    if (typeof className === 'string') {
                        iframeEl.className = className;
                    }
                    iframeEl.style.visibility = 'hidden';

                    element.appendChild(loadingEl);
                    element.appendChild(iframeEl);

                    iframeEl.addEventListener('load', () => {
                        element.removeChild(loadingEl);
                        iframeEl.style.visibility = 'visible';
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
