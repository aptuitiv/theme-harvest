/* ===========================================================================
    String helper functions
=========================================================================== */

/* eslint-disable jsdoc/reject-any-type -- We need to support "any" type because any value type could be passed */

/**
 * Returns if the value is a string
 *
 * @param {any} thing The value to test
 * @returns {boolean}
 */
export const isString = (thing) => typeof thing === 'string';

/**
 * Returns if the value is string and has a length greater than 0
 *
 * @param {any} thing The value to test
 * @returns {boolean}
 */
export const isStringWithValue = (thing) =>
    isString(thing) && thing.trim().length > 0;

/**
 * Generates a random string that can be used as an identifier
 *
 * Typical length will be about 8 characters of letters and numbers
 *
 * @returns {string}
 */
export const randomString = () => {
    const value = crypto.getRandomValues(new Uint32Array(10))[0].toString(32);
    // Since this could be used as a DOM element ID, make sure it starts with a
    // letter. https://stackoverflow.com/a/79022
    return `x${value}`;
};

/**
 * Truncate a string to the specified length
 *
 * @param {string} str The string to truncate
 * @param {number} length The length to truncate the string to
 * @param {string} ending The string to append to the end of the truncated string
 * @returns {string}
 */
export const truncateString = (str, length, ending = '...') => {
    if (str.length > length) {
        return str.slice(0, length - ending.length) + ending;
    }
    return str;
};
