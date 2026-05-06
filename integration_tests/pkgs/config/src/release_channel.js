import { toNullableFromUndefinable } from 'option-t/undefinable/to_nullable';

/**
 * @type    {string|null}
 */
const RELEASE_CHANNEL = toNullableFromUndefinable(process.env['RELEASE_CHANNEL']);

const ReleaseChannel = Object.freeze({
    Production: 'production',
    Canary: 'canary',
});

const RELEASE_CHANNEL_IS_PRODUCTION = RELEASE_CHANNEL === ReleaseChannel.Production;
const RELEASE_CHANNEL_IS_CANARY = RELEASE_CHANNEL === ReleaseChannel.Canary;

export {
    // @prettier-ignore
    RELEASE_CHANNEL,
    ReleaseChannel as Channel,
    RELEASE_CHANNEL_IS_PRODUCTION as IS_PRODUCTION,
    RELEASE_CHANNEL_IS_CANARY as IS_CANARY,
    RELEASE_CHANNEL_IS_PRODUCTION,
    RELEASE_CHANNEL_IS_CANARY,
};
