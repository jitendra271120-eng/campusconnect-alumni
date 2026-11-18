import test from 'node:test';
import assert from 'node:assert/strict';
import {isConfirmedAccountSnapshot, isStaffProfile, isVerifiedProfile} from '../src/auth/session.js';

const snap = (fromCache, hasPendingWrites) => ({metadata: {fromCache, hasPendingWrites}});
test('ignores cached user document (prevents dashboard flash)', () => {
  assert.equal(isConfirmedAccountSnapshot(snap(true, false)), false);
});
test('ignores optimistic local write (prevents phantom verification)', () => {
  assert.equal(isConfirmedAccountSnapshot(snap(false, true)), false);
  assert.equal(isConfirmedAccountSnapshot(snap(true, true)), false);
});
test('allows only server-confirmed account snapshots', () => {
  assert.equal(isConfirmedAccountSnapshot(snap(false, false)), true);
});
test('pending users cannot access admin even if role is forged locally', () => {
  assert.equal(isStaffProfile({role: 'admin', status: 'pending'}), false);
  assert.equal(isStaffProfile({role: 'super_admin', status: 'verified'}), true);
  assert.equal(isVerifiedProfile({role:'alumni',status:'pending'}), false);
  assert.equal(isVerifiedProfile({role:'alumni',status:'verified'}), true);
});
