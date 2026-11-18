import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {MailCheck, Mail, ArrowRight, ShieldCheck, RefreshCw} from 'lucide-react';
import {useAuth} from '../auth/AuthContext';
import {PageTitle, Alert} from '../components/Components';
import {firebaseError} from '../lib/helpers';

/** Firebase-hosted email verification link. No OTP fields or Cloud Functions. */
export function EmailVerification() {
  const {user, profile, emailVerified, sendVerificationLink, refreshEmailVerification} = useAuth();
  const location = useLocation();
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState(location.state?.mailError || '');
  const [sent, setSent] = useState(Boolean(location.state?.mailSent));
  const [lastSentAt, setLastSentAt] = useState(() => location.state?.mailSent ? Date.now() : 0);
  const checking = useRef(false);

  const checkStatus = useCallback(async (showMessage = false) => {
    if (!user || checking.current) return;
    checking.current = true;
    if (showMessage) setBusy('check');
    try {
      const confirmed = await refreshEmailVerification();
      if (confirmed) {
        setError('');
        setNotice('Your email address has been verified successfully!');
      } else if (showMessage) {
        setNotice('Your email is not yet verified. Open the link in your inbox, then click Check Verification Status.');
      }
    } catch (err) {
      if (showMessage) setError(firebaseError(err));
    } finally {
      checking.current = false;
      if (showMessage) setBusy('');
    }
  }, [user, refreshEmailVerification]);

  // If the email was clicked in another tab or window, recheck on return.
  useEffect(() => {
    if (emailVerified) return;
    const onFocus = () => { void checkStatus(); };
    const onVisibility = () => { if (document.visibilityState === 'visible') void checkStatus(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [emailVerified, checkStatus]);

  async function sendLink() {
    if (!user || busy || Date.now() - lastSentAt < 60_000) return;
    setBusy('send');
    setError('');
    setNotice('');
    try {
      await sendVerificationLink();
      setSent(true);
      setLastSentAt(Date.now());
      setNotice('Verification link sent! Open your inbox and click the link. Please also check Spam, Junk, and Promotions.');
    } catch (err) {
      if (err.code === 'auth/unauthorized-continue-uri' || err.code === 'auth/invalid-continue-uri') {
        setError('This website domain is not authorized in Firebase. Add it under Firebase Console → Authentication → Settings → Authorized domains.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Try again later.');
      } else {
        setError(firebaseError(err));
      }
    } finally {
      setBusy('');
    }
  }

  return <>
    <PageTitle eyebrow="ACCOUNT SECURITY" title="Email Verification" subtitle="One click from your inbox verifies your email. College approval is a separate process." />
    <section className="panel email-code-card">
      <div className="email-code-header">
        <div className="feature-icon"><MailCheck size={26}/></div>
        <div>
          <h2>{emailVerified ? 'Email verified' : 'Verify your email address'}</h2>
          <p className="muted small">Registered email: <strong>{user?.email || profile?.email}</strong></p>
        </div>
      </div>
      {emailVerified ? <>
        <div className="verify-success"><ShieldCheck size={20}/> Your email address is verified. Eligible member actions are now available.</div>
        {profile?.status !== 'verified' && <Alert type="warning">Your academic profile still awaits college verification. Email verification does not grant college approval or admin access.</Alert>}
        <Link className="btn btn-primary" to="/app">Go to Dashboard <ArrowRight size={16}/></Link>
      </> : <>
        <Alert>
          {location.state?.registration ? 'Your account has been created successfully. ' : ''}
          Firebase sends a secure one-time link to <strong>{user?.email || profile?.email}</strong>.
          Click it to verify; you do not need to type a code.
        </Alert>
        <div className="email-code-hint"><strong>Didn’t receive the message?</strong> Check <strong>Spam, Junk or Promotions</strong>. Delivery may take a few minutes. You can resend a new link below.</div>
        {notice && <Alert type="success">{notice}</Alert>}
        {error && <Alert type="error">{error}</Alert>}
        {sent && !notice && <Alert type="success">A verification email was sent. Click the link in your inbox, then return here.</Alert>}
        <div className="action-row email-link-actions">
          <button className="btn btn-primary" type="button" disabled={busy !== ''} onClick={sendLink}>
            <Mail size={17}/>{busy === 'send' ? 'Sending…' : sent ? 'Resend Verification Link' : 'Send Verification Link'}
          </button>
          <button className="btn btn-outline" type="button" disabled={busy !== ''} onClick={() => checkStatus(true)}>
            <RefreshCw size={17}/>{busy === 'check' ? 'Checking…' : 'I clicked the link — Check Status'}
          </button>
        </div>
        <p className="form-note">You can open other dashboard tabs before verification. Certain actions unlock after you confirm your email.</p>
      </>}
    </section>
  </>;
}
