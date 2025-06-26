use fastly::Response;
use fastly::http::StatusCode;
use fastly::mime;

const GIT_COMMIT_HASH: &str = env!("GIT_HASH");
const BUILD_DATE: &str = env!("BUILD_DATE");

pub fn create_build_info_response() -> Response {
    let body = format!(
        "git revision: {GIT_COMMIT_HASH}
build date: {BUILD_DATE}"
    );

    Response::from_status(StatusCode::OK)
        .with_content_type(mime::TEXT_PLAIN_UTF_8)
        .with_body(body)
}
