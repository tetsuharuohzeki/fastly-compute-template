import { HttpHeader, HttpStatus, Mime } from '@c_at_e_integration_tests/http_helpers';

import { createHttpServer } from './shared/create_server.js';
import { parseCliOptions } from './shared/parse_cli.js';
import { buildMatcherFromURLPattern, tryMatchAndCallRouteHandler } from './shared/mini_url_pattern_router.js';

const { port } = parseCliOptions();

const matcher = buildMatcherFromURLPattern([
    [
        `/hello_this_is_mock_by_url_pattern`,
        async (_req, res, _pattern, _url) => {
            res.setHeader(HttpHeader.CONTENT_TYPE, Mime.TEXT_PLAIN_UTF_8);
            res.writeHead(HttpStatus.OK);
            res.end(`this is mock server listening on ${String(port)}`);
        },
    ],
]);

createHttpServer('mock_main', port, async (_req, res, url) => {
    const isHandled = await tryMatchAndCallRouteHandler(matcher, _req, res, url);
    if (isHandled) {
        return true;
    }

    const urlPathname = url.pathname;
    switch (urlPathname) {
        case '/hello_this_is_mock': {
            res.setHeader(HttpHeader.CONTENT_TYPE, Mime.TEXT_PLAIN_UTF_8);
            res.writeHead(HttpStatus.OK);
            res.end(`this is mock server listening on ${String(port)}`);
            return true;
        }
        default:
            return false;
    }
});
