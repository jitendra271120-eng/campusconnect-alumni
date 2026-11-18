# CampusConnect v1.1.0 — Dashboard tabs + six-digit email OTP

See `README.md` for full deployment instructions and `CHANGES-v1.1.md` for the feature/fix summary.

**The original dashboard restriction was caused by using `alumni_users.status` (college verification) as the prerequisite for every alumni tab.** All alumni routes now render for authenticated accounts with a saved registration record.

**Email verification and college verification are separate:** email OTP unlocks eligible member writes; college staff alone may approve institutional identity. Admin/superadmin roles remain staff-only.

**To actually deliver codes**, set `ALUMNI_SMTP_CONFIG` and `ALUMNI_EMAIL_CODE_PEPPER` Firebase Function secrets and deploy `functions:alumni-otp`. The frontend code alone cannot securely email a numeric OTP.

**Shared Firestore project warning:** Merge the alumni Firestore rules into existing rules rather than replacing the entire ruleset.
