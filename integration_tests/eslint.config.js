import globals from 'globals';

import prettierOverride from './tools/eslint/prettier_ovrride.js';

export default [
    'eslint:recommended',
    ...prettierOverride,
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
