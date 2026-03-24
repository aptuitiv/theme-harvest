/* ===========================================================================
    Utility functions for determining a variable's type and if it can be used

    In this file, type guarding is extemely helpful to let Typescript know
    of the runtime restrictions that the JS logically places, if
    Typescript isn't automatically able to detect it.

    For instance, by returning the type `thing is object` from a function,
    Typescript will be aware the result can and should be treated as an
    object

    e.g.

    type someType = { someProperty } | string;

    if (isObject(someType)) { // Type guarding, ensuring type is an object
        doSomething(someType.someProperty); // No TS error, as must be object
    } else {
        someType.slice(); // No TS error, as must be string
    }

    For more info:
    https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates

=========================================================================== */

/* eslint-disable jsdoc/reject-any-type -- We need to support "any" type because any value type could be passed */

import { isEmpty } from 'lodash';

/**
 * Returns if the value is boolean
 *
 * @param {any} thing The value to test
 * @returns {boolean}
 */
export const isBoolean = (thing) => typeof thing === 'boolean';

/**
 * Returns if the value is defined
 *
 * Template trick from: https://stackoverflow.com/a/62753258
 *
 * @param {any} thing The value to test
 * @returns {boolean}
 */
export const isDefined = (thing) => typeof thing !== 'undefined';

/**
 * Returns if the value is a DOM Element
 *
 * @param {any} thing The thing to test
 * @returns {boolean}
 */
export const isElement = (thing) =>
    typeof thing === 'object' &&
    typeof thing.nodeType !== 'undefined' &&
    thing.nodeType === 1;

/**
 * Returns if the thing is a function
 *
 * @param {any} thing The thing to test
 * @returns {boolean}
 */
export const isFunction = (thing) => typeof thing === 'function';

/**
 * Returns if the value is null.
 *
 * @param {any} thing The thing to test
 * @returns {boolean}
 */
export const isNull = (thing) => thing === null;

/**
 * Returns if the value is a valid number
 *
 * @param {any} thing The value to test
 * @returns {boolean}
 */
export const isNumber = (thing) =>
    !Number.isNaN(thing) && typeof thing === 'number' && thing !== Infinity;

/**
 * Returns if the given value is a string that represents a numerical value
 *   e.g. returns true for `"34"` and false for `"text34"` and `34`
 *
 * @param {any} thing The value to test
 * @returns {boolean}
 */
export const isNumberString = (thing) =>
    typeof thing === 'string' &&
    !Number.isNaN(Number(thing)) &&
    thing !== 'Infinity';

/**
 * Returns if the given value is a number or string that represents a numerical value
 *   e.g. returns true for 34 or "34" and false for "text34" and "text"
 *
 * @param {any} thing The value to test
 * @returns {boolean}
 */
export const isNumberOrNumberString = (thing) =>
    isNumber(thing) || isNumberString(thing);

/**
 * Returns if the value is an object
 *
 * https://attacomsian.com/blog/javascript-check-variable-is-object
 *
 * @param {any} thing The value to test
 * @returns {boolean}
 */
export const isObject = (thing) =>
    Object.prototype.toString.call(thing) === '[object Object]';

/**
 * Returns if the value is an object
 *
 * https://attacomsian.com/blog/javascript-check-variable-is-object
 *
 * @param {any} thing The value to test
 * @returns {boolean}
 */
export const isObjectWithValues = (thing) =>
    Object.prototype.toString.call(thing) === '[object Object]' &&
    Object.keys(thing).length > 0;

/**
 * Returns if object is empty
 *
 * @param {any} object The value to test
 * @returns {boolean}
 */
export const isObjectEmpty = (object) =>
    isObject(object) && Object.keys(object).length === 0;

/**
 * Returns if the thing is a Promise function
 *
 * It's assumed to be a promise if the thing exists and "thing.then" is a function
 *
 * @param {any} thing The value to test
 * @returns {boolean}
 */
export const isPromise = (thing) => !!thing && isFunction(thing.then);

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
 * The server may have set a value to a "null" string. Return false
 * if the value is a string but it also equals "null".
 *
 * @param {any} thing The value to test
 * @returns {boolean}
 */
export const isStringWithValue = (thing) =>
    isString(thing) && thing.trim().length > 0 && thing !== 'null';

/**
 * Returns if the value is a valid string or number
 *
 * @param {unknown} thing The value to test against
 * @returns {boolean}
 */
export const isStringOrNumber = (thing) =>
    isStringWithValue(thing) || isNumber(thing);

/**
 * Returns if the value is undefined
 *
 * @param {any} thing The value to test
 * @returns {boolean}
 */
export const isUndefined = (thing) =>
    thing === undefined || typeof thing === 'undefined';

/**
 * Returns if the value is null or undefined
 *
 * @param {any} thing The thing to test
 * @returns {boolean}
 */
export const isNullOrUndefined = (thing) => isNull(thing) || isUndefined(thing);

/**
 * Checks to see if the thing has a value.
 *
 * The lodash isEmpty() method only  checks objects and arrays so it's not a valid test for
 * strings, numbers, or boolean values.
 *
 * This returns true if the thing has a value. Otherwise returns false.
 *
 * @param {any} thing The value to test
 * @returns {boolean}
 */
export const hasValue = (thing) => {
    if (thing === undefined || thing === null) {
        return false;
    }
    if (
        (typeof thing === 'string' && thing.trim().length > 0) ||
        isNumber(thing) ||
        typeof thing === 'boolean'
    ) {
        return true;
    }
    return !isEmpty(thing);
};

/**
 * Returns if the thing has an empty value
 *
 * This returns true if the thing is empty. Otherwise returns false if the thing has a value.
 *
 * This is the inverse of hasValue()
 *
 * @param {any} thing The value to test
 * @returns {boolean}
 */
export const isEmptyValue = (thing) => !hasValue(thing);

/**
 * Tests to see if the object is a valid object and if the key is a valid key
 *
 * @param {any} obj The object to test
 * @param {string} key The object key to test
 * @returns {boolean}
 */
export const objectHasValue = (obj, key) => isObject(obj) && key in obj;

/**
 * Tests to see if the object is a valid object and if the key is a valid key and if the key value is a string
 *
 * @param {any} obj The object to test
 * @param {string} key The object key to test
 * @returns {boolean}
 */
export const objectValueIsString = (obj, key) =>
    objectHasValue(obj, key) && typeof obj[key] === 'string';

/**
 * Tests to see if the object is a valid object and if the key is a valid key and if the key value is a string with a value
 *
 * @param {any} obj The object to test
 * @param {string} key The object key to test
 * @returns {boolean}
 */
export const objectValueIsStringWithValue = (obj, key) =>
    objectHasValue(obj, key) && isStringWithValue(obj[key]);
