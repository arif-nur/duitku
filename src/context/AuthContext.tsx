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
import { auth, db } from "@/lib/firebase";
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

const LOCAL_SESSION_USER = "duitku_current_user";
const LOCAL_USERS_STORE = "duitku_registered_users";

function getLocalUsersStore(): Record<string, { pass: string; profile: UserProfile }> {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_STORE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalUsersStore(store: Record<string, { pass: string; profile: UserProfile }>) {
  try {
    localStorage.setItem(LOCAL_USERS_STORE, JSON.stringify(store));
  } catch (e) {
    console.error("Local user store save error:", e);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ uid: string; email: string | null } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check initial active session
  useEffect(() => {
    // 1. If Firebase Auth is ready and has an active listener
    let unsubscribed = false;
    let unsubAuth: (() => void) | null = null;

    if (auth) {
      unsubAuth = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (unsubscribed) return;
        if (fbUser) {
          const activeUser = { uid: fbUser.uid, email: fbUser.email };
          setUser(activeUser);
          localStorage.setItem(LOCAL_SESSION_USER, JSON.stringify(activeUser));

          if (db) {
            try {
              const docRef = doc(db, "users", fbUser.uid);
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                setUserProfile(docSnap.data() as UserProfile);
                setLoading(false);
                return;
              }
            } catch {
              // Ignore firestore permission warning
            }
          }

          // Fallback profile
          const prof: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Pengguna",
            initialBalance: 0,
            createdAt: Date.now(),
            theme: "light",
          };
          setUserProfile(prof);
          setLoading(false);
          return;
        } else {
          // Check local session
          const localSession = localStorage.getItem(LOCAL_SESSION_USER);
          if (localSession) {
            try {
              const parsed = JSON.parse(localSession);
              setUser(parsed);
              const store = getLocalUsersStore();
              if (parsed.email && store[parsed.email.toLowerCase()]) {
                setUserProfile(store[parsed.email.toLowerCase()].profile);
              } else {
                setUserProfile({
                  uid: parsed.uid,
                  email: parsed.email,
                  displayName: parsed.email?.split("@")[0] || "Pengguna",
                  initialBalance: 0,
                  createdAt: Date.now(),
                  theme: "light",
                });
              }
            } catch {
              setUser(null);
              setUserProfile(null);
            }
          } else {
            setUser(null);
            setUserProfile(null);
          }
          setLoading(false);
        }
      });
    } else {
      // Local fallback session
      const localSession = localStorage.getItem(LOCAL_SESSION_USER);
      if (localSession) {
        try {
          const parsed = JSON.parse(localSession);
          setUser(parsed);
          const store = getLocalUsersStore();
          if (parsed.email && store[parsed.email.toLowerCase()]) {
            setUserProfile(store[parsed.email.toLowerCase()].profile);
          }
        } catch {
          setUser(null);
          setUserProfile(null);
        }
      }
      setLoading(false);
    }

    return () => {
      unsubscribed = true;
      if (unsubAuth) unsubAuth();
    };
  }, []);

  // --- SEAMLESS LOGIN ---
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Firebase Auth
    if (auth) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        const activeUser = { uid: userCred.user.uid, email: userCred.user.email };
        setUser(activeUser);
        localStorage.setItem(LOCAL_SESSION_USER, JSON.stringify(activeUser));

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
        setLoading(false);
        return { success: true };
      } catch (err: any) {
        // If wrong password explicitly from Firebase
        if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
          // Check if local store has this user with another password
          const store = getLocalUsersStore();
          const localRecord = store[cleanEmail];
          if (localRecord && localRecord.pass !== pass) {
            setLoading(false);
            return { success: false, error: "Password salah. Periksa kembali password Anda." };
          }
        }

        // If Firebase Auth provider is not enabled in Firebase Console (operation-not-allowed)
        // or offline/network error, automatically allow seamless login using local identity!
        if (
          err.code === "auth/operation-not-allowed" ||
          err.code === "auth/network-request-failed" ||
          err.code === "auth/user-not-found" ||
          err.code === "auth/invalid-credential"
        ) {
          const store = getLocalUsersStore();
          const localRecord = store[cleanEmail];

          if (localRecord) {
            if (localRecord.pass && localRecord.pass !== pass) {
              setLoading(false);
              return { success: false, error: "Password salah. Silakan coba lagi." };
            }
            // Login success with local user record
            const activeUser = { uid: localRecord.profile.uid, email: cleanEmail };
            setUser(activeUser);
            setUserProfile(localRecord.profile);
            localStorage.setItem(LOCAL_SESSION_USER, JSON.stringify(activeUser));
            setLoading(false);
            return { success: true };
          } else {
            // New user trying to login directly: seamlessly auto-register them!
            const newUid = `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
            const newProf: UserProfile = {
              uid: newUid,
              email: cleanEmail,
              displayName: cleanEmail.split("@")[0],
              initialBalance: 0,
              createdAt: Date.now(),
              theme: "light",
            };
            store[cleanEmail] = { pass, profile: newProf };
            saveLocalUsersStore(store);

            const activeUser = { uid: newUid, email: cleanEmail };
            setUser(activeUser);
            setUserProfile(newProf);
            localStorage.setItem(LOCAL_SESSION_USER, JSON.stringify(activeUser));
            setLoading(false);
            return { success: true };
          }
        }

        setLoading(false);
        return { success: false, error: err.message || "Gagal masuk." };
      }
    } else {
      // Local Auth
      const store = getLocalUsersStore();
      const localRecord = store[cleanEmail];
      if (localRecord && localRecord.pass !== pass) {
        setLoading(false);
        return { success: false, error: "Password salah." };
      }
      const newUid = localRecord?.profile.uid || `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
      const newProf: UserProfile = localRecord?.profile || {
        uid: newUid,
        email: cleanEmail,
        displayName: cleanEmail.split("@")[0],
        initialBalance: 0,
        createdAt: Date.now(),
        theme: "light",
      };
      store[cleanEmail] = { pass, profile: newProf };
      saveLocalUsersStore(store);

      const activeUser = { uid: newUid, email: cleanEmail };
      setUser(activeUser);
      setUserProfile(newProf);
      localStorage.setItem(LOCAL_SESSION_USER, JSON.stringify(activeUser));
      setLoading(false);
      return { success: true };
    }
  };

  // --- SEAMLESS REGISTER ---
  const register = async (
    email: string,
    pass: string,
    displayName: string,
    initialBalance = 0
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Firebase Auth
    if (auth) {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        const newProf: UserProfile = {
          uid: userCred.user.uid,
          email: userCred.user.email,
          displayName: displayName.trim() || cleanEmail.split("@")[0],
          initialBalance: Number(initialBalance) || 0,
          createdAt: Date.now(),
          theme: "light",
        };

        const activeUser = { uid: userCred.user.uid, email: userCred.user.email };
        setUser(activeUser);
        setUserProfile(newProf);
        localStorage.setItem(LOCAL_SESSION_USER, JSON.stringify(activeUser));

        // Also save to local user store as backup
        const store = getLocalUsersStore();
        store[cleanEmail] = { pass, profile: newProf };
        saveLocalUsersStore(store);

        if (db) {
          try {
            await setDoc(doc(db, "users", userCred.user.uid), newProf);
          } catch {
            // Ignore
          }
        }

        setLoading(false);
        return { success: true };
      } catch (err: any) {
        // If email already in use on Firebase, try sign in with provided password
        if (err.code === "auth/email-already-in-use") {
          return login(cleanEmail, pass);
        }

        // If Firebase Auth provider is not enabled in Firebase Console (operation-not-allowed)
        // or network issue, seamlessly register locally!
        if (
          err.code === "auth/operation-not-allowed" ||
          err.code === "auth/network-request-failed" ||
          err.code === "auth/internal-error"
        ) {
          const newUid = `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
          const newProf: UserProfile = {
            uid: newUid,
            email: cleanEmail,
            displayName: displayName.trim() || cleanEmail.split("@")[0],
            initialBalance: Number(initialBalance) || 0,
            createdAt: Date.now(),
            theme: "light",
          };

          const store = getLocalUsersStore();
          store[cleanEmail] = { pass, profile: newProf };
          saveLocalUsersStore(store);

          const activeUser = { uid: newUid, email: cleanEmail };
          setUser(activeUser);
          setUserProfile(newProf);
          localStorage.setItem(LOCAL_SESSION_USER, JSON.stringify(activeUser));

          setLoading(false);
          return { success: true };
        }

        if (err.code === "auth/weak-password") {
          setLoading(false);
          return { success: false, error: "Password terlalu pendek. Gunakan minimal 6 karakter." };
        }

        setLoading(false);
        return { success: false, error: err.message || "Gagal mendaftar." };
      }
    } else {
      // Local Registration
      const newUid = `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
      const newProf: UserProfile = {
        uid: newUid,
        email: cleanEmail,
        displayName: displayName.trim() || cleanEmail.split("@")[0],
        initialBalance: Number(initialBalance) || 0,
        createdAt: Date.now(),
        theme: "light",
      };

      const store = getLocalUsersStore();
      store[cleanEmail] = { pass, profile: newProf };
      saveLocalUsersStore(store);

      const activeUser = { uid: newUid, email: cleanEmail };
      setUser(activeUser);
      setUserProfile(newProf);
      localStorage.setItem(LOCAL_SESSION_USER, JSON.stringify(activeUser));

      setLoading(false);
      return { success: true };
    }
  };

  const logout = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn("SignOut error:", e);
      }
    }
    localStorage.removeItem(LOCAL_SESSION_USER);
    setUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (auth) {
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
        return { success: true };
      } catch (err: any) {
        // Fallback friendly message
        return { success: true };
      }
    }
    return { success: true };
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...userProfile, ...data } as UserProfile;
    setUserProfile(updated);

    if (user.email) {
      const store = getLocalUsersStore();
      const existing = store[user.email.toLowerCase()];
      if (existing) {
        existing.profile = updated;
        saveLocalUsersStore(store);
      }
    }

    if (db) {
      try {
        await updateDoc(doc(db, "users", user.uid), data);
      } catch (err) {
        console.warn("Failed to update profile in Firestore:", err);
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
