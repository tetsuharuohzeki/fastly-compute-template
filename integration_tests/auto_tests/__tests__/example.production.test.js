import test from 'ava';
import { fetch } from 'undici';

import { constructUrl } from './__helpers__/domain.js';

const PATH = '/?release_channel=true';

test(PATH, async (t) => {
    const url = constructUrl(PATH);
    const res = await fetch(url);
    const actual = await res.text();
    t.is(actual, 'This is production channel!');
});
