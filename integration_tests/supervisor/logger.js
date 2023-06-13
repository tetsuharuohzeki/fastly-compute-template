import * as assert from 'node:assert/strict';

const LOG_PREFIX = 'supervisor:';

let isVerboseMode = false;

export function setupLogger(isVerbose) {
    assert.ok(typeof isVerbose === 'boolean');
    isVerboseMode = isVerbose;
}

export function debug(message) {
    if (isVerboseMode) {
        console.log(`${LOG_PREFIX}DEBUG: ${message}`);
    }
}

export function info(message) {
    console.log(`${LOG_PREFIX}INFO: ${message}`);
}

export function warn(message) {
    console.warn(`${LOG_PREFIX}WARN: ${message}`);
}

export function error(message) {
    console.error(`${LOG_PREFIX}ERROR: ${message}`);
}
