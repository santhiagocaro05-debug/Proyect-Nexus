// ============================================================
// FIREBASE CONFIG — NEXUS · 157 Team
// Auth (email/password, Google, GitHub) + Firestore (users, comments, posts)
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  deleteDoc,
  orderBy,
  addDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

// ============================================================
// ⚠️ Reemplaza esto con tu propia configuración de Firebase
// (la de tu proyecto "nexus-notifications" u otro que crees)
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyAFgkdpW3ygAmoCsFXRJFlxUGk9TD_eT58",
  authDomain: "nexus-notifications-87d42.firebaseapp.com",
  projectId: "nexus-notifications-87d42",
  storageBucket: "nexus-notifications-87d42.firebasestorage.app",
  messagingSenderId: "148473039270",
  appId: "1:148473039270:web:457cfcdfc60092e7c5e767"
};

// Correos que se tratan como administradores al registrarse/entrar
const ADMIN_EMAILS = ["admin@157team.ai", "syntaxerror@157team.ai"];

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

function isAdminEmail(email) {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

// ---------- Auth: email/password ----------
export async function registerUser(email, password, username) {
  try {
    if (!email || !password || !username) return { success: false, error: "Completa todos los campos." };
    if (password.length < 6) return { success: false, error: "La contraseña debe tener al menos 6 caracteres." };

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: username });
    const admin = isAdminEmail(email);

    await setDoc(doc(db, "users", cred.user.uid), {
      username, email, rank: admin ? "admin" : "member",
      createdAt: new Date().toISOString(), bio: "", badges: admin ? ["👑 Admin"] : [],
      avatar: "", isAdmin: admin
    });

    return { success: true, user: { uid: cred.user.uid, username, email, isAdmin: admin } };
  } catch (error) {
    let msg = error.message;
    if (error.code === "auth/email-already-in-use") msg = "Este correo ya está registrado.";
    else if (error.code === "auth/weak-password") msg = "La contraseña es muy débil.";
    else if (error.code === "auth/invalid-email") msg = "Correo electrónico inválido.";
    return { success: false, error: msg };
  }
}

export async function loginUser(email, password) {
  try {
    if (!email || !password) return { success: false, error: "Correo y contraseña son obligatorios." };
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    const data = snap.data();
    return {
      success: true,
      user: {
        uid: cred.user.uid,
        username: cred.user.displayName || data?.username || email.split("@")[0],
        email: cred.user.email, isAdmin: data?.isAdmin || false, rank: data?.rank || "member"
      }
    };
  } catch (error) {
    let msg = error.message;
    if (error.code === "auth/user-not-found") msg = "No existe una cuenta con este correo.";
    else if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") msg = "Credenciales incorrectas.";
    else if (error.code === "auth/too-many-requests") msg = "Demasiados intentos. Espera un momento.";
    return { success: false, error: msg };
  }
}

async function handleOAuthUser(user) {
  const ref_ = doc(db, "users", user.uid);
  const snap = await getDoc(ref_);
  const username = user.displayName || (user.email ? user.email.split("@")[0] : "Usuario");
  const admin = isAdminEmail(user.email);

  if (!snap.exists()) {
    await setDoc(ref_, {
      username, email: user.email || "", rank: admin ? "admin" : "member",
      createdAt: new Date().toISOString(), bio: "", badges: admin ? ["👑 Admin"] : [],
      avatar: user.photoURL || "", isAdmin: admin
    });
  }
  const data = (await getDoc(ref_)).data();
  return {
    success: true,
    user: {
      uid: user.uid, username: data?.username || username, email: user.email,
      isAdmin: data?.isAdmin || false, rank: data?.rank || "member",
      photoURL: user.photoURL || data?.avatar || "", bio: data?.bio || "", badges: data?.badges || []
    }
  };
}

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    return await handleOAuthUser(result.user);
  } catch (error) {
    let msg = error.message;
    if (error.code === "auth/popup-blocked") msg = "El navegador bloqueó la ventana emergente.";
    else if (error.code === "auth/popup-closed-by-user") msg = "Cerraste la ventana de autenticación.";
    return { success: false, error: msg };
  }
}

export async function loginWithGithub() {
  try {
    const result = await signInWithPopup(auth, new GithubAuthProvider());
    return await handleOAuthUser(result.user);
  } catch (error) {
    let msg = error.message;
    if (error.code === "auth/popup-blocked") msg = "El navegador bloqueó la ventana emergente.";
    else if (error.code === "auth/popup-closed-by-user") msg = "Cerraste la ventana de autenticación.";
    return { success: false, error: msg };
  }
}

export async function logoutUser() {
  try { await signOut(auth); return { success: true }; }
  catch (error) { return { success: false, error: error.message }; }
}

