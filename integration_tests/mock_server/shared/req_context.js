import * as assert from 'node:assert/strict';
import { URL } from 'node:url';
import { expectNotNull, isNull, unwrapOrFromNullable } from 'option-t/esm/Nullable';

import { ContextLogger } from './context_logger.js';
import { unwrapOrFromUndefinable } from 'option-t/esm/Undefinable';

// We tried to use `FASTLY_TRACE_ID` envvar to [trace-id](https://www.w3.org/TR/trace-context/#trace-context-http-headers-format)
// but its value wouls take `0` in the local emulator. So We cannot use the value directly.
// But we would like to carry information for debugging.
// Thus we set the value side-by-side.
const HTTP_FASTLY_TRACE_HEADER = 'FASTLY_TRACE_ID'.toLowerCase();

/**
 *  @param {import('node:http').IncomingMessage} req
 *  @returns    {string|null}
 */
function getFastlyTraceId(req) {
    const headers = req.headers;
    const value = headers[HTTP_FASTLY_TRACE_HEADER];
    if (!value) {
        return null;
    }

    if (typeof value !== 'string') {
        return null;
    }

    return value;
}

const ON_CLOSE_EVENT = 'close';

export class RequestContext {
    /**
     *  @param  {URL}   url
     *  @param {import('node:http').IncomingMessage} req
     *  @returns    {RequestContext}
     */
    static fromRequest(url, req) {
        const fastlyTraceId = unwrapOrFromNullable(
            getFastlyTraceId(req),
            // could not get ${HTTP_FASTLY_TRACE_HEADER} req header.
            // e.g. on the startup healthcheck from Viceroy.
            `unknown`
        );
        const ctx = new RequestContext(url, fastlyTraceId);
        ctx.initialize(req);

        return ctx;
    }

    /**
     *  @private
     *  @type {URL|null}
     */
    _url;
    /**
     *  @private
     *  @type {string}
     */
    _fastlyTraceId;
    /**
     *  @private
     *  @type {AbortController|null}
     */
    _aborter = null;
    /**
     *  @private
     *  @type {ContextLogger|null}
     */
    _logger = null;

    /**
     * @param {URL} url
     * @param {string} fastlyTraceId
     */
    constructor(url, fastlyTraceId) {
        assert.ok(url instanceof URL);
        this._url = url;
        this._fastlyTraceId = fastlyTraceId;
        this._aborter = new AbortController();
        this._logger = new ContextLogger(fastlyTraceId);
        Object.seal(this);
    }

    /**
     *  @param {import('node:http').IncomingMessage} req
     *  @returns    {void}
     *      We cannot stop the prcessing at here. We need return immediately.
     */
    initialize(req) {
        const signal = this.abortSignal;
        const onClose = this.onClose.bind(this);

        // If the request has been cancelled by the client before the server close it,
        // onClose will be called first.
        // Otherwise, this object's finalize is called and teardown this AbortSignal
        // and call this.
        // Either way, we remove this onClose listener surely.
        signal.addEventListener(
            'abort',
            () => {
                req.removeListener(ON_CLOSE_EVENT, onClose);
            },
            {
                once: true,
            }
        );

        req.addListener(ON_CLOSE_EVENT, onClose);
    }

    /**
     *  @private
     */
    _destroy() {
        this._logger = null;
        this._aborter = null;
        this._fastlyTraceId = '';
        this._url = null;
    }

    get url() {
        return expectNotNull(this._url, 'has been disposed');
    }

    get fastlyTraceId() {
        return this._fastlyTraceId;
    }

    /**
     *  @private
     *  @returns {AbortController}
     */
    _getAborter() {
        const aborter = expectNotNull(this._aborter, 'has been disposed');
        return aborter;
    }

    get logger() {
        return expectNotNull(this._logger, 'has been disposed');
    }

    get abortSignal() {
        const aborter = this._getAborter();
        return aborter.signal;
    }

    get aborted() {
        return this.abortSignal.aborted;
    }

    onClose() {
        this.finalize();
    }

    abort() {
        const aborter = this._getAborter();
        aborter.abort();

        this._destroy();
    }

    finalize() {
        if (isNull(this._aborter)) {
            // we treat this object has been finialized.
            return;
        }

        this.abort();
    }
}

/**
 *  @param {import('node:http').IncomingMessage} req
 *  @returns    {URL}
 */
export function createURLFromRequest(req) {
    const reqUrl = unwrapOrFromUndefinable(req.url, '');
    const url = new URL(reqUrl, `http://${req.headers.host}`);
    return url;
}
