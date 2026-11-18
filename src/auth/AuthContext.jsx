import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, reload, getIdToken} from 'firebase/auth';
import {doc, getDocFromServer, onSnapshot, serverTimestamp, writeBatch} from 'firebase/firestore';
import {auth, db} from '../lib/firebase';
import {firebaseError} from '../lib/helpers';
import {isConfirmedAccountSnapshot, isStaffProfile, isVerifiedProfile, canUseMemberFeatures} from './session';
import {sendVerificationLink} from './emailLink';

const Context = createContext(null);
export const useAuth = () => useContext(Context);

/** College approval and Firebase email verification are independent.
 * Only server-confirmed Firestore snapshots establish role and college approval.
 */
export function AuthProvider({children}) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [firebaseEmailVerified, setFirebaseEmailVerified] = useState(false);
  const [profile, setProfile] = useState(null);
  const [checkingAccount, setCheckingAccount] = useState(true);
  const [signingUp, setSigningUp] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let stopProfile = null;
    let timeout = null;
    let generation = 0;

    const stopAuth = onAuthStateChanged(auth, user => {
      generation += 1;
      const currentGeneration = generation;
      if (stopProfile) { stopProfile(); stopProfile = null; }
      if (timeout) { clearTimeout(timeout); timeout = null; }
      setFirebaseUser(user);
      setFirebaseEmailVerified(Boolean(user?.emailVerified));
      setProfile(null);
      setError('');

      if (!user) { setCheckingAccount(false); return; }
      setCheckingAccount(true);
      const accountRef = doc(db, 'alumni_users', user.uid);

      // Network/server confirmation is required before displaying the dashboard.
      // This also prevents an indefinite spinner when Firestore is unreachable.
      timeout = setTimeout(() => {
        if (generation !== currentGeneration) return;
        setError('Unable to confirm the account with Firestore. Check your internet connection, Firebase project, and deployed security rules, then retry.');
        setCheckingAccount(false);
      }, 15000);

      stopProfile = onSnapshot(accountRef, {includeMetadataChanges: true}, snap => {
        if (generation !== currentGeneration) return;
        // Local cache and optimistic writes may later be rejected by Firestore.
        if (!isConfirmedAccountSnapshot(snap)) return;
        if (timeout) { clearTimeout(timeout); timeout = null; }
        setProfile(snap.exists() ? {id: snap.id, ...snap.data()} : null);
        setError('');
        setCheckingAccount(false);
      }, err => {
        if (generation !== currentGeneration) return;
        if (timeout) { clearTimeout(timeout); timeout = null; }
        setProfile(null);
        setError(`Cannot access the alumni account record: ${firebaseError(err)}`);
        setCheckingAccount(false);
      });
    }, err => {
      setError(firebaseError(err));
      setCheckingAccount(false);
    });

    return () => {
      generation += 1;
      if (timeout) clearTimeout(timeout);
      if (stopProfile) stopProfile();
      stopAuth();
    };
  }, []);

  async function createRecords(authUser, fields) {
    if (!authUser?.email) throw new Error('An email address is required for alumni registration.');
    const {name, role, rollNumber, program, department, graduationYear} = fields;
    const uid = authUser.uid;
    const batch = writeBatch(db);
    batch.set(doc(db, 'alumni_users', uid), {
      uid,
      name: name.trim(),
      email: authUser.email,
      role: role === 'student' ? 'student' : 'alumni',
      rollNumber: rollNumber.trim(),
      program,
      department,
      graduationYear: String(graduationYear || ''),
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    if (role !== 'student') {
      batch.set(doc(db, 'alumni_profiles', uid), {
        ownerId: uid,
        displayName: name.trim(),
        program,
        department,
        graduationYear: String(graduationYear || ''),
        headline: '', city: '', country: 'India', company: '', jobTitle: '',
        careerStatus: 'Not specified', about: '', linkedin: '', website: '',
        skills: [], mentorAvailable: false, directoryStatus: 'unlisted',
        createdAt: serverTimestamp(), updatedAt: serverTimestamp()
      });
    }
    // A batch commit resolves after Firestore server acknowledgement, not after a cache-only update.
    await batch.commit();
    const confirmed = await getDocFromServer(doc(db, 'alumni_users', uid));
    if (!confirmed.exists()) throw new Error('Registration was not saved on the server. Please retry.');
    setProfile({id: confirmed.id, ...confirmed.data()});
    setCheckingAccount(false);
    setError('');
  }

// Refresh the signed-in Firebase user after the link is opened in another tab.
// The refreshed ID token carries email_verified=true for Firestore rules.
async function refreshEmailVerification() {
  const user = auth.currentUser;
  if (!user) return false;
  await reload(user);
  await getIdToken(user, true);
  setFirebaseEmailVerified(Boolean(user.emailVerified));
  return Boolean(user.emailVerified);
}

// A mail-sending error should not delete a successfully created account.
// The member can retry via the verification page.
async function trySendVerificationLink(user) {
  if (user?.emailVerified) return {sent:false,alreadyVerified:true};
  try {
    await sendVerificationLink(user);
    return {sent:true};
  } catch (err) {
    return {sent:false,error:firebaseError(err)};
  }
}

  async function register(fields) {
    setSigningUp(true);
    let credential = null;
    try {
      credential = await createUserWithEmailAndPassword(auth, fields.email.trim(), fields.password);
      await createRecords(credential.user, fields);
      return await trySendVerificationLink(credential.user);
    } catch (err) {
      // If Auth creation succeeds but profile creation fails, do not allow a
      // temporary signed-in session to appear successfully registered.
      if (credential) {
        try { await signOut(auth); } catch { /* Preserve the original error. */ }
      }
      throw err;
    } finally {
      setSigningUp(false);
    }
  }

  async function completeRegistration(fields) {
    if (!auth.currentUser) throw new Error('Sign in before completing registration.');
    // Keep MissingAccount mounted during submission so permission errors remain visible.
    await createRecords(auth.currentUser, fields);
    return await trySendVerificationLink(auth.currentUser);
  }

  const value = useMemo(() => ({
    user: firebaseUser,
    profile,
    loading: checkingAccount || signingUp,
    error,
    register,
    completeRegistration,
    refreshEmailVerification,
    sendVerificationLink: () => sendVerificationLink(auth.currentUser),
    login: (email, password) => signInWithEmailAndPassword(auth, email.trim(), password),
    logout: () => signOut(auth),
    verified: isVerifiedProfile(profile),
    isStaff: isStaffProfile(profile),
    emailVerified: firebaseEmailVerified,
    canUseFeatures: canUseMemberFeatures(profile, firebaseEmailVerified)
  }), [firebaseUser, firebaseEmailVerified, profile, checkingAccount, signingUp, error]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
