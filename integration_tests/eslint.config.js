import js from '@eslint/js';
import globals from 'globals';

import prettierOverride from './tools/eslint/prettier_ovrride.js';

export default [
    js.configs.recommended,
    ...prettierOverride,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.nodeBuiltin,
            },
        },

        rules: {
            // Not covered by js.configs.recommended,
            strict: ['error', 'global'],
            'no-unused-private-class-members': 'warn',

            'no-unused-vars': [
                'warn',
                {
                    // Not make an error for debugging.
                    vars: 'all',
                    args: 'after-used',
                    argsIgnorePattern: '^_', // Sort with TypeScript compiler's builtin linter.
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_', // Allow `catch (_e) {...}`
                },
            ],
        },
    },
];