export async function resetPassword(email) {
  try {
    if (!email) return { success: false, error: "Ingresa tu correo." };
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    let msg = error.message;
    if (error.code === "auth/user-not-found") msg = "No existe una cuenta con este correo.";
    return { success: false, error: msg };
  }
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) return callback(null);
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.data();
      callback({
        uid: user.uid, username: user.displayName || data?.username, email: user.email,
        isAdmin: data?.isAdmin || false, rank: data?.rank || "member",
        bio: data?.bio || "", badges: data?.badges || [], avatar: data?.avatar || ""
      });
    } catch { callback(null); }
  });
}

// ---------- Firestore: user profiles ----------
export async function getUserProfile(uid) {
  try {
    if (!uid) return { success: false, error: "UID no proporcionado" };
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? { success: true, data: snap.data() } : { success: false, error: "Usuario no encontrado" };
  } catch (error) { return { success: false, error: error.message }; }
}

export async function saveUserProfile(uid, data) {
  try {
    await updateDoc(doc(db, "users", uid), { ...data, updatedAt: new Date().toISOString() });
    return { success: true };
  } catch (error) { return { success: false, error: error.message }; }
}

export async function getAllUsers() {
  try {
    const snap = await getDocs(collection(db, "users"));
    return { success: true, data: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
  } catch (error) { return { success: false, error: error.message }; }
}

async function isUserAdmin(uid) {
  try {
    if (!uid) return false;
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() && snap.data().isAdmin === true;
  } catch { return false; }
}

// ---------- Firestore: comments ----------
export async function getComments() {
  try {
    const q = query(collection(db, "comments"), orderBy("date", "desc"));
    const snap = await getDocs(q);
    return { success: true, data: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
  } catch (error) { return { success: false, error: error.message }; }
}

export async function addComment(text, authorId, authorName) {
  try {
    const ref_ = await addDoc(collection(db, "comments"), {
      text, authorId, author: authorName || "Anónimo",
      date: new Date().toISOString(), likes: [], dislikes: [], replies: []
    });
    return { success: true, id: ref_.id };
  } catch (error) { return { success: false, error: error.message }; }
}

export async function updateComment(commentId, field, value, operation) {
  try {
    const ref_ = doc(db, "comments", commentId);
    if (operation === "arrayUnion") await updateDoc(ref_, { [field]: arrayUnion(value) });
    else if (operation === "arrayRemove") await updateDoc(ref_, { [field]: arrayRemove(value) });
    else await updateDoc(ref_, { [field]: value });
    return { success: true };
  } catch (error) { return { success: false, error: error.message }; }
}

export async function deleteComment(commentId, userId) {
  try {
    const snap = await getDoc(doc(db, "comments", commentId));
    if (!snap.exists()) return { success: false, error: "Comentario no encontrado" };
    if (snap.data().authorId === userId || await isUserAdmin(userId)) {
      await deleteDoc(doc(db, "comments", commentId));
      return { success: true };
    }
    return { success: false, error: "No autorizado" };
  } catch (error) { return { success: false, error: error.message }; }
}

// ---------- Firestore: forum posts ----------
export async function getPosts() {
  try {
    const q = query(collection(db, "posts"), orderBy("date", "desc"));
    const snap = await getDocs(q);
    return { success: true, data: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
  } catch (error) { return { success: false, error: error.message }; }
}

export async function addPost(title, desc, image, authorId, authorName) {
  try {
    const ref_ = await addDoc(collection(db, "posts"), {
      title, desc, image: image || "", authorId, author: authorName || "Anónimo",
      date: new Date().toISOString()
    });
    return { success: true, id: ref_.id };
  } catch (error) { return { success: false, error: error.message }; }
}

export async function updatePost(postId, data, userId) {
  try {
    const snap = await getDoc(doc(db, "posts", postId));
    if (!snap.exists()) return { success: false, error: "Publicación no encontrada" };
    if (snap.data().authorId === userId || await isUserAdmin(userId)) {
      await updateDoc(doc(db, "posts", postId), data);
      return { success: true };
    }
    return { success: false, error: "No autorizado" };
  } catch (error) { return { success: false, error: error.message }; }
}

export async function deletePost(postId, userId) {
  try {
    const snap = await getDoc(doc(db, "posts", postId));
    if (!snap.exists()) return { success: false, error: "Publicación no encontrada" };
    if (snap.data().authorId === userId || await isUserAdmin(userId)) {
      await deleteDoc(doc(db, "posts", postId));
      return { success: true };
    }
    return { success: false, error: "No autorizado" };
  } catch (error) { return { success: false, error: error.message }; }
}

export async function uploadAvatar(uid, file) {
  try {
    const avatarRef = ref(storage, `avatars/${uid}`);
    await uploadBytes(avatarRef, file);
    const url = await getDownloadURL(avatarRef);
    return { success: true, url };
  } catch (error) { return { success: false, error: error.message }; }
}

console.log("🔥 firebase-config.js listo — NEXUS · 157 Team");
