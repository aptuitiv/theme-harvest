/* ===========================================================================
    Main javascript for the site
=========================================================================== */

import accordion from './accordion';
import { setCookie } from './lib/cookie';
import smallScreenNav from './navigation/small-screen';
import navAccessibility from './navigation/accessibility';

/* global MicroModal:readonly notificationBarCookieExpirationDuration */

/**
 * Main javascript for the site
 */
const main = {
    /**
     * Initialize the main javascript
     */
    init() {
        this.setupNotifications();
        accordion.init();
        smallScreenNav.init();
        navAccessibility.init();
        MicroModal.init({
            disableFocus: true,
        });
    },

    /**
     * Set up the notifications bar functionality
     */
    setupNotifications() {
        const notification = document.querySelector('.js-notification');
        const close = document.querySelector('.js-notificationClose');
        if (close !== null && notification !== null) {
            close.addEventListener('click', () => {
                notification.classList.add('hidden');
                if (
                    typeof notificationBarCookieExpirationDuration !==
                    'undefined'
                ) {
                    setCookie(
                        `notificationMsgHide${notification.dataset.id}`,
                        'hidden',
                        notificationBarCookieExpirationDuration,
                    );
                } else {
                    setCookie(
                        `notificationMsgHide${notification.dataset.id}`,
                        'hidden',
                        10,
                    );
                }
            });
        }
    },
};

// Wait until page is ready before running any scripts
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main.init);
} else {
    main.init();
}

// eslint-disable-next-line import-x/prefer-default-export -- See https://aptuitiv.github.io/website-build-tools/configuration/javascript#es-modules-build-method for exporting recommendations.
export { main as helper };
