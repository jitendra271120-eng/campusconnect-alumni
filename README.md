# CampusConnect Alumni Portal — Complete Source v1.1.0

Complete React + Firebase college alumni site with public pages, alumni workspace, career tracking, admin moderation, events, jobs, mentoring, community, analytics and **six-digit email OTP verification**. Includes the fully formatted `src/styles.css` with the mobile hamburger CSS fix.

## What changed since v1.0.3

1. All authenticated alumni tabs (`/app/profile`, `/app/career`, `/app/events`, `/app/jobs`, `/app/mentorship`, `/app/community`) remain open when college verification status is `pending`.
2. Added `/app/verify-email`, linked from the sidebar, dashboard and workspace banner.
3. Email verification sends a **six-digit OTP**, not a Firebase email-verification link. Codes expire after 10 minutes, allow 5 attempts and are resend-limited (minimum 60 seconds; maximum 5/hour and 15/day per account).
4. **Check Spam, Junk and Promotions** appears next to code entry and in the confirmation message.
5. After successful OTP, the `alumni_users/{uid}.emailCodeVerifiedAt` field is set by trusted Cloud Functions, and eligible member actions unlock even while college approval is pending.
6. College academic verification (`status: pending/verified/rejected`) remains controlled by college staff, independently of email OTP. Public alumni directory listings still require college approval. Staff/admin permissions cannot be granted with an email code.
7. Firestore rules guard database writes; browser buttons are not the sole security measure. The hashed OTP is stored in `alumni_email_challenges` and is never readable from the browser.
8. Responsive mobile menu is hidden above 960px and shown at or below 960px.

## 1. Prerequisites

- Node.js 20.19+ for Vite; Cloud Functions are configured with Node.js 22.
- Firebase project **universal-9b6da** with Authentication (Email/Password) and Firestore enabled.
- Firebase CLI: `npm install -g firebase-tools`, then `firebase login`.
- **Firebase Blaze (pay-as-you-go) plan** for Cloud Functions v2; usage can incur charges.
- An email delivery service that provides SMTP credentials (e.g. SendGrid SMTP, Brevo SMTP or a properly configured college mail server). **The Firebase Web API key is not an SMTP credential.**

## 2. Start the React website

The `.env` file contains the Firebase Web configuration provided for this project. This is client-side Firebase configuration, **not a private service account**.

```bash
npm install
npm run test
npm run dev
```

Visit `http://localhost:5173`. The new verification page is `http://localhost:5173/app/verify-email` after login.

**Note:** The source is complete, but `npm install` and the actual Vite build were not possible in the authoring environment due to a blocked npm registry. Run the build and Firebase integration tests in your own environment before going live.

## 3. Configure SMTP secrets (REQUIRED before "Send Verification Code" can deliver emails)

From the project root, make sure the CLI targets the right Firebase project:

```bash
firebase login
firebase use universal-9b6da
```

Set `ALUMNI_SMTP_CONFIG` using the **interactive terminal prompt** (do not commit SMTP credentials in source files):

```bash
firebase functions:secrets:set ALUMNI_SMTP_CONFIG --project universal-9b6da
```

When prompted, paste **one-line JSON**, substituting your real SMTP settings (sample values are placeholders, not working credentials):

```json
{"host":"smtp.example.com","port":587,"user":"smtp-account@example.com","pass":"YOUR_SMTP_APP_PASSWORD","from":"College Alumni <no-reply@example.com>"}
```

`port:587` uses STARTTLS; `port:465` uses TLS-on-connect. Configure the provider's SPF/DKIM/DMARC records to reduce Spam delivery. Keep the `from` address consistent with the sender verified by your mail provider.

Generate a long random OTP secret privately:

```bash
node -e "console.log(require('node:crypto').randomBytes(40).toString('hex'))"
```

Copy that output (do **not** put it in a file under `src/`), then enter it at:

```bash
firebase functions:secrets:set ALUMNI_EMAIL_CODE_PEPPER --project universal-9b6da
```

The sending function uses both secrets securely through Firebase Secret Manager.

## 4. Deploy the two callable email functions

```bash
cd functions
npm install
cd ..
firebase deploy --only functions:alumni-otp --project universal-9b6da
```

The functions are deployed to region `asia-south1`:

- `sendAlumniEmailCode` — sends a six-digit OTP to the authenticated Firebase user's email.
- `confirmAlumniEmailCode` — checks the OTP, sets `emailCodeVerifiedAt` on the user account and syncs Firebase Auth `emailVerified`.

