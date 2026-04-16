import React, { createContext, useEffect, useMemo, useState } from "react";
import { auth, db } from "../services/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (uid) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        const profile = await loadUserProfile(firebaseUser.uid);
        setUserData(profile);
      } else {
        setUser(null);
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    const profile = await loadUserProfile(userCredential.user.uid);

    if (!profile) {
      await signOut(auth);
      throw new Error(
        "User profile missing. Please contact support or sign up again.",
      );
    }

    return userCredential.user;
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log("Logout Error:", error);
    }
  };

  const value = useMemo(
    () => ({
      user,
      userData,
      loading,
      login,
      logout,
    }),
    [user, userData, loading],
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
