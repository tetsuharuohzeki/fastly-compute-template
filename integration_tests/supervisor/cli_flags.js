import * as assert from 'node:assert/strict';
import { parseArgs } from 'node:util';
import { expectNotUndefined } from 'option-t/Undefinable';

const CLI_FLAG_RELEASE_CHANNEL = 'release-channel';
const CLI_FLAG_UPDATE_SNAPSHOTS = 'update-snapshots';
const CLI_FLAG_IS_ONLY_FORMATION = 'is-only-formation';
const CLI_FLAG_IS_VERBOSE = 'verbose';

/**
 * @typedef {import('node:util').ParseArgsConfig} ParseArgsConfig
 */

/** @satisfies  {ParseArgsConfig['options']} */
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
    [CLI_FLAG_IS_VERBOSE]: {
        type: 'boolean',
    },
};

/**
 *  @typedef    {object}    CliOptionsArgs
 *  @property   {boolean}   shouldUpdateSnapshots
 *  @property   {boolean}   isOnlyFormation
 *  @property   {string}    releaseChannel
 *  @property   {boolean}   isVerbose
 */

class CliOptions {
    /** @type {boolean} */
    shouldUpdateSnapshots;
    /** @type {boolean} */
    isOnlyFormation;
    /** @type {string} */
    releaseChannel;
    /** @type {boolean} */
    isVerbose;

    /**
     * @param {CliOptionsArgs} param0
     */
    constructor({ shouldUpdateSnapshots, isOnlyFormation, releaseChannel, isVerbose }) {
        this.shouldUpdateSnapshots = shouldUpdateSnapshots;
        this.isOnlyFormation = isOnlyFormation;
        this.releaseChannel = releaseChannel;
        this.isVerbose = isVerbose;
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
    /** @satisfies  {ParseArgsConfig['options']} */
    const options = CLI_OPTIONS;
    const { values } = parseArgs({
        options,
        strict: true,
    });

    /** @type   {string} */
    const releaseChannel = expectNotUndefined(
        values[CLI_FLAG_RELEASE_CHANNEL],
        `--${CLI_FLAG_RELEASE_CHANNEL} must be set`
    );
    if (typeof releaseChannel !== 'string') {
        throw new TypeError(`--${CLI_FLAG_RELEASE_CHANNEL} must be string value`);
    }
    if (releaseChannel === '') {
        throw new RangeError(`--${CLI_FLAG_RELEASE_CHANNEL} must not be empty`);
    }

    const shouldUpdateSnapshots = !!values[CLI_FLAG_UPDATE_SNAPSHOTS];
    const isOnlyFormation = !!values[CLI_FLAG_IS_ONLY_FORMATION];
    const isVerbose = !!values[CLI_FLAG_IS_VERBOSE];

    const o = new CliOptions({
        shouldUpdateSnapshots,
        isOnlyFormation,
        releaseChannel,
        isVerbose,
    });
    return o;
}
