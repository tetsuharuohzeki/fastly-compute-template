import * as assert from 'node:assert/strict';
import { setMaxListeners } from 'node:events';
import { setTimeout } from 'node:timers/promises';
import { fetch } from 'undici';

const POLLING_INTERVAL_MS = 100;

export async function pollToLaunchApplication(signal, url, timeoutMillisec) {
    assert.ok(signal instanceof AbortSignal);

    // This value is just heuristics.
    // For example, in my machine (MBP15 2017), the release build requires 1.5 sec to launche the app.
    // So we always need to await 1 sec for the application.
    await setTimeout(1500);

    // This avoid the waring:
    //  > (node:12052) MaxListenersExceededWarning: Possible EventTarget memory leak detected.
    //  > 11 abort listeners added to [AbortSignal]. Use events.setMaxListeners() to increase limit
    setMaxListeners(100, signal);

    const begin = Date.now();
    const deadline = begin + timeoutMillisec;

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
