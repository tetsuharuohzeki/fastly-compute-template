import { ReleaseChannel } from '@c_at_e_integration_tests/config';

const TEST_TARGET_DIR_GLOB_PREFIX = `**/__tests__/**`;

// https://github.com/avajs/ava/blob/main/docs/06-configuration.md
export default function resolveAvaConfig() {
    ReleaseChannel.verifyReleaseChannelIsExpected();

    const files = [`${TEST_TARGET_DIR_GLOB_PREFIX}/*.test.*`];

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
