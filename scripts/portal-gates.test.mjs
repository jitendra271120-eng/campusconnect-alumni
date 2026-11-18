import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=f=>fs.readFileSync(new URL(`../${f}`,import.meta.url),'utf8');
const app=read('src/App.jsx'),rules=read('firestore.rules'),layout=read('src/components/Components.jsx');
test('all dashboard tabs are accessible before college verification',()=>{
  for(const p of ['career','events','jobs','mentorship','community']) {
    assert.match(app,new RegExp(`<Route path="${p}" element=\\{<`));
  }
  assert.doesNotMatch(app,/<Protected verified>/);
});
test('OTP route and sidebar link are installed',()=>{
  assert.ok(app.includes('path="verify-email"'));
  assert.ok(layout.includes("'/app/verify-email'"));
});
test('member writes use server attested OTP and admin remains separate',()=>{
  assert.match(rules,/function activeEmailMember\(\)/);
  assert.match(rules,/emailCodeVerifiedAt is timestamp/);
  assert.match(rules,/function isStaff\(\)/);
  assert.match(rules,/allow update: if isSuperAdmin\(\)/);
  assert.match(rules,/match \/alumni_email_challenges\/\{id\} \{ allow read, write: if false; \}/);
});
