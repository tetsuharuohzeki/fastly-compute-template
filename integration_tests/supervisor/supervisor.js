import * as assert from 'node:assert/strict';
import * as path from 'node:path';
import * as timer from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import { parseCliOptions, assertIsCliOptions } from './flags.js';
import { spawnCancelableChild } from './spawn.js';
import { SuperVisorContext, assertIsSuperVisorContext } from './sv_ctx.js';

const THIS_FILENAME = fileURLToPath(import.meta.url);
const THIS_DIRNAME = path.dirname(THIS_FILENAME);

const WORKSPACE_ROOT = path.resolve(THIS_DIRNAME, '..');

const REPOSITORY_ROOT = path.resolve(WORKSPACE_ROOT, '..');
const INTEGRATION_TESTS_DIR = WORKSPACE_ROOT;

function dumpFlags(cliOptions) {
    assertIsCliOptions(cliOptions);

    const txt = `
============ Configurations for integration tests ============
RELEASE_CHANNEL: ${cliOptions.releaseChannel}
UPDATE_SNAPSHOTS: ${cliOptions.shouldUpdateSnapshots}
IS_ONLY_FORMATION: ${cliOptions.isOnlyFormation}
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

async function launchMockServer(ctx) {
    assertIsSuperVisorContext(ctx);

    const aborter = ctx.aborter;
    const signal = aborter.signal;

    const serverPath = path.resolve(INTEGRATION_TESTS_DIR, './mock_server/main.js');
    const status = await spawnAndGracefulShutdown(aborter, 'node', [serverPath], {
        cwd: INTEGRATION_TESTS_DIR,
        stdio: 'inherit',
        signal,
    });

    return status;
}

async function launchLocalApplicationServer(ctx) {
    assertIsSuperVisorContext(ctx);

    const aborter = ctx.aborter;
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

async function launchTestRunner(ctx) {
    assertIsSuperVisorContext(ctx);

    const aborter = ctx.aborter;
    const signal = aborter.signal;
    const cliOptions = ctx.cliOptions;

    const shouldUpdateSnapshots = cliOptions.shouldUpdateSnapshots;

    // await to launch the app server.
    // this value is just heuristics.
    const millisec = 2 * 1000;
    await timer.setTimeout(millisec);

    const RELEASE_CHANNEL = ctx.releaseChannel;
    const env = {
        ...process.env,
        RELEASE_CHANNEL,
    };

    const cmd = shouldUpdateSnapshots ? 'test:update_snapshot' : 'test';

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
    const cliOptions = parseCliOptions();
    dumpFlags(cliOptions);
    const globalCtx = new SuperVisorContext(cliOptions);

    const globalAborter = globalCtx.aborter;
    const isOnlyFormation = cliOptions.isOnlyFormation;

    if (isOnlyFormation) {
        process.once('SIGINT', () => {
            globalAborter.abort();
        });
    }

    const testResult = isOnlyFormation === false ? launchTestRunner(globalCtx) : Promise.resolve();

    const serverFormation = Promise.all([
        // @prettier-ignore
        launchMockServer(globalCtx),
        launchLocalApplicationServer(globalCtx),
    ]);

    await Promise.all([serverFormation, testResult]);
    if (isOnlyFormation) {
        return;
    }

    const ok = await testResult;
    if (!ok) {
        process.exit(1);
    }
}
