// ============================================================
// FIREBASE CONFIG - 157 TEAM (VERSIÓN COMPLETA)
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
  where,
  arrayUnion,
  arrayRemove
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

// ============================================================
// CONFIGURACIÓN
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyAFgkdpW3ygAmoCsFXRJFlxUGk9TD_eT58",
  authDomain: "nexus-notifications-87d42.firebaseapp.com",
  projectId: "nexus-notifications-87d42",
  storageBucket: "nexus-notifications-87d42.firebasestorage.app",
  messagingSenderId: "148473039270",
  appId: "1:148473039270:web:457cfcdfc60092e7c5e767",
  measurementId: "G-L1K27HJWR2"
};

// ============================================================
// INICIALIZACIÓN
// ============================================================
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ============================================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================================

// Registrar usuario
export async function registerUser(email, password, username) {
  try {
    if (!email || !password || !username) {
      return { success: false, error: 'Todos los campos son obligatorios' };
    }
    if (password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName: username });

    // ✅ ADMIN: nexus_ / 157developersteam
    const isAdmin = email === 'nexuuss7262@gmail.com' || email === '157developersteam@gmail.com' || email === 'admin@157team.ai' || email === 'syntaxerror@157team.ai';

    await setDoc(doc(db, "users", user.uid), {
      username: username,
      email: email,
      rank: isAdmin ? 'admin' : 'member',
      createdAt: new Date().toISOString(),
      bio: '',
      badges: isAdmin ? ['👑 Admin'] : [],
      avatar: '',
      isAdmin: isAdmin
    });

    return {
      success: true,
      user: {
        uid: user.uid,
        username: username,
        email: email,
        isAdmin: isAdmin
      }
    };
  } catch (error) {
    let msg = error.message;
    if (error.code === 'auth/email-already-in-use') msg = 'Este correo ya está registrado.';
    else if (error.code === 'auth/weak-password') msg = 'La contraseña es muy débil. Usa al menos 6 caracteres.';
    else if (error.code === 'auth/invalid-email') msg = 'Correo electrónico inválido.';
    return { success: false, error: msg };
  }
}

// Iniciar sesión
export async function loginUser(email, password) {
  try {
    if (!email || !password) {
      return { success: false, error: 'Correo y contraseña son obligatorios' };
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const docSnap = await getDoc(doc(db, "users", user.uid));
    const userData = docSnap.data();

    return {
      success: true,
      user: {
        uid: user.uid,
        username: user.displayName || userData?.username || email.split('@')[0],
        email: user.email,
        isAdmin: userData?.isAdmin || false,
        rank: userData?.rank || 'member'
      }
    };
  } catch (error) {
    let msg = error.message;
    if (error.code === 'auth/user-not-found') msg = 'No existe una cuenta con este correo.';
    else if (error.code === 'auth/wrong-password') msg = 'Contraseña incorrecta.';
    else if (error.code === 'auth/too-many-requests') msg = 'Demasiados intentos. Espera un momento.';
    return { success: false, error: msg };
  }
}

// Login con Google
export async function loginWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return await handleOAuthUser(result.user);
  } catch (error) {
    let msg = error.message;
    if (error.code === 'auth/popup-blocked') msg = 'El navegador bloqueó la ventana emergente. Permite popups.';
    else if (error.code === 'auth/popup-closed-by-user') msg = 'Cerraste la ventana de autenticación. Intenta de nuevo.';
    return { success: false, error: msg };
  }
}

// Login con GitHub
export async function loginWithGithub() {
  try {
    const provider = new GithubAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return await handleOAuthUser(result.user);
  } catch (error) {
    let msg = error.message;
    if (error.code === 'auth/popup-blocked') msg = 'El navegador bloqueó la ventana emergente. Permite popups.';
    else if (error.code === 'auth/popup-closed-by-user') msg = 'Cerraste la ventana de autenticación. Intenta de nuevo.';
    return { success: false, error: msg };
  }
}

// Manejar OAuth
async function handleOAuthUser(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const username = user.displayName || (user.email ? user.email.split('@')[0] : 'Usuario');
  const isAdmin = user.email === 'nexuuss7262@gmail.com' || user.email === '157developersteam@gmail.com' || user.email === 'admin@157team.ai';
  
  if (!snap.exists()) {
    await setDoc(ref, {
      username: username,
      email: user.email || '',
      rank: isAdmin ? 'admin' : 'member',
      createdAt: new Date().toISOString(),
      bio: '',
      badges: isAdmin ? ['👑 Admin'] : [],
      avatar: user.photoURL || '',
      isAdmin: isAdmin
    });
  }
  
  const docSnap = await getDoc(ref);
  const data = docSnap.data();
  
  return {
    success: true,
    user: {
      uid: user.uid,
      username: data?.username || username,
      displayName: user.displayName || username,
      email: user.email,
      isAdmin: data?.isAdmin || false,
      rank: data?.rank || 'member',
      photoURL: user.photoURL || data?.avatar || '',
      bio: data?.bio || '',
      badges: data?.badges || []
    }
  };
}

// Cerrar sesión
export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Restablecer contraseña
export async function resetPassword(email) {
  try {
    if (!email) return { success: false, error: 'Ingresa tu correo' };
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: "Correo enviado para restablecer contraseña." };
  } catch (error) {
    let msg = error.message;
    if (error.code === 'auth/user-not-found') msg = 'No existe una cuenta con este correo.';
    return { success: false, error: msg };
  }
}

// Escuchar cambios de autenticación
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        const userData = docSnap.data();
        callback({
          uid: user.uid,
          username: user.displayName || userData?.username,
          email: user.email,
          isAdmin: userData?.isAdmin || false,
          rank: userData?.rank || 'member',
          bio: userData?.bio || '',
          badges: userData?.badges || [],
          avatar: userData?.avatar || ''
        });
      } catch {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
}

