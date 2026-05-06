// @ts-check

import { toNullableFromUndefinable } from 'option-t/undefinable/to_nullable';

/**
 * @type    {string|null}
 */
export const RELEASE_CHANNEL = toNullableFromUndefinable(process.env['RELEASE_CHANNEL']);

const RELEASE_CHANNEL_VALUE_PRODUCTION = 'production';
const RELEASE_CHANNEL_VALUE_CANARY = 'canary';

const ReleaseChannel = Object.freeze({
    Production: RELEASE_CHANNEL_VALUE_PRODUCTION,
    Canary: RELEASE_CHANNEL_VALUE_CANARY,
});

/** @type   {boolean} */
export const RELEASE_CHANNEL_IS_PRODUCTION = RELEASE_CHANNEL === RELEASE_CHANNEL_VALUE_PRODUCTION;
/** @type   {boolean} */
export const RELEASE_CHANNEL_IS_CANARY = RELEASE_CHANNEL === RELEASE_CHANNEL_VALUE_CANARY;

export function verifyReleaseChannelIsExpected() {
    switch (RELEASE_CHANNEL) {
        case RELEASE_CHANNEL_VALUE_PRODUCTION:
            break;
        case RELEASE_CHANNEL_VALUE_CANARY:
            break;
        case null:
            break;
        default:
            throw new RangeError(`process.env['RELEASE_CHANNEL'] is unknown '${RELEASE_CHANNEL}'`);
    }
}

export {
    // @prettier-ignore
    ReleaseChannel as Channel,
    RELEASE_CHANNEL_IS_PRODUCTION as IS_PRODUCTION,
    RELEASE_CHANNEL_IS_CANARY as IS_CANARY,
};
