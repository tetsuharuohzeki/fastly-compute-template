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
        },
    },
];
