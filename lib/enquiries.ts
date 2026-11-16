import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

/**
 * Contact-form enquiries, stored in Firestore.
 *
 * Firebase is optional: with no credentials nothing here runs and the contact
 * route falls back to email alone, exactly as it behaved before. With them,
 * the record survives an email failure — which is the point, since a lost
 * enquiry is invisible to everyone.
 *
 * Server-only. The credentials are a service account; they must never reach
 * the browser, so nothing in here may be imported from a "use client" file.
 */
const COLLECTION = "enquiries";

function credentials() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Vercel stores the key on a single line, so its newlines arrive escaped.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) return null;
  return { projectId, clientEmail, privateKey };
}

/** Whether Firebase is wired up, for the health check and for logging. */
export const firestoreConfigured = () => credentials() !== null;

let app: App | undefined;

function db() {
  const creds = credentials();
  if (!creds) return null;
  app ??= getApps()[0] ?? initializeApp({ credential: cert(creds) });
  return getFirestore(app);
}

export type Enquiry = { name: string; email: string; message: string };

/**
 * Writes one enquiry and returns its document id, or null when Firebase is
 * not configured. Deliberately stores no IP address or user agent: the
 * privacy policy promises the IP is held in memory only.
 */
export async function saveEnquiry(enquiry: Enquiry): Promise<string | null> {
  const store = db();
  if (!store) return null;

  const doc = await store.collection(COLLECTION).add({
    ...enquiry,
    source: "website-contact-form",
    createdAt: FieldValue.serverTimestamp(),
  });
  return doc.id;
}
