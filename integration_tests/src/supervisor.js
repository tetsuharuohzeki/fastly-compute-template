import * as assert from 'node:assert/strict';
import * as path from 'node:path';
import * as timer from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import { UPDATE_SNAPSHOTS } from './flags.js';
import { spawnCancelableChild } from './spawn.js';

const THIS_FILENAME = fileURLToPath(import.meta.url);
const THIS_DIRNAME = path.dirname(THIS_FILENAME);

const WORKSPACE_ROOT = path.resolve(THIS_DIRNAME, '..');

const INTEGRATION_TESTS_DIR = WORKSPACE_ROOT;

function dumpFlags() {
    const txt = `
============ Configurations for integration tests ============
UPDATE_SNAPSHOTS: ${UPDATE_SNAPSHOTS}
==============================================================
    `;
    console.log(txt);
}

async function spawnAndGracefulShutdown(aborter, name, args, option) {
    assert.ok(aborter instanceof AbortController, `aborter must be AbortController`);
    assert.ok(option.signal instanceof AbortSignal, 'option.signal must be set');

    const status = await spawnCancelableChild(name, args, option);

    aborter.abort();
    return status;
}

async function launchLocalApplicationServer(aborter) {
    assert.ok(aborter instanceof AbortController);
    const signal = aborter.signal;

    const status = await spawnAndGracefulShutdown(aborter, 'make', ['run_serve_localy', '-j'], {
        stdio: 'inherit',
        signal,
    });

    return status;
}

async function launchTestRunner(aborter) {
    assert.ok(aborter instanceof AbortController);
    const signal = aborter.signal;

    // await to launch the app server.
    // this value is just heuristics.
    const millisec = 2 * 1000;
    await timer.setTimeout(millisec);

    const cmd = UPDATE_SNAPSHOTS ? 'test:update_snapshot' : 'test';

    const { code } = await spawnAndGracefulShutdown(aborter, 'npm', ['run', cmd], {
        cwd: INTEGRATION_TESTS_DIR,
        stdio: 'inherit',
        signal,
    });

    if (code !== 0) {
        return false;
    }

    return true;
}

(async function main() {
    dumpFlags();

    const globalAborter = new AbortController();
    const testResult = launchTestRunner(globalAborter);

    await Promise.all([launchLocalApplicationServer(globalAborter), testResult]);

    const ok = await testResult;
    if (!ok) {
        process.exit(1);
    }
})();
