import * as assert from 'node:assert/strict';
import * as http from 'node:http';

import { HttpStatus, HttpHeader } from '@c_at_e/integration_http_helpers';
import * as logger from '@c_at_e/integration_tests_logger';

import { RequestContext, createURLFromRequest } from './req_context.js';

const X_DEBUG_BACKEND_SERVER_NAME = HttpHeader.X_DEBUG_BACKEND_SERVER_NAME;

/**
 *  @callback   Handler
 *  @param  {http.IncomingMessage}  req
 *  @param  {http.ServerResponse} res
 *  @param  {URL}   url
 *  @param  {RequestContext} context
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
        res.setHeader(X_DEBUG_BACKEND_SERVER_NAME, serverName);

        const url = createURLFromRequest(req);
        using context = RequestContext.fromRequest(url, req);

        const urlPathname = url.pathname;
        logger.info(`request incoming: ${urlPathname}`);

        let ok = false;
        try {
            ok = await handler(req, res, url, context);
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
