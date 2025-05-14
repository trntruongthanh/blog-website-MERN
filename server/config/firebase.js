import admin from "firebase-admin";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, "utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


export const firebaseAuth = admin.auth();