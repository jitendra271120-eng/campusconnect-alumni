const test=require('node:test');
const assert=require('node:assert/strict');
const {generateCode,hashCode,matchesCode,validateSendLimit,MAX_ATTEMPTS}=require('../functions/otp-utils.cjs');
test('OTP always contains exactly six digits',()=>{for(let i=0;i<100;i++)assert.match(generateCode(),/^\d{6}$/);});
test('HMAC check uses user and challenge nonce',()=>{let h=hashCode('a','000012','nonce','p'.repeat(40));assert.equal(matchesCode('a','000012','nonce','p'.repeat(40),h),true);assert.equal(matchesCode('b','000012','nonce','p'.repeat(40),h),false);assert.equal(matchesCode('a','000013','nonce','p'.repeat(40),h),false);});
test('resend enforces cooldown and hourly and daily limits',()=>{let now=Date.now();const fake={toMillis:()=>now};assert.equal(validateSendLimit({requestedAt:fake},now).error,'wait');let rec={requestedAt:{toMillis:()=>now-100000},hourStart:fake,dayStart:fake,hourly:5,daily:5};assert.equal(validateSendLimit(rec,now).error,'limited');assert.equal(validateSendLimit(null,now).hourly,1);});
test('codes are restricted to five attempts per challenge',()=>assert.equal(MAX_ATTEMPTS,5));
