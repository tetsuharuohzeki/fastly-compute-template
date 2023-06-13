import * as assert from 'node:assert/strict';

let messagePrefix = '';
let isVerboseMode = false;

export function setupLogger(prefix, isVerbose) {
    assert.ok(typeof prefix === 'string');
    assert.ok(typeof isVerbose === 'boolean');

    messagePrefix = prefix + ':';
    isVerboseMode = isVerbose;
}

export function debug(message) {
    if (isVerboseMode) {
        console.log(`${messagePrefix}DEBUG: ${message}`);
    }
}

export function info(message) {
    console.log(`${messagePrefix}INFO: ${message}`);
}

export function warn(message) {
    console.warn(`${messagePrefix}WARN: ${message}`);
}

export function error(message) {
    console.error(`${messagePrefix}ERROR: ${message}`);
}
