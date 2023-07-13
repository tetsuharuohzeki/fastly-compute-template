#![warn(
    // We would like to more recommend to use rust 2018 idioms
    // See https://doc.rust-lang.org/rustc/lints/groups.html
    rust_2018_idioms,
    // We enable clippy rules as same level as `clippy:all` except `clippy:style`.
    // See hhttps://github.com/tetsuharuohzeki/fastly-compute-at-edge-template/issues/119
    //
    // I think rust-clippy's style rules a bit opinionated
    // and I guess we don't have to enable about it. Hence, we disable it.
    //
    // If we face some problems about sorting a style,
    // then we should rethink to enable `clippy:style`.
    clippy::complexity,
    clippy::correctness,
    clippy::perf,
    clippy::suspicious,
)]
#![allow(
    // We would like to write annotate explicitly.
    clippy::needless_lifetimes,
    // We would like to create a return value variable.
    // That makes it easy to add a break point for the return value by debugger.
    clippy::let_and_return,
)]

mod application;
mod build_info;

use fastly::{Error, Request, Response};

#[fastly::main]
fn main(req: Request) -> Result<Response, Error> {
    application::main(req)
}

#[cfg(all(not(feature = "production"), not(feature = "canary")))]
compile_error!("You must specify the release channel.");

#[cfg(not(any(feature = "production", feature = "canary")))]
compile_error!("You must choose any one of release channels.");

// The current cargo does not have a way to define mutually exclusive features.
// https://github.com/rust-lang/cargo/issues/2980
//
// We need to do same compile-time check by the combination of `#[cfg]`.
#[cfg(all(feature = "production", feature = "canary"))]
compile_error!("Release channel must be exclusively for each other.");
