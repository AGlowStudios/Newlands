// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB8aXbx3ycmoPaOpUmWaF-nbOC1N_KhA7Q",
  authDomain: "aglow-multiplayer.firebaseapp.com",
  projectId: "aglow-multiplayer",
  storageBucket: "aglow-multiplayer.firebasestorage.app",
  messagingSenderId: "319568877978",
  appId: "1:319568877978:web:8b58007360701d3c7f8223",
  measurementId: "G-1HDC3NL9DV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);