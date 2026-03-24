/* ===========================================================================
    Functions and objects for working with URL history
=========================================================================== */

import { isStringWithValue, isFunction, isNumberOrNumberString } from './type';

/**
 * Gets whether or not the browser supports the history API
 *
 * @returns {boolean}
 */
export const supportsHistoryApi = () => !!(window.history && history.pushState); // eslint-disable-line no-restricted-globals

/**
 * Provides methods for working with URL query parameters
 */

export const urlQueryValues = {
    /**
     * The URL query parameter values
     *
     * @member {object|URLSearchParams}
     * @private
     */
    values: null,

    /**
     * Gets the query parameter values if they don't already exist
     *
     * @private
     */
    init() {
        if (this.values === null) {
            // This is the first time. Get the URL parameters if they exist.
            this.values = this.getAllUrlParams();
        }
    },

    /**
     * Gets the value from the URL query parameters if it exists
     *
     * @param {string} key The name of the parameter to get
     * @returns {string}
     */
    get(key) {
        this.init();
        let returnValue = null;
        if (typeof this.values[key] !== 'undefined') {
            returnValue = this.values[key];
            // If return value is an array with only one value, return just the one value
            if (returnValue.length === 1) {
                [returnValue] = returnValue;
            }
        }

        return returnValue;
    },

    /**
     * Gets the value from the URL query parameters if it exists and is an integer >= 0
     *
     * @param {string} key The name of the parameter to get
     * @returns {string}
     */
    getInt(key) {
        let returnValue = this.get(key);
        if (isNumberOrNumberString(returnValue)) {
            returnValue = parseInt(returnValue, 10);
            if (returnValue < 0) {
                returnValue = null;
            }
        } else {
            returnValue = null;
        }
        return returnValue;
    },

    /**
     * Gets the value from the URL query parameters if it exists, is a string with a value
     *
     * @param {string} key The name of the parameter to get
     * @returns {string}
     */
    getString(key) {
        let returnValue = this.get(key);
        if (!isStringWithValue(returnValue)) {
            returnValue = null;
        }
        return returnValue;
    },

    /**
     * Checks to see if the string value exists in the URL query parameters and calls the callback if it does
     *
     * @param {string} key The name of the parameter to check
     * @param {(value: string) => void} callback A function to call if the value exists
     * @returns {boolean} True if the value exists and the callback was called, false otherwise
     */
    hasStringValue(key, callback) {
        const value = this.getString(key);
        if (value !== null) {
            if (isFunction(callback)) {
                callback(value);
            }
            return true;
        }
        return false;
    },

    /**
     * Checks to see if the integer value exists in the URL query parameters and calls the callback if it does
     *
     * @param {string} key The name of the parameter to check
     * @param {(value: number) => void} callback A function to call if the value exists
     * @returns {boolean} True if the value exists and the callback was called, false otherwise
     */
    hasIntValue(key, callback) {
        const value = this.getInt(key);
        if (value !== null) {
            if (isFunction(callback)) {
                callback(value);
            }
            return true;
        }
        return false;
    },

    /**
     * Checks to see if the integer value exists in the URL query parameters and calls the callback if it does.
     *
     * The value can be a single integer or a comma -separated list of integers (e.g. "1,2,3").
     *
     * @param {string} key The name of the parameter to check
     * @param {(value: number[]) => void} callback A function to call if the value exists
     * @returns {boolean} True if the value exists and the callback was called, false otherwise
     */
    hasMultiIntValue(key, callback) {
        const value = this.getString(key);
        if (value !== null) {
            // Split the value by commas and convert to integers
            const intValues = value
                .split(',')
                .map((val) => parseInt(val.trim(), 10))
                .filter((val) => !Number.isNaN(val) && val >= 0);
            // If the resulting array is empty, return false
            if (intValues.length === 0) {
                return false;
            }
            if (isFunction(callback)) {
                callback(intValues);
            }
            return true;
        }
        return false;
    },

    /**
     * Gets whether or not there are any query parameters
     *
     * @returns {boolean}
     */
    hasValues() {
        this.init();
        return Object.keys(this.values).length > 0;
    },

    /**
     * Resets the parameters to match what's in the URL now
     */
    reset() {
        this.values = this.getAllUrlParams();
    },

    /**
     * Replaces (or sets) a query value
     *
     * @param {string} key The value key
     * @param {string|string[]} value The value(s) to set
     */
    set(key, value) {
        this.reset();
        this.values[key] = value;
    },

    /**
     * Returns the query parameters as a string
     *
     * @param {string=} skip The parameter key to skip
     * @returns {string}
     */
    toString(skip) {
        let returnValue = '';
        let values;
        let key;
        let val;
        if (this.hasValues()) {
            returnValue = '?';
            values = Object.entries(this.values);
            for (let i = 0, l = values.length; i < l; i += 1) {
                // eslint-disable-next-line prefer-destructuring
                key = values[i][0];
                if (typeof skip === 'undefined' || key !== skip) {
                    // eslint-disable-next-line prefer-destructuring
                    val = values[i][1];
                    if (i > 0) {
                        returnValue += '&';
                    }
                    if (typeof val === 'string') {
                        returnValue += `${key}=${val}`;
                    } else if (Array.isArray(val)) {
                        // eslint-disable-next-line no-loop-func
                        val.forEach((thisVal, index) => {
                            if (index > 0) {
                                returnValue += '&';
                            }
                            returnValue += `${key}[]${thisVal}`;
                        });
                    }
                }
            }
        }
        if (returnValue === '?') {
            returnValue = '';
        }
        return returnValue;
    },

    /**
     * Get all the URL params
     *
     * https://www.sitepoint.com/get-url-parameters-with-javascript/
     *
     * @param {string=} url The URL to get the parameters from
     * @returns {object}
     * @private
     */
    getAllUrlParams(url) {
        // get query string from url (optional) or window
        let queryString = url
            ? url.split('?')[1]
            : window.location.search.slice(1);

        // we'll store the parameters here
        const obj = {};

        // if query string exists
        if (queryString) {
            // stuff after # is not part of query string, so get rid of it
            // eslint-disable-next-line prefer-destructuring
            queryString = queryString.split('#')[0];

            // split our query string into its component parts
            const arr = queryString.split('&');

            for (let i = 0; i < arr.length; i += 1) {
                // separate the keys and the values
                const a = arr[i].split('=');

                // set parameter name and value (use 'true' if empty)
                const paramName = a[0];
                let paramValue = typeof a[1] === 'undefined' ? true : a[1];

                // (optional) keep case consistent
                // paramName = paramName.toLowerCase();
                // if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();
                if (typeof paramValue === 'string') {
                    paramValue = decodeURIComponent(paramValue);
                }

                // if the paramName ends with square brackets, e.g. colors[] or colors[2]
                if (paramName.match(/\[(\d+)?\]$/)) {
                    // create key if it doesn't exist
                    const key = paramName.replace(/\[(\d+)?\]/, '');
                    if (!obj[key]) obj[key] = [];

                    // if it's an indexed array e.g. colors[2]
                    if (paramName.match(/\[\d+\]$/)) {
                        // get the index value and add the entry at the appropriate position
                        const index = /\[(\d+)\]/.exec(paramName)[1];
                        obj[key][index] = paramValue;
                    } else {
                        // otherwise add the value to the end of the array
                        obj[key].push(paramValue);
                    }
                } else if (!obj[paramName]) {
                    // we're dealing with a string
                    // if it doesn't exist, create property
                    obj[paramName] = paramValue;
                } else if (
                    obj[paramName] &&
                    typeof obj[paramName] === 'string'
                ) {
                    // if property does exist and it's a string, convert it to an array
                    obj[paramName] = [obj[paramName]];
                    obj[paramName].push(paramValue);
                } else {
                    // otherwise add the property
                    obj[paramName].push(paramValue);
                }
            }
        }
        return obj;
    },
};
