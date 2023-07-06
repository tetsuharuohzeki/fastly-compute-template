import * as HttpHeader from '../http_helpers/http_header.js';
import * as HttpStatus from '../http_helpers/http_status.js';
import * as Mime from '../http_helpers/mime.js';

import { createHttpServer } from './shared/create_server.js';

const PORT = 8030;

createHttpServer('', PORT, async (_req, res, url) => {
    const urlPathname = url.pathname;

    if (urlPathname === '/hello_this_is_mock') {
        res.setHeader(HttpHeader.CONTENT_TYPE, Mime.TEXT_PLAIN_UTF_8);
        res.writeHead(HttpStatus.OK);
        res.end(`this is mock server listening on ${String(PORT)}`);
        return true;
    }

    return false;
});
