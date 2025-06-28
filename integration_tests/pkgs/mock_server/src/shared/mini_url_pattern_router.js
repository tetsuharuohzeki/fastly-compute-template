import { URLPattern } from 'node:url';
import { Nullable } from 'option-t/nullable/namespace';

/**
 *  @typedef    {import('node:http').IncomingMessage}   IncomingMessage
 *  @typedef    {import('node:http').ServerResponse<IncomingMessage>}    ServerResponse
 *  @typedef    {import('node:url').URLPatternResult}   URLPatternResult
 *  @typedef    {import('node:url').URL}   URL
 */

/**
 *  @callback   RequestHandler
 *  @param  {IncomingMessage} req
 *  @param  {ServerResponse} res
 *  @param  {URLPatternResult}    patternResult
 *  @param  {URL}    originalUrl
 *  @returns    {Promise<void>}
 */

/**
 *  @typedef {[pattern: URLPattern, handler: RequestHandler]} URLPatternTuple
 */

/**
 *  @typedef {[pattern: URLPatternResult, handler: RequestHandler]} MatchedResult
 */

/**
 *  @callback   TryUrlMatcher
 *  @param  {URL}    originalUrl
 *  @return  {import('option-t/nullable').Nullable<MatchedResult>}
 */

/**
 *  @param  {ReadonlyArray<[pattern: string, handler: RequestHandler]>}    patternList
 *  @returns    {TryUrlMatcher}
 */
export function buildMatcherFromURLPattern(patternList) {
    /**
     *  @type   {Array<[URLPattern, RequestHandler]>}
     */
    const compiledList = patternList.map(([pat, handler]) => {
        const pattern = new URLPattern(pat);
        return [pattern, handler];
    });

    return function match(originalUrl) {
        const result = tryMatch(originalUrl, compiledList);
        return result;
    };
}

/**
 *  @param  {TryUrlMatcher} matcher
 *  @param  {IncomingMessage} req
 *  @param  {ServerResponse} res
 *  @param  {URL}    url
 *  @returns    {Promise<boolean>}
 */
export async function tryMatchAndCallRouteHandler(matcher, req, res, url) {
    const matchedRoute = matcher(url);
    const isHandled = Nullable.mapOrAsync(matchedRoute, false, async (matched) => {
        const ok = await callMatchedRoute(matched, req, res, url);
        return ok;
    });
    return isHandled;
}

/**
 *  @param  {MatchedResult} matched
 *  @param  {IncomingMessage} req
 *  @param  {ServerResponse} res
 *  @param  {URL}    url
 *  @returns    {Promise<true>}
 */
async function callMatchedRoute(matched, req, res, url) {
    const [pattern, handler] = matched;
    await handler(req, res, pattern, url);
    return true;
}

/**
 *  @param  {URL}    url
 *  @param  {ReadonlyArray<URLPatternTuple>}    patternList
 *  @return  {import('option-t/nullable').Nullable<MatchedResult>}
 */
function tryMatch(url, patternList) {
    const urlString = url.toString();
    for (const [pattern, handler] of patternList) {
        const matched = pattern.exec(urlString);
        if (matched) {
            return [matched, handler];
        }
    }

    return null;
}
