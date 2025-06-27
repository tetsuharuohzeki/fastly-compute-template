import * as assert from 'node:assert/strict';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { isNull } from 'option-t/nullable';

import { APP_LOCAL_ORIGIN } from '@c_at_e/integration_tests_config';
import * as logger from '@c_at_e/integration_tests_logger';

import { assertIsFunction, assertIsNonNullObject, assertIsString, assertIsStringArray } from './assert_types.js';
import { parseCliOptions, assertIsCliOptions } from './cli_flags.js';
import { pollToLaunchApplication } from './poll_to_launch_app.js';
import { APPLICATION, MOCK_SERVER_LIST, TEST_RUNNER, TEST_RUNNER_WITH_UPDATE_SNAPSHOTS } from './process_config.js';
import { spawnCancelableChild } from './spawn.js';
import { SuperVisorContext, assertIsSuperVisorContext } from './sv_ctx.js';

/**
 *  @typedef    {import('option-t/nullable').Nullable<T>}  Nullable
 *  @template   T
 */
/**
 *  @typedef    {import('./spawn.js').ProcessExitStatus}  ProcessExitStatus
 */

const THIS_FILENAME = fileURLToPath(import.meta.url);
const THIS_DIRNAME = path.dirname(THIS_FILENAME);

const WORKSPACE_ROOT = path.resolve(THIS_DIRNAME, '../..');

const REPOSITORY_ROOT = path.resolve(WORKSPACE_ROOT, '..');
const INTEGRATION_TESTS_DIR = WORKSPACE_ROOT;

/**
 *  @param {import('./cli_flags.js').CliOptionsArgs} cliOptions
 *  @returns    {void}
 */
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

/**
 * @param {AbortController} aborter
 * @param {string} name
 * @param {Array<string>} args
 * @param {import('node:child_process').SpawnOptions} option
 * @returns {Promise<ProcessExitStatus>}
 */
async function spawnAndGracefulShutdown(aborter, name, args, option) {
    assert.ok(aborter instanceof AbortController, `aborter must be AbortController`);
    assert.ok(option.signal instanceof AbortSignal, 'option.signal must be set');

    const status = await spawnCancelableChild(name, args, option);

    aborter.abort();
    return status;
}

/**
 *  @param {SuperVisorContext} ctx
 *  @param  {string}    command
 *  @param  {Array<string>}  cmdArgs
 *  @returns {Promise<Nullable<ProcessExitStatus>>}
 */
async function launchMockServer(ctx, command, cmdArgs) {
    assertIsSuperVisorContext(ctx);
    assertIsString(command);
    assertIsStringArray(cmdArgs);

    const aborter = ctx.aborter;
    const signal = aborter.signal;
    if (signal.aborted) {
        return null;
    }

    const status = await spawnAndGracefulShutdown(aborter, command, cmdArgs, {
        cwd: INTEGRATION_TESTS_DIR,
        stdio: 'inherit',
        signal,
    });

    return status;
}

/**
 * @param {SuperVisorContext} ctx
 * @returns {Promise<Nullable<ProcessExitStatus>>}
 */
async function launchLocalApplicationServer(ctx) {
    assertIsSuperVisorContext(ctx);

    const aborter = ctx.aborter;
    const signal = aborter.signal;
    if (signal.aborted) {
        return null;
    }

    const status = await spawnAndGracefulShutdown(aborter, APPLICATION.cmd, APPLICATION.args, {
        cwd: REPOSITORY_ROOT,
        stdio: 'inherit',
        signal,
    });

    return status;
}

const TIMEOUT_MS_DEADLINE_TO_WAIT_APPLICATION = 15 * 1000;

/**
 * @param {SuperVisorContext} ctx
 * @returns {Promise<Nullable<boolean>>}
 */
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

    const { cmd, args } = shouldUpdateSnapshots ? TEST_RUNNER_WITH_UPDATE_SNAPSHOTS : TEST_RUNNER;
    assertIsString(cmd);
    assertIsStringArray(args);

    const { code } = await spawnAndGracefulShutdown(aborter, cmd, args, {
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
    assertIsNonNullObject(process);
    assertIsFunction(canceler);

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
    /** @type {(e: unknown) => void} */
    const cancelGlobal = (e) => {
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
    const mockServerList = MOCK_SERVER_LIST.map((value) => {
        const { cmd, args } = value;
        return launchMockServer(globalCtx, cmd, args);
    });

    const serverFormation = Promise.all([
        // @prettier-ignore
        ...mockServerList,
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
        process.exitCode = 1;
        return;
    }

    logger.debug('Wait to shutdown all background processes...');
    await serverFormation;
    logger.debug('Complete to shutdown all background processes.');

    const ok = testResult;
    if (!ok) {
        logger.debug('the test runner is totally faild.');
        process.exitCode = 1;
        return;
    }

    logger.debug('Finish integration test successfully.');
}
