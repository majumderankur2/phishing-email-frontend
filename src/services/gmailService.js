const GMAIL_API_BASE = 'https://www.googleapis.com/gmail/v1';
const CLIENT_ID = '322981810425-9be448qvt1qple2gemghj5u4m8ni9ufc.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

// Get Gmail access token using Google Identity Services
export async function getGmailAccessToken() {
  const BACKEND = "https://phishing-email-backend-7a45.onrender.com";

export async function registerTokensWithBackend(uid, refreshToken, fcmToken) {
  try {
    await fetch(`${BACKEND}/api/register-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, refresh_token: refreshToken, fcm_token: fcmToken })
    });
    console.log("Tokens registered with backend ✅");
  } catch (err) {
    console.error("Token registration error:", err);
  }
}
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error('Google Identity Services not loaded'));
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.access_token);
        }
      },
    });

    client.requestAccessToken({ prompt: 'consent' });
  });
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

  for (const part of parts) {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }
  }

  for (const part of parts) {
    if (part.parts) {
      for (const subpart of part.parts) {
        if (subpart.mimeType === 'text/plain' && subpart.body?.data) {
          return atob(subpart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
      }
    }
  }

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