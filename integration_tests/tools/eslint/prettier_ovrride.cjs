'use strict';

module.exports = {
    extends: ['prettier'],

    rules: {
        // prettier omits curly blacket for if statement by default like following:
        //
        //  before:
        //      ```js
        //          if (cond)
        //              bar();
        //      ```
        //  after:
        //      ```js
        //          if (cond) bar();
        //      ```
        //
        // However, we think it would better to enforce blacket for all statement block for
        //  1. uniform coding style,
        //  2. make more resilient code style.
        //
        // see also https://github.com/prettier/eslint-config-prettier#curly
        curly: ['error', 'all'],
    },
};
