import * as assert from 'node:assert/strict';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { isNotNull, isNull } from 'option-t/esm/Nullable';
import { unwrapOrFromUndefinable } from 'option-t/esm/Undefinable';

import * as logger from '../logger/mod.js';
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

async function launchMockServer(ctx, filename, cliFlags = null) {
    assertIsSuperVisorContext(ctx);
    assert.strictEqual(typeof filename, 'string');

    const nodeOptions = unwrapOrFromUndefinable(cliFlags?.node, []);
    assert.ok(Array.isArray(nodeOptions));
    assert.ok(nodeOptions.every((value) => typeof value === 'string'));

    const appOptions = unwrapOrFromUndefinable(cliFlags?.app, []);
    assert.ok(Array.isArray(appOptions));
    assert.ok(appOptions.every((value) => typeof value === 'string'));

    const aborter = ctx.aborter;
    const signal = aborter.signal;
    if (signal.aborted) {
        return null;
    }

    const serverPath = path.resolve(INTEGRATION_TESTS_DIR, filename);
    const status = await spawnAndGracefulShutdown(aborter, 'node', [...nodeOptions, serverPath, ...appOptions], {
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
        logger.error(`cannot launche the test target application`);
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

/**
 *  @param  {NodeJS.Process} process
 *  @param  {(e: unknown) => void} canceler
 */
function installShutdownGlobally(process, canceler) {
    assert.ok(typeof process === 'object' && isNotNull(process));
    assert.ok(typeof canceler === 'function');

    logger.debug(`Install the global canceler`);

    process.once('SIGTERM', canceler);
    process.once('SIGINT', canceler);
    process.once('uncaughtException', canceler);
    process.once('unhandledRejection', canceler);
}

/**
 * @param {NodeJS.Process} process
 * @returns {Promise<void>}
 */
export async function main(process) {
    const cliOptions = parseCliOptions();
    dumpFlags(cliOptions);
    logger.setupLogger('supervisor', cliOptions.isVerbose);

    const globalCtx = new SuperVisorContext(cliOptions);
    const globalAborter = globalCtx.aborter;
    const cancelGlobal = (e /** @type {unknown} */) => {
        logger.debug(`the supervisor is cancelled now globally`);
        logger.error(e);

        if (globalAborter.signal.aborted) {
            logger.debug(`the supervisor has been cancelled previously`);
            return;
        }

        globalAborter.abort();
        logger.debug(`dispatched the cencallation to all tasks`);
    };
    installShutdownGlobally(process, cancelGlobal);

    logger.debug('try to launch the target application formation');
    const serverFormation = Promise.all([
        // @prettier-ignore
        launchMockServer(globalCtx, './mock_server/main.js'),
        launchLocalApplicationServer(globalCtx),
    ]);
    const isOnlyFormation = cliOptions.isOnlyFormation;
    if (isOnlyFormation) {
        logger.debug('global aborter has been aborted before to launch the test runner.');
        await serverFormation;
        return;
    }

    logger.debug('try to launch the test runner process.');
    const testResult = await launchTestRunner(globalCtx);
    if (isNull(testResult)) {
        logger.debug('global aborter has been aborted before to launch the test runner.');
        process.exit(1);
    }

    logger.debug('Wait to shutdown all background processes...');
    await serverFormation;
    logger.debug('Complete to shutdown all background processes.');

    const ok = testResult;
    if (!ok) {
        logger.debug('the test runner is totally faild.');
        process.exit(1);
    }

    logger.debug('Finish integration test successfully.');
}
