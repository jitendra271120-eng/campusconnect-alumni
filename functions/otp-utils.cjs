'use strict';
const crypto = require('node:crypto');
const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_PER_HOUR = 5;
const MAX_PER_DAY = 15;
const MAX_ATTEMPTS = 5;
function generateCode() { return String(crypto.randomInt(0, 1_000_000)).padStart(6,'0'); }
function hashCode(uid, code, nonce, pepper) {
  return crypto.createHmac('sha256', pepper).update(`${uid}:${nonce}:${code}`).digest('hex');
}
function matchesCode(uid, code, nonce, pepper, expected) {
  if (!/^[0-9]{6}$/.test(code) || !/^[a-f0-9]{64}$/.test(expected||'')) return false;
  const a = Buffer.from(hashCode(uid,code,nonce,pepper),'hex');
  const b = Buffer.from(expected,'hex');
  return crypto.timingSafeEqual(a,b);
}
function validateSendLimit(record, now) {
  if (!record) return {hourStart:now,dayStart:now,hourly:1,daily:1};
  if (now-(record.requestedAt?.toMillis?.()||0) < RESEND_COOLDOWN_MS) return {error:'wait'};
  const withinHour=now-(record.hourStart?.toMillis?.()||0)<60*60*1000;
  const withinDay=now-(record.dayStart?.toMillis?.()||0)<24*60*60*1000;
  const hourly=withinHour?(record.hourly||0)+1:1;
  const daily=withinDay?(record.daily||0)+1:1;
  if(hourly>MAX_PER_HOUR||daily>MAX_PER_DAY) return {error:'limited'};
  return {hourStart:withinHour?record.hourStart:now,dayStart:withinDay?record.dayStart:now,hourly,daily};
}
module.exports={OTP_TTL_MS,RESEND_COOLDOWN_MS,MAX_PER_HOUR,MAX_PER_DAY,MAX_ATTEMPTS,generateCode,hashCode,matchesCode,validateSendLimit};
