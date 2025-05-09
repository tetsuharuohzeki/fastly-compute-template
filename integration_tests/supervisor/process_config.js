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
        assertIsString(cmd);
        assertIsStringArray(args);

        this.cmd = cmd;
        this.args = args;

        Object.freeze(this);
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

export const APPLICATION = new Process('make', ['run_serve_localy', '-j', 'FASTLY_TOML_ENV=testing']);

export const MOCK_SERVER_LIST = [
    // @prettier-ignore
    new NodeProcess(['./mock_server/main.js', '--port', '8030']),
];

export const TEST_RUNNER = new TestRunner('test');

export const TEST_RUNNER_WITH_UPDATE_SNAPSHOTS = new TestRunner('test:update_snapshot');
