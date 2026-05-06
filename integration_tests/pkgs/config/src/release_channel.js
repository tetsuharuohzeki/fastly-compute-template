import { toNullableFromUndefinable } from 'option-t/undefinable/to_nullable';

/**
 * @type    {string|null}
 */
const RELEASE_CHANNEL = toNullableFromUndefinable(process.env['RELEASE_CHANNEL']);

const ReleaseChannel = Object.freeze({
    Production: 'production',
    Canary: 'canary',
});

const IS_PRODUCTION = RELEASE_CHANNEL === ReleaseChannel.Production;
const IS_CANARY = RELEASE_CHANNEL === ReleaseChannel.Canary;

export {
    // @prettier-ignore
    RELEASE_CHANNEL,
    ReleaseChannel as Channel,
    IS_PRODUCTION,
    IS_CANARY,
};
