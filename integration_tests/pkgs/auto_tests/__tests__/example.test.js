import {
    RELEASE_CHANNEL_IS_CANARY,
    RELEASE_CHANNEL_IS_PRODUCTION,
    ReleaseChannel,
} from '@c_at_e_integration_tests/config';
import test from 'ava';
import { fetch } from 'undici';

import { constructUrl } from './__helpers__/domain.js';

const PATH = '/?release_channel=true';

async function testFetchBody() {
    const url = constructUrl(PATH);
    const res = await fetch(url);
    const actual = await res.text();
    return actual;
}

test.runIf(RELEASE_CHANNEL_IS_CANARY)(`${ReleaseChannel.Channel.Production}:${PATH}`, async (t) => {
    const actual = await testFetchBody();
    t.is(actual, 'This is canary channel!');
});

test.runIf(RELEASE_CHANNEL_IS_PRODUCTION)(`${ReleaseChannel.Channel.Canary}:${PATH}`, async (t) => {
    const actual = await testFetchBody();
    t.is(actual, 'This is production channel!');
});
