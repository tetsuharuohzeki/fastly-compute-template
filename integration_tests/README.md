# Integration Tests

## Testing Design

Our test supervisor script make a formation of followings.

-   _Test Runner_ running a test case under this directory.
-   _Application_ launched by `fastly compute serve`.
-   _Mock Servers_ provieds simulated requests that are purposed only for this testing.

## How to run a test

**From the repository root**, run `make run_integration_tests` or `make integration_tests`.
These commands supports `RELEASE_CHANNEL` makefile variable.

### How to update test's expectation snapshots

**From the repository root**, run `make integration_tests_with_update_expectations`
or `make run_integration_tests_with_update_expectations`.

## How To Write a Test

You can write a test case with using [ava](https://github.com/avajs/ava) on Node.js.
Please place your test case under [`__tests__/`](./__tests__).

### _Release Channel_ specific test.

Our integration tests support to write a release Channel specific test.
Files matching `__tests__/**/*.[release_channel].js` are running only if the specified release channel is matched.

For example, if you want to write a test for _production_ release channel,
then you should name a test file as `barfoo.production.js`.
