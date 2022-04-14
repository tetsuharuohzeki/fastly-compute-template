import * as assert from 'node:assert/strict';

const ORIGIN = 'http://127.0.0.1:7676';

export function constructUrl(path) {
    assert.strictEqual(typeof path, 'string');

    const url = `${ORIGIN}${path}`;
    return url;
}
