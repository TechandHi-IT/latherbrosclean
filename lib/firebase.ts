import "server-only";

const PLACEHOLDER_MARKERS = [
  "replace-me",
  "your-project-id",
  "YOUR_PRIVATE_KEY_HERE",
];

function isPlaceholder(value: string | undefined) {
  if (!value) return true;
  return PLACEHOLDER_MARKERS.some((marker) => value.includes(marker));
}

function hasAdminCredentials() {
  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  return (
    !isPlaceholder(projectId) &&
    !isPlaceholder(clientEmail) &&
    !isPlaceholder(privateKey)
  );
}

function hasWebConfig() {
  return (
    !isPlaceholder(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) &&
    !isPlaceholder(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
  );
}

function normalizePrivateKey(value: string) {
  return value.replace(/\\n/g, "\n").replace(/^["']|["']$/g, "");
}

async function saveWithAdmin(payload: Record<string, unknown>) {
  const { cert, getApps, initializeApp } = await import("firebase-admin/app");
  const { FieldValue, getFirestore } = await import("firebase-admin/firestore");

  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("UNCONFIGURED");
  }

  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: normalizePrivateKey(privateKey),
      }),
    });

  const ref = await getFirestore(app).collection("cleaningRequests").add({
    ...payload,
    createdAt: FieldValue.serverTimestamp(),
  });

  return ref.id;
}

async function saveWithClientSdk(payload: Record<string, unknown>) {
  const { getApps, initializeApp } = await import("firebase/app");
  const { addDoc, collection, getFirestore, serverTimestamp } = await import(
    "firebase/firestore"
  );

  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const app = getApps()[0] ?? initializeApp(config);
  const ref = await addDoc(collection(getFirestore(app), "cleaningRequests"), {
    ...payload,
    createdAt: serverTimestamp(),
  });

  return ref.id;
}

export async function saveCleaningRequest(payload: Record<string, unknown>) {
  if (hasAdminCredentials()) {
    return saveWithAdmin(payload);
  }

  if (hasWebConfig()) {
    return saveWithClientSdk(payload);
  }

  throw new Error("UNCONFIGURED");
}
