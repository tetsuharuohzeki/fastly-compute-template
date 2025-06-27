import test from 'ava';
import { fetch } from 'undici';

import { HttpHeader, Mime } from '@c_at_e_integration_tests/http_helpers';

import { constructUrl } from './__helpers__/domain.js';

const CONTENT_TYPE_HEADER = HttpHeader.CONTENT_TYPE;
const MIME_TEXT_PLAIN_UTF_8 = Mime.TEXT_PLAIN_UTF_8;

const PATH = '/';
const URL = constructUrl(PATH);

test(PATH, async (t) => {
    const res = await fetch(URL);
    const headers = res.headers;
    t.is(headers.get(CONTENT_TYPE_HEADER), MIME_TEXT_PLAIN_UTF_8, `${CONTENT_TYPE_HEADER} header value`);

    const body = await res.text();
    t.is(body, 'hello', 'response body');
});
