import React, { createContext, useState, useContext, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { auth, db, firebaseConfig } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  getAuth,
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  updatePassword
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  writeBatch 
} from 'firebase/firestore';

const MediaContext = createContext();

export const MediaProvider = ({ children }) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Media Listener
  useEffect(() => {
    const q = query(collection(db, 'media'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setMediaItems(items);
    }, (error) => {
      console.error("Error fetching media:", error);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, displayName) => {
    try {
      // Usamos una app secundaria para no desloguear al admin actual
      const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      
      // Update the profile with the provided name
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }

      await signOut(secondaryAuth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const changeUserPassword = async (newPassword) => {
    if (!auth.currentUser) return { success: false, error: "No user logged in" };
    try {
      await updatePassword(auth.currentUser, newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logoutUser = async () => {
    await signOut(auth);
  };

  const addMediaToDB = async (url, type, name) => {
    try {
      const newOrder = mediaItems.length > 0 
        ? Math.max(...mediaItems.map(m => m.order)) + 1 
        : 0;

      await addDoc(collection(db, 'media'), {
        url,
        type,
        name,
        order: newOrder,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error adding media:", error);
    }
  };

  const removeMedia = async (id) => {
    try {
      await deleteDoc(doc(db, 'media', id));
    } catch (error) {
      console.error("Error removing media:", error);
    }
  };

  const reorderMedia = async (oldIndex, newIndex) => {
    // Optimistic UI update could be done here, but onSnapshot handles it fast enough
    const newItems = Array.from(mediaItems);
    const [removed] = newItems.splice(oldIndex, 1);
    newItems.splice(newIndex, 0, removed);
    
    // Update locally immediately for smooth UI
    setMediaItems(newItems);

    // Save new order to Firestore
    try {
      const batch = writeBatch(db);
      newItems.forEach((item, index) => {
        const itemRef = doc(db, 'media', item.id);
        batch.update(itemRef, { order: index });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error reordering media:", error);
    }
  };

  return (
    <MediaContext.Provider value={{
      mediaItems,
      addMediaToDB,
      removeMedia,
      reorderMedia,
      user,
      loadingAuth,
      login,
      register,
      logout: logoutUser,
      changeUserPassword
    }}>
      {!loadingAuth && children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => useContext(MediaContext);
