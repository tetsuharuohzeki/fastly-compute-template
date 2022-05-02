mod application;
mod build_info;

use fastly::{Error, Request, Response};

#[fastly::main]
fn main(req: Request) -> Result<Response, Error> {
    application::main(req)
}
