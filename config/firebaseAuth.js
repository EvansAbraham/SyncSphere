import { getAuth } from "firebase/auth";
import { app } from "./firebaseConfig";

// Reuse the existing Firebase app instance; Auth is client SDK only.
export const auth = getAuth(app);
