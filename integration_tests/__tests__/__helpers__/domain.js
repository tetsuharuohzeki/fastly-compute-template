import * as assert from 'node:assert/strict';

import { APP_LOCAL_ORIGIN } from '../../url_origin.js';

export const ORIGIN = APP_LOCAL_ORIGIN;

/**
 * @param {string} path
 * @returns {string}
 */
export function constructUrl(path) {
    assert.strictEqual(typeof path, 'string');

    const url = `${ORIGIN}${path}`;
    return url;
}
