import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const functions = getFunctions(app)

const functionsEmulator = (
  import.meta.env.VITE_FIREBASE_FUNCTIONS_EMULATOR as string | undefined
)?.trim()
if (functionsEmulator) {
  const [host, port] = functionsEmulator.split(':')
  const portNumber = Number(port)
  if (host && Number.isFinite(portNumber)) {
    connectFunctionsEmulator(functions, host, portNumber)
  }
}
