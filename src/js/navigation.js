/* =========================================================================== *\
    JavaScript for navigation menus
\* =========================================================================== */

/**
 * Small screen navigation
 */

// eslint-disable-next-line
const smallScreenNav = {
    /**
     * Initialization
     */
    init() {
        const width = 768;

        // Select elements
        const button = document.querySelector('.js-ssNavBtn');
        const nav = document.querySelector('.js-navBar');
        const dropdowns = document.querySelectorAll('.js-dropdown');

        // Make sure that the navigation gets displayed if the window resizes.
        // If you resize to make the small screen nav display, show and hide the nav,
        // and then resize so that regular nav should show, the regular nav doesn't show
        // because there are inline styles on the nav to hide it.
        // We do this by clearing out any inline CSS styles so that the styles
        // from the stylesheet are used.
        window.addEventListener('resize', () => {
            if (window.innerWidth >= width) {
                nav.style.display = '';
                nav.style.opacity = '';
            }
        });

        /**
         * Function to toggle showing and hiding the small screen navigation
         */
        function toggleNav() {
            button.classList.toggle('is-active');
            if (nav.style.display === 'block') {
                nav.style.display = 'none';
            } else {
                nav.style.display = 'block';
            }
        }

        if (button !== null) {
            // Small screen nav menu (hamburger) button click
            button.addEventListener('click', (e) => {
                e.preventDefault();
                toggleNav();
            });
        }

        Array.from(dropdowns).forEach((dropdown) => {
            dropdown.addEventListener('click', (e) => {
                if (window.innerWidth <= width) {
                    e.preventDefault();
                    e.target.classList.toggle('is-active');
                    e.target.parentElement.classList.toggle('is-active');
                }
            });
        });
    },
};

/**
 * Adds accessibly functionality to the main navigation.
 * Adds support for navigating with the keyboard.
 *
 * Add "data-access-nav" attribute to the navigation menu.
 * Add "js-navLink" class to the navigation link tags.
 * Add "js-skip" class to any items that should be skipped. Useful for items
 *      that are hidden for small screens.
 * Add "js-dropdownMenu" class to the <ul> tag that contains the sub navigation
 * Add "js-dropdownParent" class to a <li> tag that contains a sub list for a drop down.
 * Add "js-dropdown" to any link tags that have a drop down.
 */
/**
 * Adds accessibly functionality to the main navigation.
 * Adds support for navigating with the keyboard.
 *
 * Add "data-access-nav" attribute to the navigation menu.
 * Add "js-navLink" class to the navigation link tags.
 * Add "js-skip" class to any items that should be skipped. Useful for items
 *      that are hidden for small screens.
 * Add "js-dropdownMenu" class to the <ul> tag that contains the sub navigation
 * Add "js-dropdownParent" class to a <li> tag that contains a sub list for a drop down.
 * Add "js-dropdown" to any link tags that have a drop down.
 */
