/* ===========================================================================
    Cookie functionality
=========================================================================== */

/**
 * Get a cookie value
 *
 * @param {string} cname Cookie name
 * @returns {string}
 */
export const getCookieValue = (cname) => {
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
export const getCookie = (cname, cvalue, exdays) => {
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
 * Set a cookie
 *
 * @param {string} cname Cookie name
 * @param {string} cvalue Cookie value
 * @param {number} exdays Number of days to set cookie for
 */
export const setCookie = (cname, cvalue, exdays) => {
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
