// ============================================================
// FIREBASE CONFIG - 157 TEAM (VERSIÓN COMPLETA + CORREGIDA + DEVELOPER)
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
  limit,
  increment,
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
// LISTA DE CORREOS ADMIN (centralizada)
// ============================================================
const ADMIN_EMAILS = [
  'nexuuss7262@gmail.com',
  '157developersteam@gmail.com',
  'admin@157team.ai',
  'syntaxerror@157team.ai'
];

// ============================================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================================

// Registrar usuario (VERSIÓN CORREGIDA)
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

    // ✅ Verificar si es admin
    const isAdmin = ADMIN_EMAILS.includes(email);

    // ✅ Crear documento con MANEJO DE ERRORES
    try {
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        rank: isAdmin ? 'admin' : 'member',
        createdAt: new Date().toISOString(),
        bio: '',
        badges: isAdmin ? ['👑 Admin'] : [],
        avatar: '',
        isAdmin: isAdmin,
        updatedAt: new Date().toISOString()
      });
    } catch (docError) {
      console.error('Error al crear documento de usuario:', docError);
      // Reintentar una vez
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await setDoc(doc(db, "users", user.uid), {
          username: username,
          email: email,
          rank: isAdmin ? 'admin' : 'member',
          createdAt: new Date().toISOString(),
          bio: '',
          badges: isAdmin ? ['👑 Admin'] : [],
          avatar: '',
          isAdmin: isAdmin,
          updatedAt: new Date().toISOString()
        });
      } catch (retryError) {
        console.error('Error en reintento:', retryError);
        // El usuario está creado en auth, pero el documento falló
        return {
          success: true,
          user: {
            uid: user.uid,
            username: username,
            email: email,
            isAdmin: isAdmin,
            isDeveloper: false   // 👈 AGREGAR (por consistencia)
          },
          warning: 'Cuenta creada pero el perfil no se guardó correctamente. Intenta actualizar tu perfil.'
        };
      }
    }

    return {
      success: true,
      user: {
        uid: user.uid,
        username: username,
        email: email,
        isAdmin: isAdmin,
        isDeveloper: false   // 👈 AGREGAR (por consistencia)
      }
    };
  } catch (error) {
    let msg = error.message;
    if (error.code === 'auth/email-already-in-use') msg = 'Este correo ya está registrado.';
    else if (error.code === 'auth/weak-password') msg = 'La contraseña es muy débil. Usa al menos 6 caracteres.';
    else if (error.code === 'auth/invalid-email') msg = 'Correo electrónico inválido.';
    else if (error.code === 'auth/network-request-failed') msg = 'Error de red. Verifica tu conexión.';
    return { success: false, error: msg };
  }
}

