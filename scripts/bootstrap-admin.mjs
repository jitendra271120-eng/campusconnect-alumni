// Usage: GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/serviceAccountKey.json npm run bootstrap-admin -- admin@example.com
// Admin SDK credentials must NEVER be committed, stored in src/, or prefixed VITE_.
import {initializeApp,applicationDefault} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore,FieldValue} from 'firebase-admin/firestore';
const email=process.argv[2];
const role=process.argv[3]==='admin'?'admin':'super_admin';
if(!email||!email.includes('@')) {console.error('Usage: npm run bootstrap-admin -- <existing-auth-user-email> [admin|super_admin]');process.exit(1)}
if(!process.env.GOOGLE_APPLICATION_CREDENTIALS){console.error('Set GOOGLE_APPLICATION_CREDENTIALS to your private Firebase service-account JSON file.');process.exit(1)}
initializeApp({credential:applicationDefault(),projectId:'universal-9b6da'});
try {
  const user=await getAuth().getUserByEmail(email);
  const userRef=getFirestore().collection('alumni_users').doc(user.uid);
  const snap=await userRef.get();
  const previous=snap.exists?snap.data():{};
  await userRef.set({uid:user.uid,name:previous.name||user.displayName||email.split('@')[0],email:user.email,role,status:'verified',updatedAt:FieldValue.serverTimestamp(),...(snap.exists?{}:{createdAt:FieldValue.serverTimestamp(),department:'Administration',program:'Staff',graduationYear:'',rollNumber:''})},{merge:true});
  console.log(`Updated ${email} (${user.uid}) to ${role}.`);
} catch(err){console.error(err.message);process.exitCode=1}
