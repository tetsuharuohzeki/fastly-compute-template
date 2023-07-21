import * as assert from 'node:assert/strict';
import { setTimeout } from 'node:timers/promises';
import { fetch } from 'undici';
import { assertIsNumber, assertIsString } from './assert_types.js';

// This value is just heuristics.
// We always need to await about 1~ sec to launch a new process for the application.
// For example, in my machine (MBP15 2017), the release build requires 1.5 sec to launche the app.
const INITIAL_WAIT_MS = 1500;

const POLLING_INTERVAL_MS = 100;

/**
 * @param {AbortSignal} signal
 * @param {string} url
 * @param {number} timeoutMillisec
 * @returns {Promise<boolean>}
 */
export async function pollToLaunchApplication(signal, url, timeoutMillisec) {
    assert.ok(signal instanceof AbortSignal);
    assertIsString(url);
    assertIsNumber(timeoutMillisec);
    assert.ok(timeoutMillisec > INITIAL_WAIT_MS, `timeoutMillisec must be >= ${INITIAL_WAIT_MS}ms`);

    await setTimeout(INITIAL_WAIT_MS);

    const begin = Date.now();
    const deadline = begin + (timeoutMillisec - INITIAL_WAIT_MS);

    while (!signal.aborted && Date.now() <= deadline) {
        try {
            await fetch(url, {
                signal,
            });
            return true;
        } catch {
            // If the server is not launched, enter this path.
            await setTimeout(POLLING_INTERVAL_MS);
            continue;
        }
    }

    return false;
}