// eslint-disable-next-line
const navAccess = {
    init() {
        const menus = document.querySelectorAll('[data-access-nav]');
        const self = this;
        if (menus.length > 0) {
            menus.forEach((menu) => {
                self.setupMenu(menu);
            });
        }
    },

    /**
     * Sets up the menu for accessibility
     *
     * @param {Element} menu The menu to work with
     */
    setupMenu(menu) {
        const nav = menu.querySelectorAll('.js-navLink');
        const self = this;
        let key;
        const next = ['ArrowDown', 'Down', 'Tab', 'Spacebar', ' '];
        const prev = ['ArrowUp', 'Up', 'Tab', 'Spacebar', ' '];
        const left = ['ArrowLeft', 'Left'];
        const right = ['ArrowRight', 'Right'];
        let focusEl;
        nav.forEach((item) => {
            // Handle the "keydown" event
            item.addEventListener('keydown', (e) => {
                key = e.key;
                if (next.indexOf(key) >= 0) {
                    // Going forwards
                    if (e.shiftKey) {
                        // Shift key was down
                        self.focus(e, e.target);
                    } else {
                        // Moving forward
                        self.focus(e, e.target, true);
                    }
                } else if (prev.indexOf(key) >= 0) {
                    // Going backwards
                    if (e.shiftKey) {
                        // Negating going backwards so going forwards
                        self.focus(e, e.target, true);
                    } else {
                        self.focus(e, e.target);
                    }
                } else if (left.indexOf(key) >= 0) {
                    // Jumping backwards
                    self.focus(e, e.target, false, true);
                } else if (right.indexOf(key) >= 0) {
                    // Jumping forwards
                    self.focus(e, e.target, true, true);
                } else if (key === 'Escape') {
                    // Close the menu
                    const parentLi = self.getParent(e.target).parentNode;
                    if (parentLi !== null) {
                        focusEl = self.getLink(parentLi);
                        focusEl.focus();
                    }
                }
            });
        });
    },

    /**
     * Move the focus to the next/previous element
     *
     * @param {object} event The event that triggered the focus
     * @param {Element} el The target of the keydown event
     * @param {boolean} [next] Whether or not moving to the next item
     * @param {boolean} jumping Whether or not jumping to the next top level navigation link
     */
    focus(event, el, next, jumping) {
        let focusEl = null;
        const isFirst = this.isDropdownFirst(el);
        const isLast = this.isDropdownLast(el);
        let sibling;
        if (next) {
            if (jumping) {
                // Jump to next top level navigation link
                this.deactivateParent(el);
                focusEl = this.getNextInLevel(this.getParent(el));
            } else {
                if (isLast) {
                    // Deactivate this dropdown
                    this.deactivateParent(el);
                }
                sibling = el.nextElementSibling;
                // If next element is a dropdown, expand it
                if (
                    sibling !== null
                    && sibling.nodeName.toLowerCase() === 'ul'
                ) {
                    this.activate(el.parentNode);
                }
                focusEl = this.getNextLink(el); // next navLink
            }
        } else if (jumping) {
            // Jump to previous top level navigation link
            this.deactivateParent(el);
            focusEl = this.getPrevInLevel(this.getParent(el));
        } else if (isFirst) {
            // Close dropdown and move to top level navigation
            this.deactivateParent(el);
            focusEl = this.getParent(el);
        } else {
            sibling = el.parentNode.previousElementSibling;
            if (
                sibling !== null
                && sibling.classList.contains('js-dropdownParent')
            ) {
                // Link before a sibling with dropdown (skip over dropdown)
                focusEl = this.getPrevInLevel(el);
            } else {
                // Get the previous navLink
                focusEl = this.getPrevLink(el);
            }
        }
        if (focusEl) {
            event.preventDefault();
            focusEl.focus();
        } else {
            el.blur();
        }
    },

    /**
     * Activates a drop down
     *
     * @param {Element} el The element to activate
     */
    activate(el) {
        if (el.classList.contains('js-dropdownParent')) {
            el.classList.add('is-active');
            // change the aria-expanded and aria-hidden values on the <ul> tag
            el.querySelector('a').setAttribute('aria-expanded', 'true');
        }
    },

    /**
     * Deactivates a drop down
     *
     * @param {Element} el The element to deactivate
     */
    deactivateParent(el) {
        const parent = this.getParent(el);
        parent.parentNode.classList.remove('is-active');
        // change the aria-expanded and aria-hidden values on the <ul> tag
        parent.setAttribute('aria-expanded', 'false');
    },

    /**
     * Returns returns true is the first element of a dropdown list
     *
     * @param {Element} el The element to work with
     * @returns {Element}
     */
    isDropdownFirst(el) {
        const dropdownNavs = Array.prototype.slice.call(
            this.getParent(el).parentNode.querySelectorAll('.js-navLink'),
        ); // get all children links in dropdown
        // if it is the first link (after the main navigation link)
        return dropdownNavs.indexOf(el) === 1;
    },

    /**
     * Returns true if the last element of a dropdown
     *
     * @param {Element} el The element to work with
     * @returns {Element}
     */
    isDropdownLast(el) {
        const dropdownNavs = Array.prototype.slice.call(
            this.getParent(el).parentNode.querySelectorAll('.js-navLink'),
        ); // get all children links in dropdown
        return dropdownNavs.indexOf(el) === dropdownNavs.length - 1; // if it is the last link
    },

    /**
     * Returns the index of this link out of all other navLinks
     *
     * @param {Element} el The element to work with
     * @returns {Element}
     */
    getLinkIndex(el) {
        const list = Array.prototype.slice.call(
            document.querySelectorAll('.js-navLink'),
        );
        return list.indexOf(el);
    },

    /**
     * Returns the index of the parent top level navigation
     *
     * @param {Element} el The element to work with
     * @returns {Element}
     */
    getParentIndex(el) {
        const list = Array.prototype.slice.call(el.parentNode.children);
        return list.indexOf(el);
    },

    /**
     * Returns the previous navLink
     *
     * @param {Element} el The element to work with
     * @returns {Element}
     */
    getPrevLink(el) {
        const list = Array.prototype.slice.call(
            document.querySelectorAll('.js-navLink'),
        );
        return list[this.getLinkIndex(el) - 1];
    },

    /**
     * Returns the next navLink
     *
     * @param {Element} el The element to work with
     * @returns {Element}
     */
    getNextLink(el) {
        const list = Array.prototype.slice.call(
            document.querySelectorAll('.js-navLink'),
        );
        return list[this.getLinkIndex(el) + 1];
    },

    /**
     * Returns the parent navigation link
     *
     * @param {Element} el The element to work with
     * @returns {Element}
     */
    getParent(el) {
        let node = el;
        while (node !== document.body) {
            if (
                node.classList.contains('js-dropdownParent')
                || node.parentNode.classList.contains('js-mainNav')
            ) {
                break;
            }
            node = node.parentNode;
        }
        return this.getLink(node);
    },

    /**
     * Returns the direct sibling navigation link before the active one
     *
     * @param {Element} el The element to work with
     * @returns {Element}
     */
    getPrevInLevel(el) {
        return this.getLink(el.parentNode.previousElementSibling);
    },

    /**
     * Returns the direct sibling navigation link after the active one
     *
     * @param {Element} el The element to work with
     * @returns {Element}
     */
    getNextInLevel(el) {
        return this.getLink(el.parentNode.nextElementSibling);
    },

    /**
     * Gets the first navigation in the element
     *
     * @param {Element} el The element to get the link for
     * @returns {Element}
     */
    getLink(el) {
        return el ? el.querySelector('a.js-navLink') : null;
    },
};
