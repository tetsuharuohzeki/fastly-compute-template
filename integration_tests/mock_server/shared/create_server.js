import * as assert from 'node:assert/strict';
import * as http from 'node:http';
import { URL } from 'node:url';

import * as HttpStatus from '../../http_helpers/http_status.js';
import * as logger from '../../logger/mod.js';

/**
 *  @callback   Handler
 *  @param  {http.IncomingMessage}  req
 *  @param  {http.ServerResponse} res
 *  @param  {URL}   url
 *  @returns    {Promise<boolean>}
 */

/**
 *  @param  {string}    serverName
 *  @param  {number}    port
 *  @param  {Handler}   handler
 *  @param  {boolean}   isVerbose
 */
export function createHttpServer(serverName, port, handler, isVerbose = false) {
    logger.setupLogger(`mock_server::${serverName}`, isVerbose);

    const server = http.createServer(async (req, res) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const urlPathname = url.pathname;
        logger.info(`request incoming: ${urlPathname}`);

        let ok = false;
        try {
            ok = await handler(req, res, url);
        } catch (e) {
            logger.error(e);

            res.writeHead(HttpStatus.INTERNAL_SERVER_ERROR);
            res.end();
            return;
        }

        assert.strictEqual(typeof ok, 'boolean', 'the handler must return boolean');
        if (ok) {
            assert.strictEqual(res.writableEnded, true, 'the handler must call res.end() if it returns true');
        } else {
            assert.strictEqual(res.writableEnded, false, 'the handler must not call res.end() if it returns true');
        }

        if (ok) {
            return;
        }
        res.writeHead(HttpStatus.NOT_FOUND);
        res.end(`${String(url)} is not found`);
    });
    server.listen(port);
    logger.info(`mock server listen on ${String(port)}`);
}
