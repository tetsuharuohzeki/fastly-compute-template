import * as http from 'node:http';
import { URL } from 'node:url';

import * as HttpHeader from '../http_helpers/http_header.js';
import * as HttpStatus from '../http_helpers/http_status.js';
import * as Mime from '../http_helpers/mime.js';

import * as logger from '../logger/mod.js';

const PORT = 8030;

(async function main() {
    logger.setupLogger('mock_server', false);

    const server = http.createServer((req, res) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const urlPathname = url.pathname;
        logger.info(`request incoming: ${urlPathname}`);

        if (urlPathname === '/hello_this_is_mock') {
            res.setHeader(HttpHeader.CONTENT_TYPE, Mime.TEXT_PLAIN_UTF_8);
            res.writeHead(HttpStatus.OK);
            res.end(`this is mock server listening on ${String(PORT)}`);
            return;
        }

        res.writeHead(HttpStatus.NOT_FOUND);
        res.end();
    });
    server.listen(PORT);
    logger.info(`mock server listen on ${String(PORT)}`);
})();
