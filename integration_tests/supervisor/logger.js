import * as assert from 'node:assert/strict';

import { expectNotNull } from 'option-t/esm/Nullable';

const LOG_PREFIX = 'supervisor:';

class NormalLogger {
    debug(message) {}
    log(message) {
        console.log(`${LOG_PREFIX}INFO: ${message}`);
    }
    warn(message) {
        console.warn(`${LOG_PREFIX}WARN: ${message}`);
    }
    error(message) {
        console.error(`${LOG_PREFIX}ERROR: ${message}`);
    }
}

class VerboseLogger extends NormalLogger {
    debug(message) {
        console.log(`${LOG_PREFIX}DEBUG: ${message}`);
    }
}

let loggerInstance = null;

function getLogger() {
    const logger = expectNotNull(loggerInstance, 'the logger has not been init');
    assert.ok(logger instanceof NormalLogger);
    return logger;
}

export function setupLogger(isVerbose) {
    assert.ok(typeof isVerbose === 'boolean');
    if (isVerbose) {
        loggerInstance = new VerboseLogger();
    } else {
        loggerInstance = new NormalLogger();
    }
}

export function debug(message) {
    getLogger().debug(message);
}

export function info(message) {
    getLogger().log(message);
}

export function warn(message) {
    getLogger().warn(message);
}

export function error(message) {
    getLogger().error(message);
}
