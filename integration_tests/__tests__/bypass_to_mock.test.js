import test from 'ava';
import { fetch } from 'undici';

import { constructUrl } from './__helpers__/domain.js';
import { CONTENT_TYPE_HEADER, MIME_TEXT_PLAIN_UTF_8 } from './__helpers__/http_header.js';

const PATH = '/hello_this_is_mock';
const URL = constructUrl(PATH);

test(PATH, async (t) => {
    const res = await fetch(URL);
    const headers = res.headers;
    t.is(headers.get(CONTENT_TYPE_HEADER), MIME_TEXT_PLAIN_UTF_8, `${CONTENT_TYPE_HEADER} header value`);

    const body = await res.text();
    t.is(body, 'this is mock server listening on 8030', 'response body');
});
