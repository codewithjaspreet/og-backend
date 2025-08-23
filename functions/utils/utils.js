import { initializeApp, cert } from "firebase-admin/app";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

let app;

try {
  const serviceAccount = require("../../service_account_key.json");
  app = initializeApp({
    credential: cert(serviceAccount),
  });
  console.log("✅ Firebase initialized with service account (local)");
} catch (err) {
  app = initializeApp();
  console.log("✅ Firebase initialized with default credentials (Cloud Functions)");
}

export { app };


