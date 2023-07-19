import * as HttpHeader from '../http_helpers/http_header.js';
import * as HttpStatus from '../http_helpers/http_status.js';
import * as Mime from '../http_helpers/mime.js';

import { createHttpServer } from './shared/create_server.js';
import { parseCliOptions } from './shared/parse_cli.js';

const { port } = parseCliOptions();

createHttpServer('mock_main', port, async (_req, res, url) => {
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
