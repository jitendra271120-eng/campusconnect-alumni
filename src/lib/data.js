import { collection, addDoc, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
export const col = name => collection(db,name);
export const ref = (name,id) => doc(db,name,id);
export const myQuery = (name,key,value) => query(col(name),where(key,'==',value));
export const subscribe = (q,onData,onError) => onSnapshot(q,s=>onData(s.docs.map(d=>({id:d.id,...d.data()}))),onError);
export const create = (name,data) => addDoc(col(name),{...data,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
export const modify = (name,id,data) => updateDoc(ref(name,id),{...data,updatedAt:serverTimestamp()});
export const remove = (name,id) => deleteDoc(ref(name,id));
export const getOne = async (name,id) => {const snap=await getDoc(ref(name,id));return snap.exists()?{id:snap.id,...snap.data()}:null;};
export const getAll = async name => (await getDocs(col(name))).docs.map(d=>({id:d.id,...d.data()}));
export const getWhere = async (name,key,value) => (await getDocs(myQuery(name,key,value))).docs.map(d=>({id:d.id,...d.data()}));
export const saveProfile = (uid,data) => updateDoc(ref('alumni_profiles',uid), {...data,updatedAt:serverTimestamp()});
export async function verifyUser(user,approve) {
  const batch = writeBatch(db);
  batch.update(ref('alumni_users',user.id),{status:approve?'verified':'rejected',updatedAt:serverTimestamp()});
  if (user.role==='alumni' && !approve) {
    const prof = await getDoc(ref('alumni_profiles',user.id));
    if(prof.exists()) batch.update(ref('alumni_profiles',user.id),{directoryStatus:'unlisted',updatedAt:serverTimestamp()});
  }
  await batch.commit();
}
export const registrationId = (eventId,uid) => `${eventId}_${uid}`;
export const applyId = (jobId,uid) => `${jobId}_${uid}`;
export async function registerEvent(eventId,uid,name) {
  await setDoc(ref('alumni_event_registrations',registrationId(eventId,uid)),{eventId,userId:uid,displayName:name,status:'registered',createdAt:serverTimestamp()});
}
export async function applyJob(jobId,uid,name,note) {
  await setDoc(ref('alumni_job_applications',applyId(jobId,uid)),{jobId,userId:uid,displayName:name,coverNote:note.trim(),createdAt:serverTimestamp()});
}
