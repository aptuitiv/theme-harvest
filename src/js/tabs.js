/* ===========================================================================
    Provides functionality for accessible tabs
    Keyboard navigation based on:
    https://www.w3.org/TR/wai-aria-practices-1.1/examples/tabs/tabs-1/tabs.html
=========================================================================== */

import { supportsHistoryApi } from './lib/url-history';

/**
 * Tabs functionality
 */
const tabs = {
    /**
     * Whether or not to use the hash in the URL with tabs
     *
     * @private
     */
    useHash: true,

    /**
     * The tab orientation. Either 'horizontal' or 'vertical'.
     * Determines which arrow keys navigate between tabs.
     *
     * @private
     */
    orientation: 'horizontal',

    /**
     * Delay in milliseconds before a focused tab is automatically activated
     *
     * @private
     */
    focusDelay: 300,

    /**
     * Holds the tab handle elements
     *
     * @private
     */
    tabHandles: null,

    /**
     * Holds the tab link elements (.js-tab)
     *
     * @private
     */
    tabLinks: null,

    /**
     * Holds the tab body elements
     *
     * @private
     */
    tabContents: null,

    /**
     * Holds the hash of the current page
     *
     * @private
     */
    hash: null,

    /**
     * Holds the base page title
     *
     * @private
     */
    baseTitle: null,

    /**
     * Initialization
     */
    init() {
        // Set up variables
        this.baseTitle = document.title;
        this.tabHandles = document.querySelectorAll('.js-tabHandle');
        this.tabContents = document.querySelectorAll('.js-tabContent');

        if (this.tabHandles.length > 0 && this.tabContents.length > 0) {
            // Collect all tab links
            this.tabLinks = [];
            this.tabHandles.forEach((tabHandle) => {
                const tabLink = tabHandle.querySelector('.js-tab');
                if (tabLink != null) {
                    this.tabLinks.push(tabLink);
                }
            });

            // Set up ARIA attributes on tab panels
            this.tabContents.forEach((tabContent) => {
                tabContent.setAttribute('role', 'tabpanel');
                tabContent.setAttribute('hidden', '');
            });

            // Set up ARIA attributes on tab links and initial state
            this.tabLinks.forEach((tabLink) => {
                const tabHandle = tabLink.closest('.js-tabHandle');
                const panelId = tabHandle ? tabHandle.dataset.tab : null;
                tabLink.setAttribute('role', 'tab');
                tabLink.setAttribute('aria-selected', 'false');
                tabLink.setAttribute('tabindex', '-1');
                if (panelId) {
                    tabLink.setAttribute('aria-controls', panelId);
                }
            });

            // Open first tab on load
            const firstTab = this.tabContents[0];
            firstTab.removeAttribute('hidden');
            this.tabHandles.forEach((tabHandle) => {
                if (tabHandle.dataset.tab === firstTab.id) {
                    tabHandle.classList.add('is-active');
                    const tabLink = tabHandle.querySelector('.js-tab');
                    if (tabLink != null) {
                        tabLink.setAttribute('aria-selected', 'true');
                        tabLink.removeAttribute('tabindex');
                    }
                }
            });

            // Handle clicking on a tab to show/hide tabs
            this.tabHandles.forEach((tabHandle) => {
                const tabLink = tabHandle.querySelector('.js-tab');
                if (tabLink != null) {
                    tabLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.getTab(e.currentTarget);
                        this.activate(
                            typeof tabLink.dataset.scroll !== 'undefined',
                        );
                    });

                    // Keyboard navigation
                    tabLink.addEventListener('keydown', (e) => {
                        this.handleKeydown(e);
                    });
                }
            });

            // Handle URL hashes if requested
            if (this.useHash) {
                // Load a tab from the location hash
                if (window.location.hash.length > 0) {
                    this.hash = window.location.hash.replace('#', '');
                    this.activateTabByHash();
                }

                window.addEventListener(
                    'hashchange',
                    () => {
                        if (this.hash !== window.location.hash) {
                            // The hash is different from the current hash
                            this.hash = window.location.hash.replace('#', '');
                            this.activateTabByHash();
                        }
                    },
                    false,
                );
            }
        }
    },

    /**
     * Handles keydown events on tab links for keyboard navigation
     *
     * @param {KeyboardEvent} e The keydown event
     * @private
     */
    handleKeydown(e) {
        const currentIndex = this.tabLinks.indexOf(e.currentTarget);
        if (currentIndex === -1) {
            return;
        }

        let newIndex = null;

        if (e.key === 'ArrowLeft' && this.orientation === 'horizontal') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : null;
        } else if (
            e.key === 'ArrowRight' &&
            this.orientation === 'horizontal'
        ) {
            newIndex =
                currentIndex < this.tabLinks.length - 1
                    ? currentIndex + 1
                    : null;
        } else if (e.key === 'ArrowUp' && this.orientation === 'vertical') {
            e.preventDefault();
            newIndex = currentIndex > 0 ? currentIndex - 1 : null;
        } else if (e.key === 'ArrowDown' && this.orientation === 'vertical') {
            e.preventDefault();
            newIndex =
                currentIndex < this.tabLinks.length - 1
                    ? currentIndex + 1
                    : null;
        } else if (e.key === 'Home') {
            e.preventDefault();
            newIndex = 0;
        } else if (e.key === 'End') {
            e.preventDefault();
            newIndex = this.tabLinks.length - 1;
        }

        if (newIndex !== null) {
            const targetLink = this.tabLinks[newIndex];
            targetLink.focus();
            // Automatically activate the tab after the focus delay
            setTimeout(() => {
                if (targetLink === document.activeElement) {
                    this.getTab(targetLink);
                    this.activate();
                }
            }, this.focusDelay);
        }
    },

    /**
     * Sets whether or not to use the hash
     *
     * @param {boolean} use Whether to use the hash
     */
    setUseHash(use) {
        this.useHash = use;
    },

    /**
     * Sets the tab orientation
     *
     * @param {string} orientation Either 'horizontal' or 'vertical'
     */
    setOrientation(orientation) {
        if (orientation === 'horizontal' || orientation === 'vertical') {
            this.orientation = orientation;
        }
    },

    /**
     * Sets the focus delay
     *
     * @param {number} delay Delay in milliseconds
     */
    setFocusDelay(delay) {
        if (typeof delay === 'number' && delay >= 0) {
            this.focusDelay = delay;
        }
    },

    /**
     * Gets the tab information for the clicked tab link
     *
     * @param {HTMLElement} link The link clicked
     * @private
     */
    getTab(link) {
        if (link.href.includes('#') && this.useHash) {
            this.hash = link.href.split('#')[1].replace('Tab', '');
            if (supportsHistoryApi()) {
                window.history.pushState(null, null, `#${this.hash}`);
            } else {
                window.location.hash = this.hash;
            }
            const title = link.getAttribute('data-title');
            if (typeof title !== 'undefined' && title !== null) {
                document.title = `${this.baseTitle} - ${title}`;
            }
        }
    },

    /**
     * Gets the correct tab by the window location hash and activates it
     *
     * @private
     */
    activateTabByHash() {
        const firstValidTab = Array.from(this.tabHandles).find((handle) => {
            let returnValue = false;
            if (handle.dataset.tab === `${this.hash}Tab`) {
                // checkVisibility is a new function. Test if it exists before calling it.
                // https://developer.mozilla.org/en-US/docs/Web/API/Element/checkVisibility
                if (typeof handle.checkVisibility === 'function') {
                    returnValue = handle.checkVisibility();
                } else {
                    returnValue = true;
                }
            }
            return returnValue;
        });
        if (firstValidTab != null) {
            const firstValidTabLink = firstValidTab.querySelector('.js-tab');
            if (firstValidTabLink != null) {
                this.getTab(firstValidTabLink);
                this.activate();
                // Scroll to the tab automatically
                window.scroll(
                    0,
                    firstValidTab.getBoundingClientRect().top - 10,
                );
            }
        }
    },

    /**
     * Activates the correct tab
     *
     * @param {boolean} scrollTabIntoView Whether to scroll the tab into view. This allows a non-tab link on the
     *                           page to scroll to the tab when it is activated
     */
    activate(scrollTabIntoView = false) {
        // Reset all handles and ARIA state on tab links
        this.tabHandles.forEach((tabHandle) => {
            tabHandle.classList.remove('is-active');
            const tabLink = tabHandle.querySelector('.js-tab');
            if (tabLink != null) {
                tabLink.setAttribute('aria-selected', 'false');
                tabLink.setAttribute('tabindex', '-1');
            }
        });

        // Reset all bodies
        this.tabContents.forEach((tabContent) => {
            tabContent.setAttribute('hidden', '');
        });

        // Activate current handles.
        // There could be multiple tab handles if there are duplicate tabs for a small-screen and large-screen view.
        const currentHandles = Array.from(this.tabHandles).filter(
            (handle) => handle.dataset.tab === `${this.hash}Tab`,
        );
        if (currentHandles.length > 0) {
            currentHandles.forEach((currentHandle) => {
                currentHandle.classList.add('is-active');
                const tabLink = currentHandle.querySelector('.js-tab');
                if (tabLink != null) {
                    tabLink.setAttribute('aria-selected', 'true');
                    tabLink.removeAttribute('tabindex');
                }
            });
        }

        // Activate current body
        const currentBody = Array.from(this.tabContents).find(
            (body) => body.id === `${this.hash}Tab`,
        );
        if (currentBody != null) {
            currentBody.removeAttribute('hidden');
            if (scrollTabIntoView) {
                window.scroll(0, currentBody.getBoundingClientRect().top - 30);
            }
        }
    },
};

export default tabs;
