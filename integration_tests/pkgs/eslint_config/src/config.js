import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

import * as prettierConfig from './prettier_ovrride.js';

export default defineConfig([
    js.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.nodeBuiltin,
                // Use globalThis instead.
                global: false,
                // Use undici instead.
                fetch: false,
                FormData: false,
                Headers: false,
                Request: false,
                Response: false,
            },
            ecmaVersion: 'latest',
        },

        linterOptions: {
            reportUnusedDisableDirectives: 'warn',
            reportUnusedInlineConfigs: 'warn',
        },

        rules: {
            // Not covered by js.configs.recommended,
            strict: ['error', 'global'],
            'no-unused-private-class-members': 'warn',
            // In JavaScript, after ES Module or CommonJS era (single module per single file),
            // excluding the case to improve an API ergonomics or requirement to implement an object interface,
            // we don't have to belong a function that does not touch `this` to a class unlike Java or C++.
            // We should not do such a thing.
            //
            // This rule bans a class instance method
            // that does not touch any `this` to improve a possibility to minify a code.
            //
            // Additionally, it's hard to minify a property that is on prototype chain.
            // Typically, they appears as a pattern as class' instance method.
            // We cannot remove or mangle a code like `a.foo()` style code
            // without analysis for whole of programs including usages of reflection
            // or identifying what item is a part of public interface.
            //
            // To get a chance to improve a code size performance and to simplify a code,
            // it's better that we should export a standalone function directly
            // instead of a part of class if it does not affect an API ergonomics.
            'class-methods-use-this': 'warn',

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

            // We don't have any strong motivation to allow `var` to declare a variable.
            'no-var': 'error',
        },
    },
    ...prettierConfig.configs,
]);
