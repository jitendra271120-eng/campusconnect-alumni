import {sendEmailVerification} from 'firebase/auth';
import {auth} from '../lib/firebase';

// Firebase Authentication sends the email. No SMTP, Cloud Functions, or custom tokens.
// The default Firebase-hosted action handler verifies ownership of the email.
export async function sendVerificationLink(user = auth.currentUser) {
  if (!user) throw new Error('Please log in to request a verification email.');
  if (user.emailVerified) return {alreadyVerified:true};

  const destination = `${window.location.origin}/app/verify-email`;
  await sendEmailVerification(user, {
    url: destination,
    handleCodeInApp: false,
  });
  return {sent:true};
}
