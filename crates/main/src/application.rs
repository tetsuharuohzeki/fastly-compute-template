use fastly::http::StatusCode;
use fastly::mime;
use fastly::{Error, Request, Response};

use crate::build_info::create_build_info_response;

#[cfg(not(feature = "canary"))]
const EXAMPLE_BODY: &str = "This is production channel!";
#[cfg(feature = "canary")]
const EXAMPLE_BODY: &str = "This is canary channel!";

const BACKEND_A: &str = "backend_a";

pub type FastlyResult = Result<Response, Error>;

pub fn main(req: Request) -> FastlyResult {
    let req_path = req.get_path();

    let should_res_directly: Option<FastlyResult> = match req_path {
        "/buildinfo" => {
            let res = create_build_info_response();
            Some(Ok(res))
        }
        "/" => {
            let mut res =
                Response::from_status(StatusCode::OK).with_content_type(mime::TEXT_PLAIN_UTF_8);
            if req.get_query_parameter("release_channel").is_some() {
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

    let mut be_req = req.clone_without_body();
    be_req.set_ttl(60);
    let be_res = be_req.send(BACKEND_A)?;
    Ok(be_res)
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
