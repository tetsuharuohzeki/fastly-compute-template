import * as assert from 'node:assert/strict';
import { isNotNull } from 'option-t/nullable';

/**
 *  @typedef    {import('option-t/Nullable').Nullable<T>}  Nullable
 *  @template   T
 */

let messagePrefix = '';

/** @type   {Nullable<boolean>} */
let isVerboseMode = null;

/**
 *  @param {string} prefix
 *  @param {boolean} isVerbose
 *  @returns    {void}
 */
export function setupLogger(prefix, isVerbose = false) {
    assert.ok(typeof prefix === 'string');
    assert.ok(typeof isVerbose === 'boolean');

    if (isNotNull(isVerboseMode)) {
        throw new Error('calling setupLogger is only allowed once per process');
    }

    messagePrefix = prefix + ':';
    isVerboseMode = isVerbose;
}

/**
 *  @param {unknown} message
 *  @returns    {void}
 */
export function debug(message) {
    if (isVerboseMode) {
        console.log(`${messagePrefix}DEBUG: ${message}`);
    }
}

/**
 *  @param {unknown} message
 *  @returns    {void}
 */
export function info(message) {
    console.log(`${messagePrefix}INFO: ${message}`);
}

/**
 *  @param {unknown} message
 *  @returns    {void}
 */
export function warn(message) {
    console.warn(`${messagePrefix}WARN: ${message}`);
}

/**
 *  @param {unknown} message
 *  @returns    {void}
 */
export function error(message) {
    console.error(`${messagePrefix}ERROR: ${message}`);
}
