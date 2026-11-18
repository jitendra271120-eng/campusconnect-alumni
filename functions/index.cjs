'use strict';
/**
 * Cloud Functions v2. Never put SMTP credentials or OTP hashes in Vite or client-side files.
 * These functions use Firebase Auth for identity and Firebase Admin SDK for private data.
 */
const crypto = require('node:crypto');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const {onCall,HttpsError} = require('firebase-functions/v2/https');
const {defineSecret} = require('firebase-functions/params');
const {logger} = require('firebase-functions');
const {OTP_TTL_MS,MAX_ATTEMPTS,generateCode,hashCode,matchesCode,validateSendLimit} = require('./otp-utils.cjs');
admin.initializeApp();
const db = admin.firestore();
const FieldValue=admin.firestore.FieldValue;
const Timestamp=admin.firestore.Timestamp;
const smtpSecret=defineSecret('ALUMNI_SMTP_CONFIG');
const pepperSecret=defineSecret('ALUMNI_EMAIL_CODE_PEPPER');
const opts={region:'asia-south1',secrets:[smtpSecret,pepperSecret],timeoutSeconds:45,maxInstances:10};

async function member(request) {
  if(!request.auth?.uid) throw new HttpsError('unauthenticated','Please log in to continue.');
  const uid=request.auth.uid;
  const [user,account]=await Promise.all([admin.auth().getUser(uid),db.doc(`alumni_users/${uid}`).get()]);
  if(!account.exists) throw new HttpsError('failed-precondition','Complete your alumni registration first.');
  if(!user.email || user.email.toLowerCase() !== String(account.data().email||'').toLowerCase())
    throw new HttpsError('failed-precondition','Account email mismatch. Please contact the administrator.');
  if(account.data().status==='rejected') throw new HttpsError('permission-denied','This account was rejected by the college.');
  return {uid,email:user.email,account:account.data(),accountRef:account.ref};
}
function emailSettings() {
  let config;
  try {config=JSON.parse(smtpSecret.value());} catch {throw new HttpsError('failed-precondition','SMTP is not configured. Ask your administrator to configure the email service.');}
  if(!config.host||!config.user||!config.pass||!config.from||!config.port)
    throw new HttpsError('failed-precondition','SMTP settings are incomplete.');
  return config;
}
exports.sendAlumniEmailCode=onCall(opts,async(request)=>{
  const {uid,email,account}=await member(request);
  if(account.emailCodeVerifiedAt) return {alreadyVerified:true};
  const config=emailSettings();
  const pepper=pepperSecret.value();
  if(!pepper||pepper.length<32) throw new HttpsError('failed-precondition','Email verification secret is not configured.');
  const now=Date.now(),code=generateCode(),nonce=crypto.randomBytes(16).toString('hex');
  const token=crypto.randomUUID();
  const ref=db.doc(`alumni_email_challenges/${uid}`);
  const result=await db.runTransaction(async(tx)=>{
    const snap=await tx.get(ref);
    const limits=validateSendLimit(snap.exists?snap.data():null,now);
    if(limits.error) return limits;
    const ts=v=>typeof v==='number'?Timestamp.fromMillis(v):v;
    tx.set(ref,{hash:hashCode(uid,code,nonce,pepper),nonce,attempts:0,token,
      status:'sending',requestedAt:ts(now),expiresAt:ts(now+OTP_TTL_MS),
      hourStart:ts(limits.hourStart),dayStart:ts(limits.dayStart),
      hourly:limits.hourly,daily:limits.daily});
    return {success:true};
  });
  if(result.error==='wait') throw new HttpsError('resource-exhausted','Please wait at least 60 seconds before requesting another code.');
  if(result.error==='limited') throw new HttpsError('resource-exhausted','Too many codes requested. Please try later.');
  const transport=nodemailer.createTransport({host:config.host,port:Number(config.port),
    secure:Number(config.port)===465,requireTLS:Number(config.port)!==465,
    auth:{user:config.user,pass:config.pass}});
  try {
    await transport.sendMail({from:config.from,to:email,subject:'CampusConnect — Your email verification code',
      text:`Your CampusConnect verification code is ${code}. It expires in 10 minutes. If you did not request this email, you can ignore it. Check your Spam or Junk folder if you cannot find the message.`,
      html:`<div style="font:16px Arial,sans-serif;max-width:520px;margin:auto"><h2>CampusConnect Alumni Network</h2><p>Enter the following code in your alumni dashboard:</p><p style="font-size:32px;font-weight:bold;letter-spacing:8px">${code}</p><p>This code expires in <strong>10 minutes</strong>.</p><p>If the email is missing, check your <strong>Spam/Junk</strong> folder.</p><p>If you did not request it, ignore this message.</p></div>`});
    await db.runTransaction(async tx=>{
      const current=await tx.get(ref);
      if(current.exists && current.data().token===token) tx.update(ref,{status:'sent'});
    });
    return {sent:true,expiresInSeconds:600};
  } catch(e) {
    // Clear the unusable challenge; the private details stay in server logs, never the browser.
    await db.runTransaction(async tx=>{
      const current=await tx.get(ref);
      if(current.exists&&current.data().token===token) tx.delete(ref);
    });
    logger.error('Email verification delivery failed', {code:e.code||'smtp-error'});
    throw new HttpsError('unavailable','The verification email could not be sent. Please contact the administrator or try again later.');
  } finally {transport.close();}
});

exports.confirmAlumniEmailCode=onCall(opts,async(request)=>{
  const {uid,account,accountRef}=await member(request);
  if(account.emailCodeVerifiedAt) return {verified:true,alreadyVerified:true};
  const code=String(request.data?.code||'').trim();
  if(!/^[0-9]{6}$/.test(code)) throw new HttpsError('invalid-argument','Enter the six-digit code from your email.');
  const pepper=pepperSecret.value();
  const ref=db.doc(`alumni_email_challenges/${uid}`);
  const now=Date.now();
  const result=await db.runTransaction(async tx=>{
    const snap=await tx.get(ref);
    if(!snap.exists) return 'missing';
    const item=snap.data();
    if(item.status!=='sent') return 'not-ready';
    if((item.expiresAt?.toMillis?.()||0)<=now) {tx.delete(ref);return 'expired';}
    if(item.attempts>=MAX_ATTEMPTS) return 'locked';
    if(!matchesCode(uid,code,item.nonce,pepper,item.hash)) {
      tx.update(ref,{attempts:FieldValue.increment(1)});
      return item.attempts+1>=MAX_ATTEMPTS?'locked':'incorrect';
    }
    tx.update(accountRef,{emailCodeVerifiedAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});
    tx.delete(ref);
    return 'verified';
  });
  if(result!=='verified') {
    const messages={missing:'Request a new verification code.', 'not-ready':'Email is still being sent. Retry shortly.',
      expired:'This code expired. Request a new one.',locked:'Too many incorrect attempts. Request a new code.',incorrect:'Incorrect code. Please try again.'};
    throw new HttpsError(result==='incorrect'?'invalid-argument':'failed-precondition',messages[result]||'Email verification failed.');
  }
  // Also update the Firebase Auth email flag for other Firebase integrations.
  // Firestore remains the authorization source for alumni member features.
  try {await admin.auth().updateUser(uid,{emailVerified:true});}
  catch(err){logger.warn('Auth emailVerified sync failed; Firestore verification succeeded',{code:err.code||'unknown'});}
  return {verified:true};
});
