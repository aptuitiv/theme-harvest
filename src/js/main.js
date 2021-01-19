/* =========================================================================== *\
    Global Javascript for all pages
\* =========================================================================== */


$(function() {
    smallScreenNav.init();
    navAccess.init();
    setupNotifications();

    if (document.documentElement.clientWidth > 800) {
        observeSticky(document.querySelector('.js-header'));
    }
});
/**
 * Watches a DOM element and adds a class to it if it's sticky or not.
 * Depends on certain browser features so this will only work in modern browsers.
 * Inspired by https://developers.google.com/web/updates/2017/09/sticky-headers
 * @param {Element} el The DOM element to mark as sticky
 */
function observeSticky(el, options) {
    /**
     * Test to see if the required features exist before doing anything else.
     * Browsers that don't support all this either won't have the sticky element (becuase it doesn't support the CSS)
     * or it won't have the notification that the element is sticky because it doesn't support the following Javascript features.
     */
    if ('IntersectionObserver' in window && typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('position', 'sticky')) {
        var config = {
            offset: 0,
            lowThreshold: .25,
            highThreshold: .75
        };
        if (isObject(options)) {
            config = extend(config, options);
        }
        /**
         * Create an element before the sticky element to watch.
         * Because styles could be changing on the sticky element (like height) it's important
         * for this sentinel element to be at least half the height of the sticky element. That way
         * the sticky element won't be changed to quickly. If you're scrolling really slowly then it would
         * be possible to trigger the sticky/unsticky event rapidly, which looks bad. This sentinel element
         * prevents that.
         */
        var sentinel = document.createElement('div'),
            style = 'position: absolute; z-index: -1; width: 1px; height: ' + el.clientHeight / 2 + 'px;';
        if (isNumber(config.offset)) {
            style += ' top: -' + config.offset + 'px;';
        }
        sentinel.style = style;
        el.parentNode.insertBefore(sentinel, el);

        // Setup the observer
        var observer = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                // Check for stickyness by checking how much of the element is visible
                if (entry.intersectionRatio <= config.lowThreshold) {
                    // Less than the low threshold percentage of the sentinel is visible so mark the element as sticky
                    el.classList.add('is-sticky');
                } else if (entry.intersectionRatio >= config.highThreshold) {
                    // More than this high threshold of the sentinel is visible, almost to the top of the element so mark it as not sticky
                    el.classList.remove('is-sticky');
                }
            });
        }, {
            threshold: [config.lowThreshold, config.highThreshold]
        });
        // Observe the visibility of the sentinel
        observer.observe(sentinel);
    }
}

/**
 * Small screen navigation
 */
var smallScreenNav = {
    button: null,
    /**
     * Holds the navigation object
     * @type jQuery
     * @private
     */
    nav: null,

    /**
     * The max window width where the small screen navigation is shown
     * @type number
     * @private
     */
    width: 1050,

    /**
     * Initialization
     */
    init: function() {
        var self = this;
        this.button = $('.js-ssNavBtn');
        this.nav = $('.js-mainNav');

        this.button.on('click', function(e) {
            e.preventDefault();
            self.button.toggleClass('is-active');
            self.nav.toggle();
        });

        $('.js-dropdown').on('click', function(e) {
            if ($(window).width() <= self.width) {
                e.preventDefault();
                $(this).toggleClass('is-active').parent().toggleClass('is-active');
            }
        });
    }
};



/**
 * Adds accessibly functionality to the main navigation.
 * Adds support for navigating with the keyboard.
 *
 * Add "data-access-nav" attribute to the navigation menu.
 * Add "js-navLink" class to the navigation link tags.
 * Add "js-skip" class to any items that should be skipped. Useful for items that are hidden for small screens.
 * Add "js-dropdownMenu" class to the <ul> tag that contains the sub navigation
 * Add "js-dropdownParent" class to a <li> tag that contains a sub list for a drop down.
 * Add "js-dropdown" to any link tags that have a drop down.
 */
