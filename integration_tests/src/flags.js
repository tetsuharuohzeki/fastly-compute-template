import { expectNotUndefined } from 'option-t/esm/Undefinable/expect';
import { unwrapOrFromUndefinable } from 'option-t/esm/Undefinable/unwrapOr';

export const RELEASE_CHANNEL = expectNotUndefined(process.env.RELEASE_CHANNEL, 'RELEASE_CHANNEL envvar must be set');

export const UPDATE_SNAPSHOTS = unwrapOrFromUndefinable(process.env.UPDATE_SNAPSHOTS, false);

export const LAUNCH_INTEGRATION_TEST_FORMATION = unwrapOrFromUndefinable(
    process.env.LAUNCH_INTEGRATION_TEST_FORMATION,
    false
);
