use fastly::Response;
use fastly::http::StatusCode;
use fastly::mime;

const GIT_COMMIT_HASH: &str = env!("GIT_HASH");
const BUILD_DATE: &str = env!("BUILD_DATE");

#[derive(serde::Serialize)]
struct BuildInfo {
    git_revision: &'static str,
    build_date: &'static str,
}

const BUILD_INFO: BuildInfo = BuildInfo {
    git_revision: GIT_COMMIT_HASH,
    build_date: BUILD_DATE,
};

pub fn create_build_info_response() -> Response {
    // This would not be panic.
    let body = serde_json::to_string(&BUILD_INFO).unwrap();

    Response::from_status(StatusCode::OK)
        .with_content_type(mime::APPLICATION_JSON)
        .with_body(body)
}
