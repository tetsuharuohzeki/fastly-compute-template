#![allow(
    // We would like to write annotate explicitly.
    clippy::needless_lifetimes,
    // We would like to create a return value variable.
    // That makes it easy to add a break point for the return value by debugger.
    clippy::let_and_return,
)]

mod application;
mod build_info;
mod fastly_trace_id;

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
