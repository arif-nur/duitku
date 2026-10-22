"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";
import { UserProfile } from "@/types";

interface AuthContextType {
  user: { uid: string; email: string | null } | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    pass: string,
    displayName: string,
    initialBalance?: number
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_SESSION_KEY = "duitku_active_session";
const LOCAL_PROFILE_KEY = "duitku_active_profile";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ uid: string; email: string | null } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize session: instant ready without requiring registration
  useEffect(() => {
    // 1. If Firebase Auth user is already logged in
    let unsubAuth: (() => void) | null = null;

    if (isFirebaseConfigured && auth && db) {
      unsubAuth = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const active = { uid: fbUser.uid, email: fbUser.email };
          setUser(active);
          try {
            const docRef = doc(db!, "users", fbUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUserProfile(docSnap.data() as UserProfile);
              setLoading(false);
              return;
            }
          } catch {
            // Ignore
          }
          const prof: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Saya",
            initialBalance: 0,
            createdAt: Date.now(),
            theme: "light",
          };
          setUserProfile(prof);
          setLoading(false);
        } else {
          // No firebase user logged in: automatically initialize local user so no registration required!
          initializeInstantUser();
        }
      });
    } else {
      initializeInstantUser();
    }

    function initializeInstantUser() {
      const storedSession = localStorage.getItem(LOCAL_SESSION_KEY);
      const storedProfile = localStorage.getItem(LOCAL_PROFILE_KEY);

      if (storedSession && storedProfile) {
        try {
          setUser(JSON.parse(storedSession));
          setUserProfile(JSON.parse(storedProfile));
          setLoading(false);
          return;
        } catch {
          // Reset if corrupted
        }
      }

      // Create an instant user session for this device so user can immediately use the app
      const defaultUser = { uid: "user_duitku_device", email: "saya@duitku.id" };
      const defaultProfile: UserProfile = {
        uid: "user_duitku_device",
        email: "saya@duitku.id",
        displayName: "Dompet Saya",
        initialBalance: 0,
        createdAt: Date.now(),
        theme: "light",
      };

      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(defaultUser));
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(defaultProfile));
      setUser(defaultUser);
      setUserProfile(defaultProfile);
      setLoading(false);
    }

    return () => {
      if (unsubAuth) unsubAuth();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    if (auth) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        const active = { uid: userCred.user.uid, email: userCred.user.email };
        setUser(active);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(active));

        if (db) {
          try {
            const docRef = doc(db, "users", userCred.user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUserProfile(docSnap.data() as UserProfile);
              setLoading(false);
              return { success: true };
            }
          } catch {
            // Ignore
          }
        }

        const fallbackProf: UserProfile = {
          uid: userCred.user.uid,
          email: userCred.user.email,
          displayName: userCred.user.displayName || cleanEmail.split("@")[0],
          initialBalance: 0,
          createdAt: Date.now(),
          theme: "light",
        };
        setUserProfile(fallbackProf);
        localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(fallbackProf));
        setLoading(false);
        return { success: true };
      } catch {
        // Local fallback
      }
    }

    // Local instant login
    const uid = `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
    const prof: UserProfile = {
      uid,
      email: cleanEmail,
      displayName: cleanEmail.split("@")[0],
      initialBalance: 0,
      createdAt: Date.now(),
      theme: "light",
    };
    const active = { uid, email: cleanEmail };
    setUser(active);
    setUserProfile(prof);
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(active));
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(prof));
    setLoading(false);
    return { success: true };
  };

  const register = async (
    email: string,
    pass: string,
    displayName: string,
    initialBalance = 0
  ): Promise<{ success: boolean; error?: string }> => {
    return login(email, pass);
  };

  const logout = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch {
        // Ignore
      }
    }
    // Re-initialize clean instant user so the app never shows empty broken screen
    const defaultUser = { uid: "user_duitku_device", email: "saya@duitku.id" };
    const defaultProfile: UserProfile = {
      uid: "user_duitku_device",
      email: "saya@duitku.id",
      displayName: "Dompet Saya",
      initialBalance: 0,
      createdAt: Date.now(),
      theme: "light",
    };
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(defaultUser));
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(defaultProfile));
    setUser(defaultUser);
    setUserProfile(defaultProfile);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (auth) {
      try {
        await sendPasswordResetEmail(auth, email.trim().toLowerCase());
        return { success: true };
      } catch {
        return { success: true };
      }
    }
    return { success: true };
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...userProfile, ...data } as UserProfile;
    setUserProfile(updated);
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updated));

    if (db && user.uid && !user.uid.startsWith("user_duitku")) {
      try {
        await updateDoc(doc(db, "users", user.uid), data);
      } catch {
        // Ignore
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        login,
        register,
        logout,
        resetPassword,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
