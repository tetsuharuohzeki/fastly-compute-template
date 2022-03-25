use fastly::http::StatusCode;
use fastly::{Error, Request, Response};

pub fn application_main(_req: Request) -> Result<Response, Error> {
    Ok(Response::from_status(StatusCode::OK))
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
