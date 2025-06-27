import * as path from 'node:path';

const THIS_DIRNAME = import.meta.dirname;

const CONFIG_PKG_ROOT_DIR = path.resolve(THIS_DIRNAME, '..');

export const WORKSPACES_ROOT_DIR = path.resolve(CONFIG_PKG_ROOT_DIR, '..');
export const INTEGRATION_TESTS_DIR = path.resolve(WORKSPACES_ROOT_DIR, '..');
export const REPOSITORY_ROOT_DIR = path.resolve(INTEGRATION_TESTS_DIR, '..');

export const AUTO_TESTS_PKG_ROOT_DIR = path.resolve(WORKSPACES_ROOT_DIR, 'auto_tests');
