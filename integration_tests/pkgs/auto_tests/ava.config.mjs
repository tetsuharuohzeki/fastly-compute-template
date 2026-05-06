import * as assert from 'node:assert/strict';
import { ReleaseChannel } from '@c_at_e_integration_tests/config';

const TEST_TARGET_DIR_GLOB_PREFIX = `**/__tests__/**`;

/**
 * @param {string} str
 * @returns {`!${string}`}
 */
function ignore(str) {
    assert.ok(typeof str === 'string');
    return `!${str}`;
}

function buildTargetPathPatternList() {
    const files = [
        `${TEST_TARGET_DIR_GLOB_PREFIX}/*`,
        ignore(`${TEST_TARGET_DIR_GLOB_PREFIX}/__helpers__/**/*`),
        ignore(`${TEST_TARGET_DIR_GLOB_PREFIX}/__fixtures__/**/*`),
    ];

    ReleaseChannel.verifyReleaseChannelIsExpected();
    return files;
}

// https://github.com/avajs/ava/blob/main/docs/06-configuration.md
export default function resolveAvaConfig() {
    const files = buildTargetPathPatternList();
    console.log(`
============ Configurations for avajs ============
RELEASE_CHANNEL: ${ReleaseChannel.RELEASE_CHANNEL}

ava treats tests as these files:
${files.join('\n')}
================================================
    `);

    return {
        files,
    };
}
