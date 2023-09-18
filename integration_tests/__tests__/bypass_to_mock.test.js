import test from 'ava';
import { fetch } from 'undici';

import * as HttpHeader from '../http_helpers/http_header.js';
import * as HttpStatus from '../http_helpers/http_status.js';
import * as Mime from '../http_helpers/mime.js';

import { constructUrl } from './__helpers__/domain.js';

const CONTENT_TYPE_HEADER = HttpHeader.CONTENT_TYPE;
const MIME_TEXT_PLAIN_UTF_8 = Mime.TEXT_PLAIN_UTF_8;

const PATH = '/hello_this_is_mock';
const URL = constructUrl(PATH);

test(PATH, async (t) => {
    const res = await fetch(URL);
    t.is(res.status, HttpStatus.OK);

    const headers = res.headers;
    t.is(headers.get(CONTENT_TYPE_HEADER), MIME_TEXT_PLAIN_UTF_8, `${CONTENT_TYPE_HEADER} header value`);

    const body = await res.text();
    t.is(body, 'this is mock server listening on 8030', 'response body');
});