var navAccess = {
    init: function () {
        var menus = document.querySelectorAll('[data-access-nav]'),
            _self = this;
        if (menus.length > 0) {
            menus.forEach(function (menu) {
                _self.setupMenu(menu);
            });
        }
    },

    /**
     * Sets up the menu for accessibility
     * @param {Element} menu
     */
    setupMenu: function (menu) {
        var nav = menu.querySelectorAll('.js-navLink'),
            subs = menu.querySelectorAll('.js-dropdownMenu'),
            mainnav = menu.children,
            _self = this,
            key,
            next = ['ArrowDown', 'Down', 'Tab', 'Spacebar', ' '],
            prev = ['ArrowUp', 'Up', 'Tab', 'Spacebar', ' '],
            left = ['ArrowLeft', 'Left'],
            right = ['ArrowRight', 'Right'],
            focusEl;
        if (subs.length > 0) {
            subs.forEach(function (sub) {
                sub.setAttribute('role', 'menu');
                /*sub.setAttribute('aria-hidden', true);*/
            });
        }
        for(var li = 0; li < mainnav.length; li++){
            mainnav[li].setAttribute('tabindex', '0');
            mainnav[li].addEventListener('focus', function (e) {
                this.querySelector('.js-navLink').focus();
            }.bind(mainnav[li]));
        }
        nav.forEach(function (item) {
            // Handle the "keydown" event
            item.addEventListener('keydown', function (e) {
                key = e.key;
                if (next.indexOf(key) >= 0) {
                    // Going forwards
                    if (e.shiftKey) {
                        // Shift key was down
                        _self.focus(e, e.target);
                    } else {
                        // Moving forward
                        _self.focus(e, e.target, true);
                    }
                } else if (prev.indexOf(key) >= 0) {
                    // Going backwards
                    if (e.shiftKey) {
                        // Negating going backwards so going forwards
                        _self.focus(e, e.target, true);
                    } else {
                        _self.focus(e, e.target);
                    }
                } else if (left.indexOf(key) >= 0) {
                    // Jumping backwards
                    _self.focus(e, e.target, false, true);
                } else if (right.indexOf(key) >= 0) {
                    // Jumping forwards
                    _self.focus(e, e.target, true, true);

                } else if (key == 'Escape') {
                    // Close the menu
                    var parentLi = _self.getParent(e.target).parentNode;
                    if (parentLi !== null) {
                        focusEl = _self.getLink(parentLi);
                        focusEl.focus();
                    }
                }
            });
        });
    },

    /**
     * Move the focus to the next/previous element
     * @param {object} event The event that triggered the focus
     * @param {Element} el The target of the keydown event
     * @param {boolean} [next] Whether or not moving to the next item
     */
    focus: function (event, el, next, jumping) {
        var focusEl = null,
            isFirst = false,
            isLast = this.isDropdownLast(el),
            isFirst = this.isDropdownFirst(el),
            sibling;
        if (next) {
            if (jumping) {
                // Jump to next top level navigation link
                this.deactivateParent(el);
                focusEl = this.getNextInLevel(this.getParent(el));
            } else {
                if(isLast) {
                    // Deactivate this dropdown
                    this.deactivateParent(el);
                }
                sibling = el.nextElementSibling;
                // If next element is a dropdown, expand it
                if (sibling !== null && sibling.nodeName.toLowerCase() == 'ul') {
                    this.activate(el.parentNode);
                }
                focusEl = this.getNextLink(el); // next navLink
            }
        } else {
            if (jumping) {
                // Jump to previous top level navigation link
                this.deactivateParent(el);
                focusEl = this.getPrevInLevel(this.getParent(el));
            } else {
                if (isFirst) {
                    // Close dropdown and move to top level navigation
                    this.deactivateParent(el);
                    focusEl = this.getParent(el);
                } else {
                    sibling = el.parentNode.previousElementSibling;
                    if (sibling !== null && sibling.classList.contains('js-dropdownParent')) {
                        focusEl = this.getPrevInLevel(el); // Link before a sibling with dropdown (skip over dropdown)
                    }else{
                        focusEl = this.getPrevLink(el); //Get the previous navLink
                    }
                }
            }
        }
        if (focusEl !== null) {
            event.preventDefault();
            focusEl.focus();
        }
    },

    /**
     * Activates a drop down
     * @param {Element} el
     */
    activate: function (el) {
        if (el.classList.contains('js-dropdownParent')) {
            el.classList.add('is-active');
            // change the aria-expanded and aria-hidden values on the <ul> tag
            var ul = el.querySelector('ul');
            if (ul !== null) {
                ul.setAttribute('aria-expanded', 'true');
                /*ul.setAttribute('aria-hidden', 'false');*/
            }
        }
    },
    /**
     * Deactivates a drop down
     * @param {Element} el
     */
    deactivateParent: function (el) {
        var parent = this.getParent(el);
        parent.parentNode.classList.remove('is-active');
        // change the aria-expanded and aria-hidden values on the <ul> tag
        var ul = parent.querySelector('ul');
        if (ul !== null) {
            ul.setAttribute('aria-expanded', 'false');
            /*ul.setAttribute('aria-hidden', 'true');*/
        }
    },
    // Returns returns true is the first element of a dropdown list
    isDropdownFirst: function(el) {
        var dropdownNavs = Array.prototype.slice.call(this.getParent(el).parentNode.querySelectorAll('.js-navLink')); // get all children links in dropdown
        return dropdownNavs.indexOf(el) === 1; // if it is the first link (after the main navigation link)
    },
    // Returns true if the last element of a dropdown
    isDropdownLast: function(el) {
        var dropdownNavs = Array.prototype.slice.call(this.getParent(el).parentNode.querySelectorAll('.js-navLink')); // get all children links in dropdown
        return dropdownNavs.indexOf(el) === (dropdownNavs.length - 1); // if it is the last link
    },
    // Returns the index of this link out of all other navLinks
    getLinkIndex: function(el) {
        var list = Array.prototype.slice.call(document.querySelectorAll('.js-navLink'));
        return list.indexOf(el);
    },
    // Returns the index of the parent top level navigation
    getParentIndex: function(el) {
        var list = Array.prototype.slice.call(el.parentNode.children);
        return list.indexOf(el);
    },
    // Returns the previous navLink
    getPrevLink: function (el) {
        var list = Array.prototype.slice.call(document.querySelectorAll('.js-navLink'));
        return list[this.getLinkIndex(el) - 1] || el; // return el if undefined
    },
    // Returns the next navLink
    getNextLink: function (el) {
        var list = Array.prototype.slice.call(document.querySelectorAll('.js-navLink'));
        return list[this.getLinkIndex(el) + 1] || el; // return el if undefined
    },
    // Returns the parent navigation link
    getParent: function (el) {
        var node = el;
        while(node !== document.body){
            if(node.classList.contains('js-dropdownParent') || node.parentNode.classList.contains('js-mainNav')){
                break;
            }
            node = node.parentNode;
        }
        return this.getLink(node);
    },
    // Returns the direct sibling navigation link before the active one
    getPrevInLevel: function (el) {
        return this.getLink(el.parentNode.previousElementSibling);
    },
    // Returns the direct sibling navigation link after the active one
    getNextInLevel: function (el) {
        return this.getLink(el.parentNode.nextElementSibling);
    },
    /**
     * Gets the first navigation in the element
     * @param {Element} el
     * @returns {Element}
     */
    getLink: function (el) {
        return el ? el.querySelector('a.js-navLink') : null;
    },
};

