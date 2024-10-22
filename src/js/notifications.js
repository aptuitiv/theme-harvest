/**
 * Get a cookie value
 *
 * @param {string} cname Cookie name
 * @returns {string}
 */
const getCookieValue = (cname) => {
    const b = document.cookie.match(`(^|;)\\s*${cname}\\s*=\\s*([^;]+)`);
    return b ? b.pop() : '';
};

/**
 * Set a cookie
 *
 * @param {string} cname Cookie name
 * @param {string} cvalue Cookie value
 * @param {number} exdays Number of days to set cookie for
 */
const setCookie = (cname, cvalue, exdays) => {
    const d = new Date();
    const existing = getCookieValue(cname);
    let cookievalue = cvalue;
    if (existing.length > 0) {
        cookievalue = `${existing}-${cvalue}`;
    }
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${cname}=${cookievalue}; ${expires};path=/`;
};

/**
 * Set up the notifications bar functionality
 */
// eslint-disable-next-line no-unused-vars
const setupNotifications = () => {
    const notification = document.querySelector('.js-notification');
    const close = document.querySelector('.js-notificationClose');
    if (close !== null) {
        close.addEventListener('click', () => {
            notification.classList.add('hidden');
            if (typeof notificationBarCookieExpirationDuration !== 'undefined') {
                // eslint-disable-next-line no-undef -- notificationBarCookieExpirationDuration is defined in the HTML
                setCookie(`notificationMsgHide${notification.dataset.id}`, 'hidden', notificationBarCookieExpirationDuration);
            } else {
                setCookie(`notificationMsgHide${notification.dataset.id}`, 'hidden', 10);
            }
        });
    }
};
