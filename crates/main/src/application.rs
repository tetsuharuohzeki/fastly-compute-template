use fastly::{convert::ToUrl, Error, Request, Response};

const BACKEND_A: &'static str = "backend_a";

pub fn application_main(req: Request) -> Result<Response, Error> {
    match req.get_path() {
        "/fastly" => request_to_backend("https://developer.fastly.com"),
        path => {
            let url = format!("https://developer.fastly.com{}", path);
            request_to_backend(url)
        }
    }
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
