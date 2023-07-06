import * as assert from 'node:assert/strict';

let messagePrefix = '';
let isVerboseMode = false;

/**
 *  @param {string} prefix
 *  @param {boolean} isVerbose
 *  @returns    {void}
 */
export function setupLogger(prefix, isVerbose = false) {
    assert.ok(typeof prefix === 'string');
    assert.ok(typeof isVerbose === 'boolean');

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
