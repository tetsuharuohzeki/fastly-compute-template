import { expectNotUndefined } from 'option-t/esm/Undefinable/expect';
import { mapOrForUndefinable } from 'option-t/esm/Undefinable/mapOr';

function isTrue(value) {
    const ok = value === 'true';
    return ok;
}

export const RELEASE_CHANNEL = expectNotUndefined(process.env.RELEASE_CHANNEL, 'RELEASE_CHANNEL envvar must be set');

export const UPDATE_SNAPSHOTS = mapOrForUndefinable(process.env.UPDATE_SNAPSHOTS, false, isTrue);

export const LAUNCH_INTEGRATION_TEST_FORMATION = mapOrForUndefinable(
    process.env.LAUNCH_INTEGRATION_TEST_FORMATION,
    false,
    isTrue
);
