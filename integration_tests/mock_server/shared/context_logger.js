import * as logger from '../../logger/mod.js';

export class ContextLogger {
    /** @type   {string} */
    _fastlyTraceId;

    constructor(fastlyTraceId) {
        this._fastlyTraceId = fastlyTraceId;
        Object.seal(this);
    }

    debug(message) {
        const fastlyTraceId = this._fastlyTraceId;
        logger.debug(`{id={${fastlyTraceId}} ${message}`);
    }

    info(message) {
        const fastlyTraceId = this._fastlyTraceId;
        logger.info(`{id={${fastlyTraceId}} ${message}`);
    }

    warn(message) {
        const fastlyTraceId = this._fastlyTraceId;
        logger.warn(`{id={${fastlyTraceId}} ${message}`);
    }

    error(message) {
        const fastlyTraceId = this._fastlyTraceId;
        logger.error(`{id={${fastlyTraceId}} ${message}`);
    }
}
