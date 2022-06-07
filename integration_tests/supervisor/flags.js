import * as assert from 'node:assert/strict';
import { parseArgs } from 'node:util';
import { expectNotUndefined } from 'option-t/esm/Undefinable/expect';

const CLI_FLAG_RELEASE_CHANNEL = 'release-channel';
const CLI_FLAG_UPDATE_SNAPSHOTS = 'update-snapshots';
const CLI_FLAG_IS_ONLY_FORMATION = 'is-only-formation';

const CLI_OPTIONS = {
    [CLI_FLAG_RELEASE_CHANNEL]: {
        type: 'string',
    },
    [CLI_FLAG_UPDATE_SNAPSHOTS]: {
        type: 'boolean',
    },
    [CLI_FLAG_IS_ONLY_FORMATION]: {
        type: 'boolean',
    },
};

class CliOptions {
    constructor({ shouldUpdateSnapshots, isOnlyFormation, releaseChannel }) {
        this.shouldUpdateSnapshots = shouldUpdateSnapshots;
        this.isOnlyFormation = isOnlyFormation;
        this.releaseChannel = releaseChannel;
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

    const releaseChannel = expectNotUndefined(
        values[CLI_FLAG_RELEASE_CHANNEL],
        `--${CLI_FLAG_RELEASE_CHANNEL} must be set`
    );
    if (releaseChannel === '') {
        throw new RangeError(`--${CLI_FLAG_RELEASE_CHANNEL} must not be empty`);
    }

    const shouldUpdateSnapshots = !!values[CLI_FLAG_UPDATE_SNAPSHOTS];
    const isOnlyFormation = !!values[CLI_FLAG_IS_ONLY_FORMATION];

    const options = new CliOptions({
        shouldUpdateSnapshots,
        isOnlyFormation,
        releaseChannel,
    });
    return options;
}
