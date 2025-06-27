import * as logger from '@c_at_e_integration_tests/logger';

export class ContextLogger {
    /**
     *  @private
     *  @type   {string}
     */
    _fastlyTraceId;

    /**
     * @param {string} fastlyTraceId
     */
    constructor(fastlyTraceId) {
        this._fastlyTraceId = fastlyTraceId;
        Object.seal(this);
    }

    /**
     *  @param {unknown} message
     *  @returns    {void}
     */
    debug(message) {
        const fastlyTraceId = this._fastlyTraceId;
        logger.debug(`{id={${fastlyTraceId}} ${message}`);
    }

    /**
     *  @param {unknown} message
     *  @returns    {void}
     */
    info(message) {
        const fastlyTraceId = this._fastlyTraceId;
        logger.info(`{id={${fastlyTraceId}} ${message}`);
    }

    /**
     *  @param {unknown} message
     *  @returns    {void}
     */
    warn(message) {
        const fastlyTraceId = this._fastlyTraceId;
        logger.warn(`{id={${fastlyTraceId}} ${message}`);
    }

    /**
     *  @param {unknown} message
     *  @returns    {void}
     */
    error(message) {
        const fastlyTraceId = this._fastlyTraceId;
        logger.error(`{id={${fastlyTraceId}} ${message}`);
    }
}
