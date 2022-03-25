use fastly::http::StatusCode;
use fastly::{Error, Request, Response};

pub fn application_main(_req: Request) -> Result<Response, Error> {
    Ok(Response::from_status(StatusCode::OK))
}
