'use strict';

const ECMA262_VERSION = 2022;

module.exports = {
    root: true,
    extends: [
        // @prettier-ignore
        'eslint:recommended',
        './tools/eslint/prettier_ovrride.cjs',
    ],

    parserOptions: {
        ecmaVersion: ECMA262_VERSION,
        sourceType: 'module',
    },

    env: {
        [`es${String(ECMA262_VERSION)}`]: true,
        node: true,
    },

    rules: {
        // Not covered by eslint:recommended
        strict: ['error', 'global'],
        'no-unused-private-class-members': 'warn',
    },

    overrides: [
        {
            files: ['*.cjs'],
            parserOptions: {
                sourceType: 'script',
            },
        },
    ],
};
