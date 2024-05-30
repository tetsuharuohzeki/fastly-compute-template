import * as assert from 'node:assert/strict';
import { toNullableFromUndefinable } from 'option-t/undefinable/to_nullable';

const RELEASE_CHANNEL = toNullableFromUndefinable(process.env['RELEASE_CHANNEL']);

const ReleaseChannel = Object.freeze({
    Production: 'production',
    Canary: 'canary',
});

const TEST_TARGET_DIR_GLOB_PREFIX = `**/__tests__/**`;

const PRODUCTION_ONLY_TEST_PATTERN = [
    `${TEST_TARGET_DIR_GLOB_PREFIX}/*.production.js`,
    `${TEST_TARGET_DIR_GLOB_PREFIX}/*.production.test.js`,
];
const CANARY_ONLY_TEST_PATTERN = [
    `${TEST_TARGET_DIR_GLOB_PREFIX}/*.canary.js`,
    `${TEST_TARGET_DIR_GLOB_PREFIX}/*.canary.test.js`,
];

function buildTargetPathPatternList() {
    /**
     * @param {Array<string>} list
     * @returns {Array<string>}
     */
    function ignorePatterns(list) {
        assert.ok(Array.isArray(list));
        return list.map(ignore);
    }

    /**
     * @param {string} str
     * @returns {`!${string}`}
     */
    function ignore(str) {
        assert.ok(typeof str === 'string');
        return `!${str}`;
    }

    const files = [
        `${TEST_TARGET_DIR_GLOB_PREFIX}/*`,
        ignore(`${TEST_TARGET_DIR_GLOB_PREFIX}/__helpers__/**/*`),
        ignore(`${TEST_TARGET_DIR_GLOB_PREFIX}/__fixtures__/**/*`),
    ];
    switch (RELEASE_CHANNEL) {
        case ReleaseChannel.Production:
            files.push(...PRODUCTION_ONLY_TEST_PATTERN, ...ignorePatterns(CANARY_ONLY_TEST_PATTERN));
            break;
        case ReleaseChannel.Canary:
            files.push(...ignorePatterns(PRODUCTION_ONLY_TEST_PATTERN), ...CANARY_ONLY_TEST_PATTERN);
            break;
        case null:
            // ignore all specific release channel tests.
            files.push(...ignorePatterns(PRODUCTION_ONLY_TEST_PATTERN), ...ignorePatterns(CANARY_ONLY_TEST_PATTERN));
            break;
        default:
            throw new RangeError(`RELEASE_CHANNEL is unknown '${RELEASE_CHANNEL}'`);
    }
    return files;
}

// https://github.com/avajs/ava/blob/main/docs/06-configuration.md
export default function resolveAvaConfig() {
    const files = buildTargetPathPatternList();
    console.log(`
============ Configurations for Ava ============
ava treats tests as these files:
${files.join('\n')}
================================================
    `);

    return {
        files,
    };
}
