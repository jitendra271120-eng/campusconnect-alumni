# Changes in v1.1.0

- Fixed all pending-college-account navigation redirects on alumni workspace tabs.
- Added `/app/verify-email` with a 6-digit code form, clear Spam/Junk/Promotions advice, resend cooldown, and status alerts.
- Added Firebase Functions v2 `sendAlumniEmailCode` and `confirmAlumniEmailCode`.
- Email challenges are hashed and can only be accessed through the Admin SDK. TTL: 10 minutes; at most 5 wrong attempts; resend once/minute with hourly/daily limits.
- Email confirmation updates Firestore `alumni_users.emailCodeVerifiedAt` and Firebase Auth `emailVerified` (best-effort sync).
- Member database writes require server-confirmed OTP; college verification stays separate and staff-only.
- Kept Admin/Super Admin route guards and verification workflow.
- Preserved the mobile hamburger fix and included formatted full `src/styles.css`.
- Tests: `npm test`.

**Deployment actions are required**: configure SMTP secrets, enable Blaze/functions, deploy two cloud functions, merge Firestore rules, then build/deploy frontend.
