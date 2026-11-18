/** Firestore emits local cached/optimistic snapshots before server approval.
 * Never use one to decide a user's role, approval status, or account existence.
 */
export function isConfirmedAccountSnapshot(snapshot) {
  return Boolean(snapshot) && snapshot.metadata?.fromCache === false
    && snapshot.metadata?.hasPendingWrites === false;
}

export function isStaffProfile(profile) {
  return profile?.status === 'verified'
    && ['admin', 'super_admin'].includes(profile?.role);
}

export function isVerifiedProfile(profile) {
  return profile?.status === 'verified';
}

/** Firebase Authentication's verified claim proves email ownership.
 * Do not store user-writable "verified" flags in Firestore.
 */
export function canUseMemberFeatures(profile, firebaseEmailVerified) {
  return Boolean(profile && profile.status !== 'rejected' && firebaseEmailVerified);
}