// ============================================================
// FUNCIONES DE FIRESTORE - PERFILES
// ============================================================

// Obtener perfil de usuario
export async function getUserProfile(uid) {
  try {
    if (!uid) return { success: false, error: 'UID no proporcionado' };
    const docSnap = await getDoc(doc(db, "users", uid));
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return { success: false, error: "Usuario no encontrado" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Guardar perfil de usuario
export async function saveUserProfile(uid, data) {
  try {
    if (!uid || !data) return { success: false, error: 'Datos inválidos' };
    await updateDoc(doc(db, "users", uid), {
      ...data,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Obtener todos los usuarios
export async function getAllUsers() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: users };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Escuchar cambios en usuarios (tiempo real)
export function listenUsers(callback) {
  return onSnapshot(collection(db, "users"), (snapshot) => {
    const users = [];
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    callback(users);
  });
}

// ============================================================
// FUNCIONES DE FIRESTORE - COMENTARIOS
// ============================================================

// Obtener comentarios
export async function getComments() {
  try {
    const q = query(collection(db, "comments"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    const comments = [];
    querySnapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: comments };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Agregar comentario
export async function addComment(text, authorId, authorName) {
  try {
    if (!text || !authorId) return { success: false, error: 'Datos incompletos' };
    const newComment = {
      text: text,
      authorId: authorId,
      author: authorName || 'Anónimo',
      date: new Date().toISOString(),
      likes: [],
      dislikes: [],
      replies: []
    };
    const docRef = await addDoc(collection(db, "comments"), newComment);
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================
// ✅ ACTUALIZAR COMENTARIO (LIKE/DISLIKE + TEXTO)
// ============================================================
export async function updateComment(commentId, field, value, operation) {
  try {
    const ref = doc(db, "comments", commentId);
    
    if (operation === 'arrayUnion') {
      // ✅ Agregar like/dislike
      await updateDoc(ref, { [field]: arrayUnion(value) });
    } else if (operation === 'arrayRemove') {
      // ✅ Quitar like/dislike
      await updateDoc(ref, { [field]: arrayRemove(value) });
    } else if (operation === 'set') {
      // ✅ EDITAR TEXTO DEL COMENTARIO
      await updateDoc(ref, { [field]: value });
    } else {
      // ✅ Por defecto, actualizar campo directamente
      await updateDoc(ref, { [field]: value });
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error en updateComment:', error);
    return { success: false, error: error.message };
  }
}

// Eliminar comentario
export async function deleteComment(commentId, userId) {
  try {
    const docSnap = await getDoc(doc(db, "comments", commentId));
    if (!docSnap.exists()) return { success: false, error: "Comentario no encontrado" };
    const data = docSnap.data();
    if (data.authorId === userId || await isUserAdmin(userId)) {
      await deleteDoc(doc(db, "comments", commentId));
      return { success: true };
    }
    return { success: false, error: "No autorizado" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Escuchar comentarios en tiempo real
export function listenComments(callback) {
  const q = query(collection(db, "comments"), orderBy("date", "desc"));
  return onSnapshot(q, (snapshot) => {
    const comments = [];
    snapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() });
    });
    callback(comments);
  });
}

// ============================================================
// FUNCIONES DE FIRESTORE - PUBLICACIONES (FORO)
// ============================================================

// Obtener publicaciones
export async function getPosts() {
  try {
    const q = query(collection(db, "posts"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: posts };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Agregar publicación
export async function addPost(title, desc, image, authorId, authorName) {
  try {
    if (!title || !desc || !authorId) return { success: false, error: 'Datos incompletos' };
    const newPost = {
      title: title,
      desc: desc,
      image: image || '',
      authorId: authorId,
      author: authorName || 'Anónimo',
      date: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, "posts"), newPost);
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Eliminar publicación
export async function deletePost(postId, userId) {
  try {
    const docSnap = await getDoc(doc(db, "posts", postId));
    if (!docSnap.exists()) return { success: false, error: "Publicación no encontrada" };
    const data = docSnap.data();
    if (data.authorId === userId || await isUserAdmin(userId)) {
      await deleteDoc(doc(db, "posts", postId));
      return { success: true };
    }
    return { success: false, error: "No autorizado" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Escuchar publicaciones en tiempo real
export function listenPosts(callback) {
  const q = query(collection(db, "posts"), orderBy("date", "desc"));
  return onSnapshot(q, (snapshot) => {
    const posts = [];
    snapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    callback(posts);
  });
}

// ============================================================
// FUNCIONES DE STORAGE (Avatar)
// ============================================================

export async function uploadAvatar(uid, file) {
  try {
    if (!uid || !file) return { success: false, error: 'Datos inválidos' };
    const avatarRef = ref(storage, `avatars/${uid}`);
    await uploadBytes(avatarRef, file);
    const url = await getDownloadURL(avatarRef);
    return { success: true, url };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================
// FUNCIÓN DE ADMIN
// ============================================================

async function isUserAdmin(uid) {
  try {
    if (!uid) return false;
    const docSnap = await getDoc(doc(db, "users", uid));
    return docSnap.exists() && docSnap.data().isAdmin === true;
  } catch {
    return false;
  }
}

// ============================================================
// EXPORTAR FUNCIONES ÚTILES
// ============================================================

export { doc, updateDoc, addDoc, onSnapshot, arrayUnion, arrayRemove };

console.log('🔥 Firebase config cargado correctamente');
console.log('📦 Versión: 2.0.0 - FULL FIRESTORE');
console.log('👥 157 Developers Team');
