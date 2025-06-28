import * as assert from 'node:assert/strict';
import { assertIsStringArray, assertIsString } from './assert_types.js';

class Process {
    /** @type   {string} */
    cmd;
    /** @type   {Array<string>} */
    args;

    /**
     * @param {string} cmd
     * @param {Array<string>} args
     */
    constructor(cmd, args) {
        assert.notStrictEqual(new.target, Process, 'this class is designed as abstract class');
        assertIsString(cmd);
        assertIsStringArray(args);

        this.cmd = cmd;
        this.args = args;

        Object.freeze(this);
    }
}

class MakeProcess extends Process {
    /**
     * @param {Array<string>} args
     */
    constructor(args) {
        super('make', args);
    }
}

class NodeProcess extends Process {
    /**
     * @param {Array<string>} args
     */
    constructor(args) {
        super('node', args);
    }
}

class TestRunner extends Process {
    /**
     * @param {string} mode
     */
    constructor(mode) {
        assertIsString(mode);
        super('node', ['--run', mode]);
    }
}

export const APPLICATION = new MakeProcess(['run_serve_localy', '-j', 'FASTLY_TOML_ENV=testing']);

export const MOCK_SERVER_LIST = [
    // @prettier-ignore
    new NodeProcess(['./pkgs/mock_server/src/main.js', '--port', '8030']),
];

export const TEST_RUNNER = new TestRunner('test');

export const TEST_RUNNER_WITH_UPDATE_SNAPSHOTS = new TestRunner('test:update_snapshot');
