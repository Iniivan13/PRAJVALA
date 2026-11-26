import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Apakah konfigurasi Firebase tersedia. Aplikasi produksi memerlukan Firebase
 * untuk autentikasi, profil, laporan, dan dukungan warga.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

export interface FirebaseClient {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

let browserClient: FirebaseClient | null = null;

/**
 * Klien Firebase untuk komponen klien. Memakai satu instance agar listener
 * auth dan koneksi Firestore tidak terduplikasi.
 */
export function createFirebaseClient(): FirebaseClient | null {
  if (!isFirebaseConfigured || typeof window === "undefined") return null;
  if (browserClient) return browserClient;

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  browserClient = {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
  };
  return browserClient;
}

export type FirebaseReadyStatus = "ready" | "offline" | "disabled";

/**
 * Memeriksa kesiapan Firebase dari sisi klien. Status "ready" berarti
 * konfigurasi lengkap dan Firestore dapat dijangkau.
 */
export async function checkFirebaseReady(): Promise<FirebaseReadyStatus> {
  const client = createFirebaseClient();
  if (!client) return "disabled";

  try {
    const { doc, getDoc } = await import("firebase/firestore");
    await getDoc(doc(client.db, "config", "status"));
    return "ready";
  } catch {
    return "offline";
  }
}
