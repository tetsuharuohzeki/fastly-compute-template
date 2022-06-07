import * as assert from 'node:assert/strict';
import { parseArgs } from 'node:util';
import { expectNotUndefined } from 'option-t/esm/Undefinable/expect';
import { mapOrForUndefinable } from 'option-t/esm/Undefinable/mapOr';

function isTrue(value) {
    const ok = value === 'true';
    return ok;
}

export const RELEASE_CHANNEL = expectNotUndefined(process.env.RELEASE_CHANNEL, 'RELEASE_CHANNEL envvar must be set');

export const LAUNCH_INTEGRATION_TEST_FORMATION = mapOrForUndefinable(
    process.env.LAUNCH_INTEGRATION_TEST_FORMATION,
    false,
    isTrue
);

const CLI_FLAG_UPDATE_SNAPSHOTS = 'update-snapshots';

const CLI_OPTIONS = {
    [CLI_FLAG_UPDATE_SNAPSHOTS]: {
        type: 'boolean',
    },
};

class CliOptions {
    constructor(shouldUpdateSnapshots) {
        this.shouldUpdateSnapshots = shouldUpdateSnapshots;
        Object.freeze(this);
    }
}

export function assertIsCliOptions(value) {
    assert.ok(value instanceof CliOptions);
}

export function parseCliOptions() {
    const { values } = parseArgs({
        options: CLI_OPTIONS,
        strict: true,
    });

    const shouldUpdateSnapshots = !!values[CLI_FLAG_UPDATE_SNAPSHOTS];
    console.log('aaaa: ' + shouldUpdateSnapshots);

    const options = new CliOptions(shouldUpdateSnapshots);
    return options;
}
