// Read-only diagnostic for an existing Firebase Auth account.
// Usage: GOOGLE_APPLICATION_CREDENTIALS=/secure/serviceAccountKey.json npm run check:account -- user@example.com
// Do not run this command in the browser or commit service-account files.
import {initializeApp, applicationDefault} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

const email = process.argv[2];
if (!email || !email.includes('@') || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Usage: Set GOOGLE_APPLICATION_CREDENTIALS to a private Admin SDK key and run npm run check:account -- user@example.com');
  process.exit(1);
}
initializeApp({credential: applicationDefault(), projectId: 'universal-9b6da'});
try {
  const authUser = await getAuth().getUserByEmail(email.trim());
  const store = getFirestore();
  const [userDoc, profileDoc] = await Promise.all([
    store.collection('alumni_users').doc(authUser.uid).get(),
    store.collection('alumni_profiles').doc(authUser.uid).get()
  ]);
  console.log('Firebase Auth account: found');
  console.log('UID:', authUser.uid);
  console.log('alumni_users document:', userDoc.exists ? 'FOUND' : 'MISSING');
  if (userDoc.exists) {
    console.log('Role:', userDoc.get('role') || 'unset');
    console.log('College verification status:', userDoc.get('status') || 'unset');
  }
  console.log('alumni_profiles document:', profileDoc.exists ? 'FOUND' : 'MISSING');
  if (!userDoc.exists) console.log('Action: Sign in and use Complete Alumni Registration after merging/deploying the alumni Firestore rules.');
} catch (err) {
  console.error('Unable to inspect account:', err.message);
  process.exitCode = 1;
}
