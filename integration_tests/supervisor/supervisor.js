import * as assert from 'node:assert/strict';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { APP_LOCAL_ORIGIN } from '../url_origin.js';

import { parseCliOptions, assertIsCliOptions } from './cli_flags.js';
import { pollToLaunchApplication } from './poll_to_launch_app.js';
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
    if (signal.aborted) {
        return null;
    }

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
    if (signal.aborted) {
        return null;
    }

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

const TIMEOUT_MS_DEADLINE_TO_WAIT_APPLICATION = 15 * 1000;

async function launchTestRunner(ctx) {
    assertIsSuperVisorContext(ctx);

    const aborter = ctx.aborter;
    const signal = aborter.signal;
    if (signal.aborted) {
        return null;
    }

    const cliOptions = ctx.cliOptions;

    const shouldUpdateSnapshots = cliOptions.shouldUpdateSnapshots;

    const appIsLaunched = await pollToLaunchApplication(
        signal,
        APP_LOCAL_ORIGIN,
        TIMEOUT_MS_DEADLINE_TO_WAIT_APPLICATION
    );
    if (!appIsLaunched) {
        aborter.abort();
        console.error(`cannot launche the test target application`);
        return false;
    }

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
    const cancelGlobal = () => {
        if (globalAborter.signal.aborted) {
            return;
        }

        globalAborter.abort();
    };

    process.once('SIGTERM', cancelGlobal);

    const isOnlyFormation = cliOptions.isOnlyFormation;
    if (isOnlyFormation) {
        process.once('SIGINT', cancelGlobal);
    }

    const testResult = isOnlyFormation === false ? launchTestRunner(globalCtx) : Promise.resolve(true);

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
