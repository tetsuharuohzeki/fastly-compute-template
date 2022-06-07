import * as assert from 'node:assert/strict';
import { parseArgs } from 'node:util';
import { expectNotUndefined } from 'option-t/esm/Undefinable/expect';

export const RELEASE_CHANNEL = expectNotUndefined(process.env.RELEASE_CHANNEL, 'RELEASE_CHANNEL envvar must be set');

const CLI_FLAG_UPDATE_SNAPSHOTS = 'update-snapshots';
const CLI_FLAG_IS_ONLY_FORMATION = 'is-only-formation';

const CLI_OPTIONS = {
    [CLI_FLAG_UPDATE_SNAPSHOTS]: {
        type: 'boolean',
    },
    [CLI_FLAG_IS_ONLY_FORMATION]: {
        type: 'boolean',
    },
};

class CliOptions {
    constructor(shouldUpdateSnapshots, isOnlyFormation) {
        this.shouldUpdateSnapshots = shouldUpdateSnapshots;
        this.isOnlyFormation = isOnlyFormation;
        Object.freeze(this);
    }
}

/**
 * @param {unknown} value
 * @returns {asserts value is CliOptions}
 */
export function assertIsCliOptions(value) {
    assert.ok(value instanceof CliOptions, 'value must be CliOptions');
}

export function parseCliOptions() {
    const { values } = parseArgs({
        options: CLI_OPTIONS,
        strict: true,
    });

    const shouldUpdateSnapshots = !!values[CLI_FLAG_UPDATE_SNAPSHOTS];
    const isOnlyFormation = !!values[CLI_FLAG_IS_ONLY_FORMATION];

    const options = new CliOptions(shouldUpdateSnapshots, isOnlyFormation);
    return options;
}
