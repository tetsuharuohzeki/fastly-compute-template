use fastly::Request;

pub struct FastlyTraceId(String);

const ENVVAR_NAME_FASTLY_TRACE_ID: &str = "FASTLY_TRACE_ID";

/// This sorts with the local emulator value https://developer.fastly.com/learning/compute/testing/
const FASTLY_TRACE_ID_FALLBACK_VALUE: char = '0';

/// This returns the value of `FASTLY_TRACE_ID` env var.
/// https://developer.fastly.com/reference/compute/ecp-env/fastly-trace-id/
pub fn get_fastly_trace_id() -> FastlyTraceId {
    let val =
        std::env::var("FASTLY_TRACE_ID").unwrap_or(FASTLY_TRACE_ID_FALLBACK_VALUE.to_string());
    FastlyTraceId(val)
}

pub fn set_fastly_trace_id(req: &mut Request, id: FastlyTraceId) {
    let FastlyTraceId(id) = id;
    req.set_header(ENVVAR_NAME_FASTLY_TRACE_ID, id);
}
