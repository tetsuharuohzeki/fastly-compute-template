import test from 'ava';
import { fetch } from 'undici';

import { HttpHeader, Mime } from '@c_at_e_integration_tests/http_helpers';

import { constructUrl } from './__helpers__/domain.js';
import { isNull } from 'option-t/nullable';

const CONTENT_TYPE_HEADER = HttpHeader.CONTENT_TYPE;

const PATH = '/buildinfo';
const URL = constructUrl(PATH);

test(PATH, async (t) => {
    const res = await fetch(URL);
    const headers = res.headers;
    t.is(headers.get(CONTENT_TYPE_HEADER), Mime.APPLICATION_JSON, `${CONTENT_TYPE_HEADER} header value`);

    const body = await res.json();
    if (typeof body !== 'object') {
        t.fail('the response is not an object');
        return;
    }
    if (isNull(body)) {
        t.fail('the response is null');
        return;
    }

    t.true(Object.hasOwn(body, 'git_revision'), 'contains git revision info');
    t.true(Object.hasOwn(body, 'build_date'), 'contains build date info');
});
