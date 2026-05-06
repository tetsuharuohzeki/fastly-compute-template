import { toNullableFromUndefinable } from 'option-t/undefinable/to_nullable';

/**
 * @type    {string|null}
 */
const RELEASE_CHANNEL = toNullableFromUndefinable(process.env['RELEASE_CHANNEL']);

const ReleaseChannel = Object.freeze({
    Production: 'production',
    Canary: 'canary',
});

/** @type   {boolean} */
const RELEASE_CHANNEL_IS_PRODUCTION = RELEASE_CHANNEL === ReleaseChannel.Production;
/** @type   {boolean} */
const RELEASE_CHANNEL_IS_CANARY = RELEASE_CHANNEL === ReleaseChannel.Canary;

export function verifyReleaseChannelIsExpected() {
    switch (RELEASE_CHANNEL) {
        case ReleaseChannel.Production:
            break;
        case ReleaseChannel.Canary:
            break;
        case null:
            break;
        default:
            throw new RangeError(`process.env['RELEASE_CHANNEL'] is unknown '${RELEASE_CHANNEL}'`);
    }
}

export {
    // @prettier-ignore
    RELEASE_CHANNEL,
    ReleaseChannel as Channel,
    RELEASE_CHANNEL_IS_PRODUCTION as IS_PRODUCTION,
    RELEASE_CHANNEL_IS_CANARY as IS_CANARY,
    RELEASE_CHANNEL_IS_PRODUCTION,
    RELEASE_CHANNEL_IS_CANARY,
};
