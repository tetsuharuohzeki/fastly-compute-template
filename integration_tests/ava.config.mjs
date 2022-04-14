import { unwrapOrFromUndefinable } from 'option-t/esm/Undefinable/unwrapOr';

const RELEASE_CHANNEL = unwrapOrFromUndefinable(process.env.RELEASE_CHANNEL, null);

const ReleaseChannel = Object.freeze({
    Production: 'production',
    Canary: 'canary',
});

const PRODUCTION_ONLY_TEST_PATTERN = `**/__tests__/**/*.production.js`;
const CANARY_ONLY_TEST_PATTERN = `**/__tests__/**/*.canary.js`;

function buildTargetPathPatternList() {
    function ignore(str) {
        return `!${str}`;
    }

    const files = [
        '**/__tests__/**/*',
        ignore('**/__tests__/**/__helpers__/**/*'),
        ignore('**/__tests__/**/__fixtures__/**/*'),
    ];
    switch (RELEASE_CHANNEL) {
        case ReleaseChannel.Production:
            files.push(PRODUCTION_ONLY_TEST_PATTERN, ignore(CANARY_ONLY_TEST_PATTERN));
            break;
        case ReleaseChannel.Canary:
            files.push(ignore(PRODUCTION_ONLY_TEST_PATTERN), CANARY_ONLY_TEST_PATTERN);
            break;
        case null:
            // ignore all specific release channel tests.
            files.push(ignore(PRODUCTION_ONLY_TEST_PATTERN), ignore(CANARY_ONLY_TEST_PATTERN));
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
