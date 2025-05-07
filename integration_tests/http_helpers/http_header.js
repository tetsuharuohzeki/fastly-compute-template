// Sort with https://github.com/hyperium/http

export const ACCEPT = 'accept';
export const ACCEPT_CHARSET = 'accept-charset';
export const ACCEPT_ENCODING = 'accept-encoding';
export const ACCEPT_LANGUAGE = 'accept-language';
export const ACCEPT_RANGES = 'accept-ranges';

export const ACCESS_CONTROL_ALLOW_CREDENTIALS = 'access-control-allow-credentials';
export const ACCESS_CONTROL_ALLOW_HEADERS = 'access-control-allow-headers';
export const ACCESS_CONTROL_ALLOW_METHODS = 'access-control-allow-methods';
export const ACCESS_CONTROL_ALLOW_ORIGIN = 'access-control-allow-origin';
export const ACCESS_CONTROL_EXPOSE_HEADERS = 'access-control-expose-headers';
export const ACCESS_CONTROL_MAX_AGE = 'access-control-max-age';
export const ACCESS_CONTROL_REQUEST_HEADERS = 'access-control-request-headers';
export const ACCESS_CONTROL_REQUEST_METHOD = 'access-control-request-method';

export const AGE = 'age';
export const ALLOW = 'allow';
export const ALT_SVC = 'alt-svc';
export const AUTHORIZATION = 'authorization';
export const CACHE_CONTROL = 'cache-control';
export const CONNECTION = 'connection';

export const CONTENT_DISPOSITION = 'content-disposition';
export const CONTENT_ENCODING = 'content-encoding';
export const CONTENT_LANGUAGE = 'content-language';
export const CONTENT_LENGTH = 'content-length';
export const CONTENT_LOCATION = 'content-location';
export const CONTENT_RANGE = 'content-range';
export const CONTENT_SECURITY_POLICY = 'content-security-policy';
export const CONTENT_SECURITY_POLICY_REPORT_ONLY = 'content-security-policy-report-only';
export const CONTENT_TYPE = 'content-type';

export const COOKIE = 'cookie';
export const DNT = 'dnt';
export const DATE = 'date';
export const ETAG = 'etag';
export const EXPECT = 'expect';
export const EXPIRES = 'expires';
export const FORWARDED = 'forwarded';
export const FROM = 'from';
export const HOST = 'host';

export const IF_MATCH = 'if-match';
export const IF_MODIFIED_SINCE = 'if-modified-since';
export const IF_NONE_MATCH = 'if-none-match';
export const IF_RANGE = 'if-range';
export const IF_UNMODIFIED_SINCE = 'if-unmodified-since';

export const LAST_MODIFIED = 'last-modified';
export const LINK = 'link';
export const LOCATION = 'location';
export const MAX_FORWARDS = 'max-forwards';
export const ORIGIN = 'origin';
export const PRAGMA = 'pragma';

export const PROXY_AUTHENTICATE = 'proxy-authenticate';
export const PROXY_AUTHORIZATION = 'proxy-authorization';

export const PUBLIC_KEY_PINS = 'public-key-pins';
export const PUBLIC_KEY_PINS_REPORT_ONLY = 'public-key-pins-report-only';

export const RANGE = 'range';

export const REFERER = 'referer';
export const REFERRER_POLICY = 'referrer-policy';

export const REFRESH = 'refresh';
export const RETRY_AFTER = 'retry-after';

export const SEC_WEBSOCKET_ACCEPT = 'sec-websocket-accept';
export const SEC_WEBSOCKET_EXTENSIONS = 'sec-websocket-extensions';
export const SEC_WEBSOCKET_KEY = 'sec-websocket-key';
export const SEC_WEBSOCKET_PROTOCOL = 'sec-websocket-protocol';
export const SEC_WEBSOCKET_VERSION = 'sec-websocket-version';

export const SERVER = 'server';
export const SET_COOKIE = 'set-cookie';
export const STRICT_TRANSPORT_SECURITY = 'strict-transport-security';
export const TE = 'te';

export const TRAILER = 'trailer';
export const TRANSFER_ENCODING = 'transfer-encoding';
export const USER_AGENT = 'user-agent';
export const UPGRADE = 'upgrade';
export const UPGRADE_INSECURE_REQUESTS = 'upgrade-insecure-requests';
export const VARY = 'vary';
export const VIA = 'via';
export const WARNING = 'warning';
export const WWW_AUTHENTICATE = 'www-authenticate';

export const X_CONTENT_TYPE_OPTIONS = 'x-content-type-options';
export const X_DNS_PREFETCH_CONTROL = 'x-dns-prefetch-control';
export const X_FRAME_OPTIONS = 'x-frame-options';
export const X_XSS_PROTECTION = 'x-xss-protection';

/**
 *  This is the special header to allow to check transparently
 *  whether the response is replied (generated) from the backend origin without modifying CDN application layer.
 *
 *  This header is not represent on the actual production server. You must not touch this in the CDN application.
 *
 *  If this does not set, E2E testing can treat as it's generated on the CDN application.
 */
export const X_DEBUG_BACKEND_SERVER_NAME = 'x-debug-backend-server-name';
