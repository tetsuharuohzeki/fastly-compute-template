import * as assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const SIGTERM = 15;

/**
 *  @typedef    {Object}    ProcessExitStatus
 *  @property   {number|null}    code
 *  @property   {NodeJS.Signals|null}    signal
 */

/**
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
        console.log('spawn: ' + bin + ' ' + args.join(' '));

        proc.on('exit', function (code, signal) {
            resolve({
                code,
                signal,
            });
        });

        proc.on('error', (err) => {
            if (isAbortError(err)) {
                return;
            }
            console.error(err);
            reject(err);
        });
    });

    return process;
}

function isAbortError(err) {
    return !!err && err.name === 'AbortError';
}