The Cloud Functions are **mandatory for numeric OTP**. A frontend-only React app cannot send securely verified email codes by itself. If the functions and SMTP secret are not configured, the app displays a delivery error rather than pretending an email was sent.

## 5. Merge Firestore rules BEFORE deploying

**IMPORTANT:** This Firebase project may host other apps. Never replace all current Firestore rules blindly.

1. In Firebase Console, copy and back up the current Firestore rules.
2. Merge the included `firestore.rules` `alumni_*` collection rules and helper functions into your **existing** ruleset; keep other collections and apps' rules unchanged.
3. Confirm `alumni_users` account roles remain uneditable by members, and `alumni_email_challenges` is private to Admin SDK.
4. Only then deploy the merged rules:

```bash
firebase deploy --only firestore:rules --project universal-9b6da
```

**Caution:** The included rules file is a standalone alumni rule definition; deploying it unmerged would block access to unrelated collections in the same Firestore database. The functions use Admin SDK and bypass Firestore client security rules; therefore verified email OTP timestamps can only be written by trusted backend or privileged project administrators.

## 6. Login, verify email, access dashboard

1. Register with email and college details, or sign in with an existing account.
2. You can immediately **open every alumni dashboard tab** while `status` is `pending`.
3. Select **Verify Email** in the sidebar or the blue banner.
4. Click **Send Verification Code** and look in your Inbox. If it does not arrive, check **Spam / Junk / Promotions**.
5. Enter the six digits and click **Verify Code** (valid 10 minutes, up to five incorrect attempts).
6. Eligible actions such as job submissions, event registration, career entries and community posts become available. College approval is still pending until an admin approves academic identity.
7. When approved by college administrators, the user may opt into the public alumni directory.

**Rejected college accounts** cannot use member actions even if their email was verified.

## 7. Staff / super admin

There are **no default admin passwords**. See `scripts/bootstrap-admin.mjs` to promote a trusted existing account, using an out-of-repository private service-account JSON and a secure administrator terminal. An email OTP **never** changes a member's `role` or `status` and cannot produce super admin access.

Example using PowerShell:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\secure\serviceAccountKey.json"
npm run bootstrap-admin -- admin@example.edu super_admin
```

After admin login go to `/admin` or `/admin/alumni` to review pending college academic claims.

## 8. Frontend and Firebase Hosting deployment

```bash
npm run build
firebase deploy --only hosting --project universal-9b6da
```

`firebase.json` provides SPA rewrites. For Vercel the `vercel.json` SPA fallback is included. **Do not** deploy all components in a shared Firebase project unless you have reviewed the rules, functions, and hosting configuration carefully. A Firebase Hosting deployment to an existing site can replace that site's current assets.

## 9. Route list

- Public: `/`, `/directory`, `/events`, `/jobs`, `/news`, `/mentorship`, `/community`, `/about`, `/login`, `/register`
- Alumni: `/app`, `/app/profile`, `/app/career`, `/app/events`, `/app/jobs`, `/app/mentorship`, `/app/community`, **`/app/verify-email`**
- College admin: `/admin`, `/admin/alumni`, `/admin/events`, `/admin/jobs`, `/admin/community`, `/admin/news`, `/admin/reports`

## 10. Tests

```bash
npm test
npm run check:routes
```

Test code checks local account snapshots, role guarding, OTP generation/hash/cooldown limits, navigation and Firestore rule semantics. For a production launch, additionally deploy to a test Firebase project and test the callable functions with real email delivery and the Firestore emulator, including failure, retry, rate-limit and role-abuse cases.

## Security guidance

- Treat email verification as **proof of email control**, not proof of degree, batch or college membership. Admin approval is still necessary for verified alumnus status.
- Do not store OTP codes, SMTP password, private Firebase service-account JSON or random pepper in browser variables, localStorage or Git.
- Per-account rate limiting is implemented; for a public high-traffic portal, also enable Firebase App Check and add abuse monitoring/alerts.
- No browser feature can hide a Google Password Manager compromised-password warning; change any exposed passwords.
- These modules provide a starting implementation, not a production security audit. Validate permissions, privacy, accessibility, indexes, billing, and operational behavior before real college use.

Firebase official references: https://firebase.google.com/docs/functions/callable and https://firebase.google.com/docs/functions/config-env#secret-manager
