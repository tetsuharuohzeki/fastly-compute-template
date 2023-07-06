import * as assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

import * as logger from '../logger/mod.js';

const SIGTERM = 15;

/**
 *  @typedef    {Object}    ProcessExitStatus
 *  @property   {number|null}    code
 *  @property   {NodeJS.Signals|null}    signal
 */

/**
 *  @param  {string} bin
 *  @param  {Array.<string>} args
 *  @param  {import('node:child_process').SpawnOptionsWithoutStdio} option
 *  @returns    {Promise<ProcessExitStatus>}
 */
export function spawnCancelableChild(bin, args, option) {
    const process = new Promise((resolve, reject) => {
        const signal = option.signal;
        if (signal instanceof AbortSignal) {
            assert.ok(!signal.aborted, `option.signal must not be aborted`);
        }

        option.killSignal = SIGTERM;
        const proc = spawn(bin, args, option);

        const command = bin + ' ' + args.join(' ');
        logger.info(`spawn: ${command}`);

        proc.on('close', function (code, signal) {
            logger.debug(`on close: ${command}`);
            resolve({
                code,
                signal,
            });
        });

        proc.on('error', (err) => {
            if (isAbortError(err)) {
                logger.debug(`canceled on error: ${command}`);
                return;
            }
            logger.debug(`on error: ${command}`);
            logger.error(err);
            reject(err);
        });
    });

    return process;
}

/**
 * @param {Error|null|undefined} err
 * @returns {boolean}
 */
function isAbortError(err) {
    return !!err && err.name === 'AbortError';
}
