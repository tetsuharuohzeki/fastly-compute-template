# Fastly Compute@Edge template kit for Rust

[![CI on main branch](https://github.com/tetsuharuohzeki/fastly-compute-at-edge-template/actions/workflows/ci_on_main.yaml/badge.svg)](https://github.com/tetsuharuohzeki/fastly-compute-at-edge-template/actions/workflows/ci_on_main.yaml)

## Prerequisites

- Install [rustup](https://rustup.rs/)


## How to build

Run `make help`.


### Release Channel

The current build system supports _release channel_.
Now we define these release channels.

- `production`: **For production environment**.
- `canary`: **For development environment**.

**These are mutually exclusive. You cannot enable both of them**.

If you want to build the artifact for `production` release channel,
you should invoke `make build_release -j RELEASE_CHANNEL=production`.
By default, `RELEASE_CHANNEL` makefile variable is `canary`.

Additionaly, you can pass `ADDITIONAL_FEATURE` makefile variable (e.g. `make build_debug -j ADDITIONAL_FEATURE=barfoo`).
Then the artifact will be built with enabling `barfoo` feature.

Release channel is based on [Cargo's "features" mechanism](https://doc.rust-lang.org/cargo/reference/features.html).


## Testing

This repository prodvides these way for testing:

1. Unit tests per function level (limited)
2. Integration tests with mock servers.

### Unit testing

You can write unit test per function level with [a language integrated way by Rust](https://doc.rust-lang.org/book/ch11-01-writing-tests.html).

However, we can write only limited case by this way
[as what fasly's document said](https://developer.fastly.com/learning/compute/rust/#unit-testing).
This limitation comes from Compute@Edge WASM binary requirements.

Typical failure case is compile (link) error because core parts of `fasly` crates requires
some special wasi system call as a external function but they are not resolved in non `wasm32-wasi` target
or a normal wasm runtime environment like plain [wasmtime](https://github.com/bytecodealliance/wasmtime).

__So you should write a unit test only if you need to test a platform agnostic logic like parsing a string__.

### Integration testing

Our integration testing is based on a local application launched by `fastly compute serve`,
mock servers, and a test runner written as Node.js.

Our test _supervisor_ make a formation of them.
Of course, this supports `RELEASE_CHANNEL`.

For more details, see [`integration_tests/`](./integration_tests).
