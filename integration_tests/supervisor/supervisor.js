import * as assert from 'node:assert/strict';
import * as path from 'node:path';
import * as timer from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import { RELEASE_CHANNEL, UPDATE_SNAPSHOTS, LAUNCH_INTEGRATION_TEST_FORMATION } from './flags.js';
import { spawnCancelableChild } from './spawn.js';

const THIS_FILENAME = fileURLToPath(import.meta.url);
const THIS_DIRNAME = path.dirname(THIS_FILENAME);

const WORKSPACE_ROOT = path.resolve(THIS_DIRNAME, '..');

const REPOSITORY_ROOT = path.resolve(WORKSPACE_ROOT, '..');
const INTEGRATION_TESTS_DIR = WORKSPACE_ROOT;

function dumpFlags() {
    const txt = `
============ Configurations for integration tests ============
RELEASE_CHANNEL: ${RELEASE_CHANNEL}
UPDATE_SNAPSHOTS: ${UPDATE_SNAPSHOTS}
LAUNCH_INTEGRATION_TEST_FORMATION: ${LAUNCH_INTEGRATION_TEST_FORMATION}
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

async function launchMockServer(aborter) {
    assert.ok(aborter instanceof AbortController);
    const signal = aborter.signal;

    const serverPath = path.resolve(INTEGRATION_TESTS_DIR, './mock_server/main.js');
    const status = await spawnAndGracefulShutdown(aborter, 'node', [serverPath], {
        cwd: INTEGRATION_TESTS_DIR,
        stdio: 'inherit',
        signal,
    });

    return status;
}

async function launchLocalApplicationServer(aborter) {
    assert.ok(aborter instanceof AbortController);
    const signal = aborter.signal;

    const status = await spawnAndGracefulShutdown(
        aborter,
        'make',
        ['run_serve_localy', '-j', 'FASTLY_TOML_ENV=testing'],
        {
            cwd: REPOSITORY_ROOT,
            stdio: 'inherit',
            signal,
        }
    );

    return status;
}

async function launchTestRunner(aborter) {
    assert.ok(aborter instanceof AbortController);
    const signal = aborter.signal;

    // await to launch the app server.
    // this value is just heuristics.
    const millisec = 2 * 1000;
    await timer.setTimeout(millisec);

    const env = {
        ...process.env,
        RELEASE_CHANNEL,
    };

    const cmd = UPDATE_SNAPSHOTS ? 'test:update_snapshot' : 'test';

    const { code } = await spawnAndGracefulShutdown(aborter, 'npm', ['run', cmd], {
        cwd: INTEGRATION_TESTS_DIR,
        env,
        stdio: 'inherit',
        signal,
    });

    if (code !== 0) {
        return false;
    }

    return true;
}

export async function main(process) {
    dumpFlags();

    const globalAborter = new AbortController();

    if (LAUNCH_INTEGRATION_TEST_FORMATION) {
        process.once('SIGINT', () => {
            globalAborter.abort();
        });
    }

    const testResult =
        LAUNCH_INTEGRATION_TEST_FORMATION === false ? launchTestRunner(globalAborter) : Promise.resolve();

    const serverFormation = Promise.all([
        // @prettier-ignore
        launchMockServer(globalAborter),
        launchLocalApplicationServer(globalAborter),
    ]);

    await Promise.all([serverFormation, testResult]);
    if (LAUNCH_INTEGRATION_TEST_FORMATION) {
        return;
    }

    const ok = await testResult;
    if (!ok) {
        process.exit(1);
    }
}