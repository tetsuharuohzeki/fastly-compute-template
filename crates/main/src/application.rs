use fastly::http::StatusCode;
use fastly::mime;
use fastly::{Error, Request, Response};

use crate::build_info::create_build_info_response;
use crate::fastly_trace_id::{get_fastly_trace_id, set_fastly_trace_id};

#[cfg(not(feature = "canary"))]
const EXAMPLE_BODY: &str = "This is production channel!";
#[cfg(feature = "canary")]
const EXAMPLE_BODY: &str = "This is canary channel!";

const BACKEND_A: &str = "backend_a";

pub type FastlyResult = Result<Response, Error>;

pub fn main(client_req: Request) -> FastlyResult {
    let req_path = client_req.get_path();
    let trace_id = get_fastly_trace_id();

    let should_res_directly: Option<FastlyResult> = match req_path {
        "/buildinfo" => {
            let res = create_build_info_response();
            Some(Ok(res))
        }
        "/" => {
            let mut res =
                Response::from_status(StatusCode::OK).with_content_type(mime::TEXT_PLAIN_UTF_8);
            if client_req.get_query_parameter("release_channel").is_some() {
                res.set_body(EXAMPLE_BODY);
            } else {
                res.set_body("hello");
            }

            Some(Ok(res))
        }
        _ => None,
    };

    if let Some(res) = should_res_directly {
        return res;
    }

    let mut backend_req = client_req.clone_without_body();
    backend_req.set_ttl(60);
    set_fastly_trace_id(&mut backend_req, trace_id);
    let backend_res = backend_req.send(BACKEND_A)?;
    Ok(backend_res)
}

#[cfg(test)]
mod tests {
    use fastly::{http::StatusCode, Response};

    #[test]
    fn test_example() {
        let res = Response::from_status(StatusCode::OK);
        assert_eq!(res.get_status(), StatusCode::OK);
    }
}
