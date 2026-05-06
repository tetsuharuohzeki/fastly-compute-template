import { RELEASE_CHANNEL_IS_CANARY } from '@c_at_e_integration_tests/config';
import test from 'ava';
import { fetch } from 'undici';

import { constructUrl } from './__helpers__/domain.js';

const PATH = '/?release_channel=true';

test.runIf(RELEASE_CHANNEL_IS_CANARY)(PATH, async (t) => {
    const url = constructUrl(PATH);
    const res = await fetch(url);
    const actual = await res.text();
    t.is(actual, 'This is canary channel!');
});
