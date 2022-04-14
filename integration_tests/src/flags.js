import { unwrapOrFromUndefinable } from 'option-t/esm/Undefinable/unwrapOr';

export const UPDATE_SNAPSHOTS = unwrapOrFromUndefinable(process.env.UPDATE_SNAPSHOTS, false);
