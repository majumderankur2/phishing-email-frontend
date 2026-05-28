import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC3fJrPl7Ud2cs3TZPS3Fd5jET4DZ_C3DM",
  authDomain: "phishguard-ai-6e7ac.firebaseapp.com",
  projectId: "phishguard-ai-6e7ac",
  storageBucket: "phishguard-ai-6e7ac.firebasestorage.app",
  messagingSenderId: "577576604257",
  appId: "1:577576604257:web:06be05c5647c514db11020"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
googleProvider.setCustomParameters({ access_type: 'offline', prompt: 'consent' });
export const db = getFirestore(app);
export const messaging = getMessaging(app);

const VAPID_KEY = 'BPQTb2bk67iV6nBpgKF8k47W7cEz_T65sAy5f-6KKX6Hrtc7KcCBAcj9vFptspcdGOXIgZmaITyi4LrJImlQoQs';

// Request permission and get FCM token
export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    console.log('FCM token:', token);
    return token;
  } catch (err) {
    console.error('FCM token error:', err);
    return null;
  }
}

// Send a local browser notification
export function sendPhishingAlert(subject, score) {
  if (Notification.permission === 'granted') {
    new Notification('⚠️ Phishing Email Detected!', {
      body: `Subject: ${subject}\nRisk Score: ${score}`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
    });
  }
}

export { onMessage };
export default app;