// firebase-config.js
// IMPORTANTE: usamos las URLs de CDN de Firebase en vez de "firebase/app" porque
// este proyecto no usa un bundler (Vite/Webpack). Los navegadores no pueden
// resolver "firebase/app" por sí solos — necesitan una URL real o una ruta relativa.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile,
  GoogleAuthProvider, GithubAuthProvider, signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, updateDoc, collection, query,
  getDocs, deleteDoc, orderBy
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAFgkdpW3ygAmoCsFXRJFlxUGk9TD_eT58",
  authDomain: "nexus-notifications-87d42.firebaseapp.com",
  projectId: "nexus-notifications-87d42",
  storageBucket: "nexus-notifications-87d42.firebasestorage.app",
  messagingSenderId: "148473039270",
  appId: "1:148473039270:web:457cfcdfc60092e7c5e767",
  measurementId: "G-L1K27HJWR2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ===== FUNCIONES DE AUTENTICACIÓN =====

// Registrar usuario
export async function registerUser(email, password, username) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Actualizar displayName
    await updateProfile(user, { displayName: username });

    // Guardar en Firestore
    await setDoc(doc(db, "users", user.uid), {
      username: username,
      email: email,
      rank: 'member',
      createdAt: new Date().toISOString(),
      bio: '',
      badges: [],
      avatar: '',
      isAdmin: false
    });

    return { success: true, user: { uid: user.uid, username, email } };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Iniciar sesión
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Obtener datos de Firestore
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
    return { success: false, error: error.message };
  }
}

// Iniciar sesión con Google
export async function loginWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return await handleOAuthUser(result.user);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Iniciar sesión con GitHub
export async function loginWithGithub() {
  try {
    const provider = new GithubAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return await handleOAuthUser(result.user);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Crea el documento en Firestore la primera vez que alguien entra por Google/GitHub
async function handleOAuthUser(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const username = user.displayName || user.email.split('@')[0];

  if (!snap.exists()) {
    await setDoc(ref, {
      username,
      email: user.email,
      rank: 'member',
      createdAt: new Date().toISOString(),
      bio: '',
      badges: [],
      avatar: user.photoURL || '',
      isAdmin: false
    });
  }

  const data = snap.exists() ? snap.data() : null;
  return {
    success: true,
    user: {
      uid: user.uid,
      username: data?.username || username,
      email: user.email,
      isAdmin: data?.isAdmin || false,
      rank: data?.rank || 'member'
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

// Obtener usuario actual
export function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        try {
          const docSnap = await getDoc(doc(db, "users", user.uid));
          const userData = docSnap.data();
          resolve({
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
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
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

// Subir foto de perfil a Firebase Storage
export async function uploadAvatar(uid, file) {
  try {
    const avatarRef = ref(storage, `avatars/${uid}`);
    await uploadBytes(avatarRef, file);
    const url = await getDownloadURL(avatarRef);
    return { success: true, url };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ===== FUNCIONES DE FIRESTORE =====

// Guardar perfil de usuario
export async function saveUserProfile(uid, data) {
  try {
    await updateDoc(doc(db, "users", uid), {
      ...data,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Obtener perfil de usuario
export async function getUserProfile(uid) {
  try {
    const docSnap = await getDoc(doc(db, "users", uid));
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return { success: false, error: "Usuario no encontrado" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ===== FUNCIONES DE COMENTARIOS =====

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
    const newComment = {
      text: text,
      authorId: authorId,
      author: authorName,
      date: new Date().toISOString(),
      likes: [],
      dislikes: [],
      replies: []
    };
    const docRef = await setDoc(doc(collection(db, "comments")), newComment);
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Eliminar comentario (solo admin o dueño)
export async function deleteComment(commentId, userId) {
  try {
    const docSnap = await getDoc(doc(db, "comments", commentId));
    if (!docSnap.exists()) {
      return { success: false, error: "Comentario no encontrado" };
    }
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

// ===== FUNCIONES DE PUBLICACIONES (FORO) =====

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

export async function addPost(title, desc, image, authorId, authorName) {
  try {
    const newPost = {
      title,
      desc,
      image: image || '',
      authorId,
      author: authorName,
      date: new Date().toISOString()
    };
    const docRef = await setDoc(doc(collection(db, "posts")), newPost);
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deletePost(postId, userId) {
  try {
    const docSnap = await getDoc(doc(db, "posts", postId));
    if (!docSnap.exists()) {
      return { success: false, error: "Publicación no encontrada" };
    }
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

// ===== FUNCIÓN DE ADMIN =====

async function isUserAdmin(uid) {
  try {
    const docSnap = await getDoc(doc(db, "users", uid));
    if (docSnap.exists()) {
      return docSnap.data().isAdmin === true;
    }
    return false;
  } catch {
    return false;
  }
}