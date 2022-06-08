import * as assert from 'node:assert/strict';
import { assertIsCliOptions } from './cli_flags.js';

export class SuperVisorContext {
    #aborter;

    constructor(cliOptions) {
        assertIsCliOptions(cliOptions);

        this.#aborter = new AbortController();
        this.cliOptions = cliOptions;

        Object.freeze(this);
    }

    get aborter() {
        return this.#aborter;
    }

    get signal() {
        return this.#aborter.signal;
    }

    get releaseChannel() {
        return this.cliOptions.releaseChannel;
    }
}

/**
 * @param {unknown} value
 * @returns {asserts value is SuperVisorContext}
 */
export function assertIsSuperVisorContext(value) {
    assert.ok(value instanceof SuperVisorContext, 'value must be SuperVisorContext');
}
