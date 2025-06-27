import * as assert from 'node:assert/strict';
import { assertIsCliOptions } from './cli_flags.js';

export class SuperVisorContext {
    #aborter;

    /**
     *  @param {import('./cli_flags.js').CliOptionsArgs} cliOptions
     */
    constructor(cliOptions) {
        assertIsCliOptions(cliOptions);

        this.#aborter = new AbortController();
        this.cliOptions = cliOptions;

        Object.freeze(this);
    }

    /** @type   {AbortController} */
    get aborter() {
        return this.#aborter;
    }

    /** @type   {AbortSignal} */
    get signal() {
        return this.#aborter.signal;
    }

    /** @type   {string} */
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
