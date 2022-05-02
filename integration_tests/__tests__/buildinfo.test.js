import test from 'ava';
import { fetch } from 'undici';

import { constructUrl } from './__helpers__/domain.js';
import { CONTENT_TYPE_HEADER, MIME_TEXT_PLAIN_UTF_8 } from './__helpers__/http_header.js';

const PATH = '/buildinfo';
const URL = constructUrl(PATH);

test(PATH, async (t) => {
    const res = await fetch(URL);
    const headers = res.headers;
    t.is(headers.get(CONTENT_TYPE_HEADER), MIME_TEXT_PLAIN_UTF_8, `${CONTENT_TYPE_HEADER} header value`);

    const body = await res.text();
    t.true(body.includes("git revision:"), 'contains git revision info');
    t.true(body.includes("build date:"), 'contains build date info');
});