/**
 * Sets the height of all the elements to be the same
 * @param elements
 */
function equalSize(elements)
{
    var maxHeight = 0,
        h;
    elements.css('height', '');
    elements.each(function() {
        h = $(this).height();
        if (h > maxHeight) {
            maxHeight = h;
        }
    });
    elements.height(maxHeight);
}


/**
 * Set up the notifications bar functionality
 */
function setupNotifications() {
    var id, parent;
    $('.js-notificationClose').on('click', function(e) {
        e.preventDefault();
        parent = $(this).parents('.js-notification:first');
        parent.hide();
        id = this.getAttribute('data-id');
        setCookie('notificationMsgHide', id, 10);
    });
}

/**
 * Set a cookie
 * @param {string} cname Cookie name
 * @param {string} cvalue Cookie value
 * @param {number} exdays Number of days to set cookie for
 */
function setCookie(cname, cvalue, exdays) {
    var d = new Date(),
        existing = getCookieValue(cname);
    if (existing.length > 0) {
        cvalue = existing + '-' + cvalue;
    }
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires + ';path=/';
}

/**
 * Get a cookie value
 * @param {string} cname Cookie name
 * @returns string
 */
function getCookieValue(cname) {
    var b = document.cookie.match('(^|;)\\s*' + cname + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
}


/**
 * Tests to see if the thing is a number
 *
 * @param {number} thing
 * @returns {boolean}
 */
function isNumber(thing) {
    return typeof thing === 'number';
};
