import {httpsCallable} from 'firebase/functions';
import {functions} from '../lib/firebase';
export const requestEmailCode = () => httpsCallable(functions,'sendAlumniEmailCode')({});
export const confirmEmailCode = code => httpsCallable(functions,'confirmAlumniEmailCode')({code});