// Iniciar sesión (VERSIÓN CORREGIDA)
export async function loginUser(email, password) {
  try {
    if (!email || !password) {
      return { success: false, error: 'Correo y contraseña son obligatorios' };
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    let userData = {};
    try {
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        userData = docSnap.data();
      } else {
        // Si no existe documento, crearlo (fallback)
        const isAdmin = ADMIN_EMAILS.includes(email);
        await setDoc(doc(db, "users", user.uid), {
          username: user.displayName || email.split('@')[0],
          email: email,
          rank: isAdmin ? 'admin' : 'member',
          createdAt: new Date().toISOString(),
          bio: '',
          badges: isAdmin ? ['👑 Admin'] : [],
          avatar: '',
          isAdmin: isAdmin,
          updatedAt: new Date().toISOString()
        });
        userData = {
          username: user.displayName || email.split('@')[0],
          isAdmin: isAdmin,
          rank: isAdmin ? 'admin' : 'member'
        };
      }
    } catch (e) {
      console.warn('Error al obtener/crear documento de usuario:', e);
      // Fallback con datos del auth
      userData = {
        username: user.displayName || email.split('@')[0],
        isAdmin: ADMIN_EMAILS.includes(email),
        rank: ADMIN_EMAILS.includes(email) ? 'admin' : 'member'
      };
    }

    return {
      success: true,
      user: {
        uid: user.uid,
        username: user.displayName || userData?.username || email.split('@')[0],
        email: user.email,
        isAdmin: userData?.isAdmin === true,
        isDeveloper: userData?.isDeveloper === true, 
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

// Manejar OAuth (VERSIÓN CORREGIDA)
async function handleOAuthUser(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const username = user.displayName || (user.email ? user.email.split('@')[0] : 'Usuario');
  const isAdmin = ADMIN_EMAILS.includes(user.email);
  
  if (!snap.exists()) {
    try {
      await setDoc(ref, {
        username: username,
        email: user.email || '',
        rank: isAdmin ? 'admin' : 'member',
        createdAt: new Date().toISOString(),
        bio: '',
        badges: isAdmin ? ['👑 Admin'] : [],
        avatar: user.photoURL || '',
        isAdmin: isAdmin,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error('Error al crear documento OAuth:', e);
    }
  }
  
  try {
    const docSnap = await getDoc(ref);
    const data = docSnap.data() || {};
    return {
      success: true,
      user: {
        uid: user.uid,
        username: data?.username || username,
        displayName: user.displayName || username,
        email: user.email,
        isAdmin: data?.isAdmin === true,
        isDeveloper: data?.isDeveloper === true,   // 👈 AGREGAR
        rank: data?.rank || 'member',
        photoURL: user.photoURL || data?.avatar || '',
        bio: data?.bio || '',
        badges: data?.badges || []
      }
    };
  } catch (e) {
    return {
      success: true,
      user: {
        uid: user.uid,
        username: username,
        displayName: user.displayName || username,
        email: user.email,
        isAdmin: isAdmin,
        isDeveloper: false,   // 👈 AGREGAR (fallback)
        rank: isAdmin ? 'admin' : 'member',
        photoURL: user.photoURL || '',
        bio: '',
        badges: isAdmin ? ['👑 Admin'] : []
      }
    };
  }
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

// Escuchar cambios de autenticación (VERSIÓN CORREGIDA)
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        const userData = docSnap.exists() ? docSnap.data() : {};
        callback({
          uid: user.uid,
          username: user.displayName || userData?.username || user.email?.split('@')[0] || 'Usuario',
          email: user.email,
          isAdmin: userData?.isAdmin === true,
          isDeveloper: userData?.isDeveloper === true,   // 👈 AGREGAR
          rank: userData?.rank || 'member',
          bio: userData?.bio || '',
          badges: userData?.badges || [],
          avatar: userData?.avatar || ''
        });
      } catch {
        // Fallback si no se puede leer Firestore
        callback({
          uid: user.uid,
          username: user.displayName || user.email?.split('@')[0] || 'Usuario',
          email: user.email,
          isAdmin: ADMIN_EMAILS.includes(user.email),
          isDeveloper: false,   // 👈 AGREGAR (fallback)
          rank: ADMIN_EMAILS.includes(user.email) ? 'admin' : 'member',
          bio: '',
          badges: ADMIN_EMAILS.includes(user.email) ? ['👑 Admin'] : [],
          avatar: ''
        });
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

// Guardar perfil de usuario (VERSIÓN CORREGIDA)
export async function saveUserProfile(uid, data) {
  try {
    if (!uid || !data) return { success: false, error: 'Datos inválidos' };
    
    // ✅ NUNCA permitir que un usuario normal cambie isAdmin
    // Esto lo maneja Firestore, pero lo reforzamos aquí
    if (data.isAdmin !== undefined) {
      const currentUser = auth.currentUser;
      if (!currentUser || currentUser.uid !== uid) {
        return { success: false, error: 'No autorizado para cambiar isAdmin' };
      }
      // Verificar si el usuario actual es admin
      const userDoc = await getDoc(doc(db, "users", uid));
      if (!userDoc.exists() || userDoc.data().isAdmin !== true) {
        // No es admin, eliminar isAdmin de la actualización
        delete data.isAdmin;
      }
    }
    
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
export async function addComment(text, authorId, authorName, authorNexusPlus = false) {
  try {
    if (!text || !authorId) return { success: false, error: 'Datos incompletos' };
    const newComment = {
      text: text,
      authorId: authorId,
      author: authorName || 'Anónimo',
      authorNexusPlus: authorNexusPlus,
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
      await updateDoc(ref, { [field]: arrayUnion(value) });
    } else if (operation === 'arrayRemove') {
      await updateDoc(ref, { [field]: arrayRemove(value) });
    } else if (operation === 'set') {
      await updateDoc(ref, { [field]: value });
    } else {
      await updateDoc(ref, { [field]: value });
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error en updateComment:', error);
    return { success: false, error: error.message };
  }
}

// Eliminar comentario (VERSIÓN CORREGIDA)
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
// FUNCIONES DE FIRESTORE - PUBLICACIONES (FORO) Y COMENTARIOS DEL FORO
// ============================================================

export async function addPostComment(postId, text, userId, username, avatar) {
  try {
    const commentData = {
      postId,
      userId,
      username: username || 'Anónimo',
      avatar: avatar || '',
      text: text.substring(0, 500),
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, "post_comments"), commentData);
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function editPostComment(commentId, text, userId) {
  try {
    const docSnap = await getDoc(doc(db, "post_comments", commentId));
    if (!docSnap.exists()) return { success: false, error: "Comentario no encontrado" };
    if (docSnap.data().userId !== userId && !(await isUserAdmin(userId))) {
      return { success: false, error: "No autorizado" };
    }
    await updateDoc(doc(db, "post_comments", commentId), {
      text: text.substring(0, 500),
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deletePostComment(commentId, userId) {
  try {
    const docSnap = await getDoc(doc(db, "post_comments", commentId));
    if (!docSnap.exists()) return { success: false, error: "Comentario no encontrado" };
    if (docSnap.data().userId !== userId && !(await isUserAdmin(userId))) {
      return { success: false, error: "No autorizado" };
    }
    await deleteDoc(doc(db, "post_comments", commentId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function listenPostComments(postId, callback) {
  const q = query(
    collection(db, "post_comments"),
    where("postId", "==", postId)
  );
  return onSnapshot(q, (snapshot) => {
    const comments = [];
    snapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() });
    });
    comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    callback(comments);
  });
}

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
// FUNCIÓN DE ADMIN (VERSIÓN CORREGIDA Y MEJORADA)
// ============================================================

export async function isUserAdmin(uid) {
  try {
    if (!uid) return false;
    
    // Primero verificar en Firestore
    try {
      const docSnap = await getDoc(doc(db, "users", uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.isAdmin === true || data.admin === true;
      }
    } catch (e) {
      console.warn('Error al verificar admin en Firestore:', e);
    }
    
    // Fallback: verificar en lista de correos del auth
    try {
      const user = auth.currentUser;
      if (user && user.email) {
        return ADMIN_EMAILS.includes(user.email);
      }
    } catch (e) {
      console.warn('Error al verificar admin por email:', e);
    }
    
    return false;
  } catch (error) {
    console.error('Error en isUserAdmin:', error);
    return false;
  }
}

// ============================================================
// NUEVO: CHEQUEO DE ROL: DEVELOPER
// ============================================================
export async function isUserDeveloper(uid) {
  try {
    if (!uid) return false;
    const docSnap = await getDoc(doc(db, "users", uid));
    if (docSnap.exists()) {
      return docSnap.data().isDeveloper === true;
    }
    return false;
  } catch (error) {
    console.error('Error en isUserDeveloper:', error);
    return false;
  }
}

// Verifica si un usuario puede crear/editar/borrar un producto puntual.
// existingAuthorId = undefined -> se está creando uno nuevo (solo importa el rol)
// existingAuthorId = string    -> se está editando/borrando (debe ser el dueño, salvo admin)
async function canManageProduct(userId, existingAuthorId) {
  if (await isUserAdmin(userId)) return true;
  const isDev = await isUserDeveloper(userId);
  if (!isDev) return false;
  if (existingAuthorId === undefined) return true;
  return existingAuthorId === userId;
}

// ============================================================
// FUNCIONES DE FIRESTORE - PRODUCTOS (ACTUALIZADAS)
// ============================================================

export async function getProducts() {
  try {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const products = [];
    querySnapshot.forEach((doc) => products.push({ id: doc.id, ...doc.data() }));
    return { success: true, data: products };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// NUEVA VERSIÓN: incluye authorId y validación con canManageProduct
export async function addProduct(productData, userId) {
  try {
    if (!(await canManageProduct(userId, undefined))) {
      return { success: false, error: "No autorizado" };
    }
    const newProduct = {
      ...productData,
      authorId: userId,               // 👈 clave para poder filtrar "mis productos" luego
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, "products"), newProduct);
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// NUEVA VERSIÓN: valida propiedad y evita que un developer no-admin robe el producto
export async function updateProduct(productId, data, userId) {
  try {
    const prodSnap = await getDoc(doc(db, "products", productId));
    if (!prodSnap.exists()) return { success: false, error: "Producto no encontrado" };
    const existingAuthorId = prodSnap.data().authorId;

    if (!(await canManageProduct(userId, existingAuthorId))) {
      return { success: false, error: "No autorizado" };
    }
    // Un developer no-admin no puede robarse el producto cambiando el authorId
    const safeData = { ...data };
    if (!(await isUserAdmin(userId))) delete safeData.authorId;

    await updateDoc(doc(db, "products", productId), safeData);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// NUEVA VERSIÓN: valida propiedad y rol
export async function deleteProduct(productId, userId) {
  try {
    const prodSnap = await getDoc(doc(db, "products", productId));
    if (!prodSnap.exists()) return { success: false, error: "Producto no encontrado" };
    const existingAuthorId = prodSnap.data().authorId;

    if (!(await canManageProduct(userId, existingAuthorId))) {
      return { success: false, error: "No autorizado" };
    }
    await deleteDoc(doc(db, "products", productId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Guardar el orden de los productos (sin cambios)
export async function saveProductOrder(orderArray, userId) {
  try {
    if (!(await isUserAdmin(userId))) return { success: false, error: "No autorizado" };
    await setDoc(doc(db, "settings", "productOrder"), {
      order: orderArray,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Obtener el orden guardado
export async function getProductOrder() {
  try {
    const docSnap = await getDoc(doc(db, "settings", "productOrder"));
    if (docSnap.exists()) return { success: true, order: docSnap.data().order || [] };
    return { success: true, order: [] };
  } catch (error) {
    return { success: false, error: error.message, order: [] };
  }
}

// ============================================================
// FUNCIONES DE FIRESTORE - RESEÑAS Y NOTIFICACIONES
// ============================================================

export async function addProductReview(productId, rating, text, userId, username, avatar) {
  try {
    if (!productId || !userId) return { success: false, error: 'Datos incompletos' };
    const reviewData = {
      productId,
      userId,
      username: username || 'Anónimo',
      avatar: avatar || '',
      rating: Number(rating),
      text: text.substring(0, 200),
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, "product_reviews"), reviewData);
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function editProductReview(reviewId, rating, text, userId) {
  try {
    const docSnap = await getDoc(doc(db, "product_reviews", reviewId));
    if (!docSnap.exists()) return { success: false, error: "Reseña no encontrada" };
    if (docSnap.data().userId !== userId && !(await isUserAdmin(userId))) {
      return { success: false, error: "No autorizado" };
    }
    await updateDoc(doc(db, "product_reviews", reviewId), {
      rating: Number(rating),
      text: text.substring(0, 200),
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteProductReview(reviewId, userId) {
  try {
    const docSnap = await getDoc(doc(db, "product_reviews", reviewId));
    if (!docSnap.exists()) return { success: false, error: "Reseña no encontrada" };
    if (docSnap.data().userId !== userId && !(await isUserAdmin(userId))) {
      return { success: false, error: "No autorizado" };
    }
    await deleteDoc(doc(db, "product_reviews", reviewId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function listenProductReviews(productId, callback) {
  const q = query(
    collection(db, "product_reviews"),
    where("productId", "==", productId)
  );
  return onSnapshot(q, (snapshot) => {
    const reviews = [];
    snapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });
    callback(reviews);
  });
}

export async function addActivityNotification(userId, username, actionType, productName, productId) {
  try {
    const notifData = {
      userId: userId || 'anon',
      username: username || 'Anónimo',
      actionType, // 'buy', 'download', 'review'
      productName,
      productId,
      timestamp: new Date().getTime()
    };
    await addDoc(collection(db, "activity_notifications"), notifData);
    return { success: true };
  } catch (error) {
    console.error("Error agregando notificación:", error);
    return { success: false };
  }
}

export function listenActivityNotifications(callback) {
  const initTime = new Date().getTime();
  const q = query(collection(db, "activity_notifications"), orderBy("timestamp", "desc"), limit(1));
  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const notif = { id: change.doc.id, ...change.doc.data() };
        if (notif.timestamp > initTime || new Date().getTime() - notif.timestamp < 300000) {
          callback(notif);
        }
      }
    });
  });
}

export async function incrementDownloadCount(productId) {
  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, {
      realDownloads: increment(1)
    });
    return { success: true };
  } catch (error) {
    console.error("Error incrementando descargas:", error);
    return { success: false };
  }
}

// ============================================================
// NUEVO: SOLICITUDES DE DEVELOPER
// ============================================================

// El usuario pide ser developer
export async function requestDeveloperStatus(uid, username, email, reason, portfolioLink) {
  try {
    if (!uid || !reason || reason.trim().length < 10) {
      return { success: false, error: "Escribe una razón un poco más detallada (mín. 10 caracteres)" };
    }

    // Evitar solicitudes duplicadas: si ya tiene una pending, no dejar crear otra
    const existingQ = query(
      collection(db, "developerRequests"),
      where("userId", "==", uid),
      where("status", "==", "pending")
    );
    const existingSnap = await getDocs(existingQ);
    if (!existingSnap.empty) {
      return { success: false, error: "Ya tienes una solicitud pendiente" };
    }

    const docRef = await addDoc(collection(db, "developerRequests"), {
      userId: uid,
      username: username || 'Usuario',
      email: email || '',
      reason: reason.trim().substring(0, 500),
      portfolioLink: (portfolioLink || '').trim().substring(0, 300),
      status: "pending",
      createdAt: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Saber si el usuario actual ya tiene una solicitud pendiente (para no mostrarle
// el botón de nuevo mientras espera respuesta)
export async function getMyDeveloperRequestStatus(uid) {
  try {
    const q = query(collection(db, "developerRequests"), where("userId", "==", uid));
    const snap = await getDocs(q);
    if (snap.empty) return { success: true, status: null };
    // Tomamos la más reciente
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { success: true, status: docs[0].status, requestId: docs[0].id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ADMIN: obtener todas las solicitudes pendientes (una sola vez)
export async function getDeveloperRequests() {
  try {
    const q = query(collection(db, "developerRequests"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const requests = [];
    snap.forEach((d) => requests.push({ id: d.id, ...d.data() }));
    return { success: true, data: requests };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ADMIN: escuchar solicitudes en tiempo real (para el badge de notificación en el panel)
export function listenDeveloperRequests(callback) {
  const q = query(collection(db, "developerRequests"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const requests = [];
    snapshot.forEach((d) => requests.push({ id: d.id, ...d.data() }));
    callback(requests);
  });
}

// ADMIN: aprobar o rechazar una solicitud
export async function reviewDeveloperRequest(requestId, approve, adminUid) {
  try {
    if (!(await isUserAdmin(adminUid))) return { success: false, error: "No autorizado" };

    const reqSnap = await getDoc(doc(db, "developerRequests", requestId));
    if (!reqSnap.exists()) return { success: false, error: "Solicitud no encontrada" };
    const data = reqSnap.data();

    await updateDoc(doc(db, "developerRequests", requestId), {
      status: approve ? "approved" : "rejected",
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminUid
    });

    if (approve) {
      await updateDoc(doc(db, "users", data.userId), {
        isDeveloper: true,
        updatedAt: new Date().toISOString()
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================
// CHAT EN TIEMPO REAL
// ============================================================

// Buscar usuarios por nombre o email
export async function searchUsers(searchTerm) {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const results = [];
    const term = searchTerm.toLowerCase();
    snapshot.forEach((d) => {
      const u = { id: d.id, ...d.data() };
      if ((u.username && u.username.toLowerCase().includes(term)) ||
          (u.email && u.email.toLowerCase().includes(term))) {
        results.push(u);
      }
    });
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Crear o obtener chat entre dos usuarios
export async function getOrCreateChat(uid1, uid2) {
  try {
    const chatsRef = collection(db, "chats");
    const q1 = query(chatsRef, 
        where("participants", "==", [uid1, uid2].sort().join("_")),
        where("participantIds", "array-contains", uid1)
    );
    const snap = await getDocs(q1);
    if (!snap.empty) {
      const chatDoc = snap.docs[0];
      return { success: true, chatId: chatDoc.id, data: chatDoc.data() };
    }
    // Crear nuevo chat
    const newChat = await addDoc(chatsRef, {
      participants: [uid1, uid2].sort().join("_"),
      participantIds: [uid1, uid2],
      createdAt: Date.now(),
      lastMessage: "",
      lastMessageAt: Date.now()
    });
    return { success: true, chatId: newChat.id, data: { participantIds: [uid1, uid2] } };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Enviar mensaje en un chat
export async function sendChatMessage(chatId, senderId, senderName, text, image = null, senderNexusPlus = false) {
  try {
    const messagesRef = collection(db, "chats", chatId, "messages");
    const msgData = {
      senderId,
      senderName,
      senderNexusPlus,
      text,
      timestamp: Date.now()
    };
    if (image) {
      msgData.image = image;
    }
    await addDoc(messagesRef, msgData);
    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: image ? '📷 Imagen enviada' : text.substring(0, 80),
      lastMessageAt: Date.now(),
      lastSenderId: senderId
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function editChatMessage(chatId, messageId, newText, senderId) {
  try {
    const msgRef = doc(db, "chats", chatId, "messages", messageId);
    const msgSnap = await getDoc(msgRef);
    if (!msgSnap.exists()) return { success: false, error: "Mensaje no encontrado" };
    if (msgSnap.data().senderId !== senderId) return { success: false, error: "No puedes editar este mensaje" };
    
    await updateDoc(msgRef, {
      text: newText,
      edited: true
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Escuchar mensajes de un chat en tiempo real
export function listenChatMessages(chatId, callback) {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  return onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach((d) => messages.push({ id: d.id, ...d.data() }));
    callback(messages);
  });
}

// Escuchar chats de un usuario
export function listenUserChats(uid, callback) {
  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("participantIds", "array-contains", uid));
  return onSnapshot(q, (snapshot) => {
    const chats = [];
    snapshot.forEach((d) => chats.push({ id: d.id, ...d.data() }));
    chats.sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
    callback(chats);
  }, (error) => {
    console.error('Error en listenUserChats:', error);
    callback([]);
  });
}

// ==========================================
// APPS UPDATES (CHANGELOG)
// ==========================================
export async function addAppUpdate(updateData) {
  try {
    const docRef = await addDoc(collection(db, "appUpdates"), {
      ...updateData,
      createdAt: Date.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAppUpdates() {
  try {
    const q = query(collection(db, "appUpdates"), orderBy("createdAt", "asc"));
    const snap = await getDocs(q);
    const updates = [];
    snap.forEach((d) => updates.push({ id: d.id, ...d.data() }));
    return { success: true, data: updates };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteAppUpdate(id) {
  try {
    await deleteDoc(doc(db, "appUpdates", id));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateAppUpdate(updateId, field, value, operation) {
  try {
    const ref = doc(db, "appUpdates", updateId);
    if (operation === 'arrayUnion') {
      await updateDoc(ref, { [field]: arrayUnion(value) });
    } else if (operation === 'arrayRemove') {
      await updateDoc(ref, { [field]: arrayRemove(value) });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Obtener datos de un usuario por ID
export async function getUserById(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return { success: true, data: { id: userDoc.id, ...userDoc.data() } };
    }
    return { success: false, error: "Usuario no encontrado" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================
// NEXUS+ SOLICITUDES DE ACCESO ANTICIPADO
// ============================================================
export async function requestNexusPlusAccess(userId, email, username) {
  try {
    const q = query(collection(db, "nexusPlusRequests"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { success: false, error: "Ya tienes una solicitud en proceso" };
    }
    await addDoc(collection(db, "nexusPlusRequests"), {
      userId,
      email,
      username,
      status: "pending",
      requestedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function listenNexusPlusRequests(callback) {
  const q = query(collection(db, "nexusPlusRequests"), orderBy("requestedAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const requests = [];
    snapshot.forEach(doc => requests.push({ id: doc.id, ...doc.data() }));
    callback(requests);
  });
}

export async function reviewNexusPlusRequest(requestId, approve, adminUid) {
  try {
    if (!(await isUserAdmin(adminUid))) return { success: false, error: "No autorizado" };

    const reqSnap = await getDoc(doc(db, "nexusPlusRequests", requestId));
    if (!reqSnap.exists()) return { success: false, error: "Solicitud no encontrada" };
    const data = reqSnap.data();

    await updateDoc(doc(db, "nexusPlusRequests", requestId), {
      status: approve ? "approved" : "rejected",
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminUid
    });

    if (approve) {
      await updateDoc(doc(db, "users", data.userId), {
        hasNexusPlus: true,
        updatedAt: new Date().toISOString()
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================
// EXPORTAR FUNCIONES ÚTILES (Firestore helpers)
// ============================================================

export { doc, getDoc, updateDoc, addDoc, onSnapshot, arrayUnion, arrayRemove };

console.log('🔥 No hackees pls');
console.log('📦 Versión: 2.1.0 (Corregida + Developer)');
console.log('👥 157 Developers Team');
