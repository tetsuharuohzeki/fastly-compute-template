use fastly::{convert::ToUrl, Error, Request, Response};

const BACKEND_A: &str = "backend_a";

const TARGET_DOMAIN: &str = "https://developer.fastly.com";

pub fn main(req: Request) -> Result<Response, Error> {
    let url: String = match req.get_path() {
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
