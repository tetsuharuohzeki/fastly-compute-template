use fastly::convert::ToUrl;
use fastly::http::StatusCode;
use fastly::mime;
use fastly::{Error, Request, Response};

use crate::build_info::create_build_info_response;

#[cfg(not(feature = "canary"))]
const EXAMPLE_BODY: &str = "This is production channel!";
#[cfg(feature = "canary")]
const EXAMPLE_BODY: &str = "This is canary channel!";

const BACKEND_A: &str = "backend_a";

const TARGET_DOMAIN: &str = "https://developer.fastly.com";

pub fn main(req: Request) -> Result<Response, Error> {
    let req_path = req.get_path();
    if req_path == "/buildinfo" {
        let res = create_build_info_response();
        return Ok(res);
    }

    let url: String = match req_path {
        "/" => {
            let mut res =
                Response::from_status(StatusCode::OK).with_content_type(mime::TEXT_PLAIN_UTF_8);
            if req.get_query_parameter("release_channel").is_some() {
                res.set_body(EXAMPLE_BODY);
            } else {
                res.set_body("hello");
            }

            return Ok(res);
        }
        "/fastly" => TARGET_DOMAIN.to_owned(),
        path => {
            let url = format!("{}{}", TARGET_DOMAIN, path);
            url
        }
    };
    request_to_backend(url)
}

fn request_to_backend(url: impl ToUrl) -> Result<Response, Error> {
    let api_req = Request::get(url);
    let beresp = api_req.send(BACKEND_A)?;
    Ok(beresp)
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
