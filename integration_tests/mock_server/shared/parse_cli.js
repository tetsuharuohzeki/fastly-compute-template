import * as assert from 'node:assert/strict';
import { parseArgs } from 'node:util';

export function parseCliOptions() {
    const { values } = parseArgs({
        options: {
            port: {
                type: 'string',
                default: '',
            },
        },
        strict: true,
    });

    const portString = values.port;
    assert.notStrictEqual(portString, '', `must specify --port cli flag`);

    const port = +portString;
    assert.ok(Number.isInteger(port), 'the port must be integer');

    return {
        port,
    };
}
