import * as assert from 'node:assert/strict';
import { setMaxListeners } from 'node:events';
import { setTimeout } from 'node:timers/promises';
import { fetch } from 'undici';

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
    assert.ok(typeof url === 'string');
    assert.ok(typeof timeoutMillisec === 'number');
    assert.ok(timeoutMillisec > INITIAL_WAIT_MS, `timeoutMillisec must be >= ${INITIAL_WAIT_MS}ms`);

    // This avoid the waring:
    //  > (node:12052) MaxListenersExceededWarning: Possible EventTarget memory leak detected.
    //  > 11 abort listeners added to [AbortSignal]. Use events.setMaxListeners() to increase limit
    setMaxListeners(100, signal);

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
