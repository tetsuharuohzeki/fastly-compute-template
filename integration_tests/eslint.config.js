import prettierConfig from 'eslint-config-prettier/index.js';
import globals from 'globals';

import prettierOverride from './tools/eslint/prettier_ovrride.cjs';

export default [
    'eslint:recommended',
    {
        rules: prettierConfig.rules,
    },
    {
        rules: prettierOverride.rules,
    },
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.nodeBuiltin,
            },
        },

        rules: {
            // Not covered by eslint:recommended
            strict: ['error', 'global'],
            'no-unused-private-class-members': 'warn',
        },
    },
];
