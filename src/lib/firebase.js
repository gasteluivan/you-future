import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: 'AIzaSyCcuzK5n1xdzDxR1A9qGq_RtBkunwEO_p4',
  authDomain: 'your-future-gni.firebaseapp.com',
  projectId: 'your-future-gni',
  storageBucket: 'your-future-gni.firebasestorage.app',
  messagingSenderId: '720339916353',
  appId: '1:720339916353:web:2bbee51cdd1a66d99858c0',
  measurementId: 'G-WMV63ZZBQ2',
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, 'us-central1');

let analyticsPromise = Promise.resolve(null);

if (typeof window !== 'undefined') {
  analyticsPromise = isSupported()
    .then((supported) => (supported ? getAnalytics(app) : null))
    .catch(() => null);
}

export { app, functions, analyticsPromise };
