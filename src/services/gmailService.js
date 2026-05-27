import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const GMAIL_API_BASE = 'https://www.googleapis.com/gmail/v1';

// Get a fresh Gmail access token using signInWithPopup
export async function getGmailAccessToken() {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
  provider.setCustomParameters({ 
    access_type: 'offline', 
    prompt: 'consent',
    login_hint: auth.currentUser?.email || ''
  });

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  return credential.accessToken;
}

// Fetch list of recent unread emails
export async function fetchUnreadEmails(accessToken, maxResults = 10) {
  const res = await fetch(
    `${GMAIL_API_BASE}/users/me/messages?labelIds=UNREAD&maxResults=${maxResults}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();
  console.log('Gmail messages response:', data);
  return data.messages || [];
}

// Fetch full content of a single email
export async function fetchEmailContent(accessToken, messageId) {
  const res = await fetch(
    `${GMAIL_API_BASE}/users/me/messages/${messageId}?format=full`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return await res.json();
}

// Extract plain text body from Gmail message
export function extractEmailBody(message) {
  const parts = message.payload?.parts || [];
  
  // Try to find plain text part
  for (const part of parts) {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }
  }
  
  // Try nested parts (some emails have parts within parts)
  for (const part of parts) {
    if (part.parts) {
      for (const subpart of part.parts) {
        if (subpart.mimeType === 'text/plain' && subpart.body?.data) {
          return atob(subpart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
      }
    }
  }

  // Fallback: try top-level body
  if (message.payload?.body?.data) {
    return atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
  }

  return '';
}

// Extract subject and sender from email headers
export function extractEmailHeaders(message) {
  const headers = message.payload?.headers || [];
  const subject = headers.find(h => h.name === 'Subject')?.value || '(No subject)';
  const from = headers.find(h => h.name === 'From')?.value || '(Unknown sender)';
  const date = headers.find(h => h.name === 'Date')?.value || '';
  return { subject, from, date };
}