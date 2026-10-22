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
  isFirebaseActive: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginDemo: (email?: string, displayName?: string) => void;
  register: (
    email: string,
    pass: string,
    displayName: string,
    initialBalance: number
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = "duitku_demo_user";
const LOCAL_PROFILE_KEY = "duitku_demo_profile";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ uid: string; email: string | null } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth state
  useEffect(() => {
    if (isFirebaseConfigured && auth && db) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          setUser({ uid: fbUser.uid, email: fbUser.email });
          try {
            const docRef = doc(db!, "users", fbUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUserProfile(docSnap.data() as UserProfile);
            } else {
              const newProf: UserProfile = {
                uid: fbUser.uid,
                email: fbUser.email,
                displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Pengguna",
                initialBalance: 0,
                createdAt: Date.now(),
                theme: "light",
              };
              try {
                await setDoc(docRef, newProf);
              } catch (e) {
                console.warn("Could not save initial Firestore doc, using local profile:", e);
              }
              setUserProfile(newProf);
            }
          } catch (err) {
            console.warn("Error fetching Firestore user profile:", err);
            // Fallback profile if Firestore is not yet configured with rules
            setUserProfile({
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.email?.split("@")[0] || "Pengguna",
              initialBalance: 0,
              createdAt: Date.now(),
              theme: "light",
            });
          }
        } else {
          // Check local stored session as fallback
          const storedUser = localStorage.getItem(LOCAL_USER_KEY);
          const storedProfile = localStorage.getItem(LOCAL_PROFILE_KEY);
          if (storedUser && storedProfile) {
            try {
              setUser(JSON.parse(storedUser));
              setUserProfile(JSON.parse(storedProfile));
            } catch {
              setUser(null);
              setUserProfile(null);
            }
          } else {
            setUser(null);
            setUserProfile(null);
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Local demo mode (no Firebase keys configured yet)
      const storedUser = localStorage.getItem(LOCAL_USER_KEY);
      const storedProfile = localStorage.getItem(LOCAL_PROFILE_KEY);
      if (storedUser && storedProfile) {
        try {
          setUser(JSON.parse(storedUser));
          setUserProfile(JSON.parse(storedProfile));
        } catch {
          localStorage.removeItem(LOCAL_USER_KEY);
          localStorage.removeItem(LOCAL_PROFILE_KEY);
        }
      } else {
        const demoUser = { uid: "demo-user-123", email: "demo@duitku.id" };
        const demoProf: UserProfile = {
          uid: "demo-user-123",
          email: "demo@duitku.id",
          displayName: "Sobat DuitKu",
          initialBalance: 2500000,
          createdAt: Date.now(),
          theme: "light",
        };
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
        localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(demoProf));
        setUser(demoUser);
        setUserProfile(demoProf);
      }
      setLoading(false);
    }
  }, []);

  const loginDemo = (email = "demo@duitku.id", displayName = "Sobat DuitKu") => {
    const demoUser = { uid: `local-${Date.now()}`, email };
    const demoProf: UserProfile = {
      uid: demoUser.uid,
      email,
      displayName,
      initialBalance: 1500000,
      createdAt: Date.now(),
      theme: "light",
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(demoProf));
    setUser(demoUser);
    setUserProfile(demoProf);
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    if (isFirebaseConfigured && auth && db) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, email, pass);
        setUser({ uid: userCred.user.uid, email: userCred.user.email });

        try {
          const docRef = doc(db!, "users", userCred.user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            const fallbackProf: UserProfile = {
              uid: userCred.user.uid,
              email: userCred.user.email,
              displayName: userCred.user.email?.split("@")[0] || "Pengguna",
              initialBalance: 0,
              createdAt: Date.now(),
              theme: "light",
            };
            setUserProfile(fallbackProf);
          }
        } catch {
          // If Firestore read fails due to rules
          setUserProfile({
            uid: userCred.user.uid,
            email: userCred.user.email,
            displayName: userCred.user.email?.split("@")[0] || "Pengguna",
            initialBalance: 0,
            createdAt: Date.now(),
            theme: "light",
          });
        }

        setLoading(false);
        return { success: true };
      } catch (err: any) {
        setLoading(false);
        let msg = "Gagal login. Periksa kembali email dan password.";
        if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
          msg = "Email atau password salah. Jika belum punya akun, silakan klik Daftar.";
        } else if (err.code === "auth/user-not-found") {
          msg = "Email belum terdaftar. Silakan buat akun baru di menu Daftar.";
        } else if (err.code === "auth/operation-not-allowed") {
          msg = "Provider Email/Password belum diaktifkan di Firebase Console. Masuk ke Firebase Console > Authentication > Sign-in method > aktifkan Email/Password.";
        } else if (err.code === "auth/too-many-requests") {
          msg = "Terlalu banyak percobaan gagal. Silakan coba beberapa saat lagi.";
        } else if (err.code === "auth/network-request-failed") {
          msg = "Gagal terhubung ke Firebase. Periksa koneksi internet Anda.";
        } else if (err.message) {
          msg = `Firebase error: ${err.message}`;
        }
        return { success: false, error: msg };
      }
    } else {
      // Local Demo Auth
      loginDemo(email, email.split("@")[0]);
      setLoading(false);
      return { success: true };
    }
  };

  const register = async (
    email: string,
    pass: string,
    displayName: string,
    initialBalance: number
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    if (isFirebaseConfigured && auth && db) {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, pass);
        const newProf: UserProfile = {
          uid: userCred.user.uid,
          email: userCred.user.email,
          displayName: displayName || email.split("@")[0],
          initialBalance: Number(initialBalance) || 0,
          createdAt: Date.now(),
          theme: "light",
        };

        setUser({ uid: userCred.user.uid, email: userCred.user.email });
        setUserProfile(newProf);

        // Save profile to Firestore with fallback
        try {
          await setDoc(doc(db!, "users", userCred.user.uid), newProf);
        } catch (firestoreErr) {
          console.warn("Could not write profile to Firestore (check rules):", firestoreErr);
          // Still save locally so user can continue
          localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(newProf));
        }

        setLoading(false);
        return { success: true };
      } catch (err: any) {
        setLoading(false);
        let msg = "Gagal mendaftar.";
        if (err.code === "auth/operation-not-allowed") {
          msg = "Provider 'Email/Password' belum diaktifkan di Firebase Console! Buka Firebase Console > Authentication > Sign-in method > klik Email/Password > centang Enable dan Simpan.";
        } else if (err.code === "auth/email-already-in-use") {
          msg = "Email ini sudah terdaftar! Silakan langsung Masuk di halaman Login.";
        } else if (err.code === "auth/weak-password") {
          msg = "Password terlalu lemah. Gunakan minimal 6 karakter kombinasi huruf dan angka.";
        } else if (err.code === "auth/invalid-email") {
          msg = "Format email tidak valid.";
        } else if (err.code === "auth/network-request-failed") {
          msg = "Gagal terhubung ke Firebase. Periksa koneksi internet Anda.";
        } else if (err.message) {
          msg = `Firebase error: ${err.message}`;
        }
        return { success: false, error: msg };
      }
    } else {
      // Local Demo Register
      loginDemo(email, displayName || email.split("@")[0]);
      setLoading(false);
      return { success: true };
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn("Error signing out:", e);
      }
    }
    localStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem(LOCAL_PROFILE_KEY);
    setUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (isFirebaseConfigured && auth) {
      try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Gagal mengirim link reset password." };
      }
    } else {
      return {
        success: true,
        error: "Mode demo: Instruksi reset password disimulasikan berhasil.",
      };
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...userProfile, ...data } as UserProfile;
    setUserProfile(updated);

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db!, "users", user.uid), data);
      } catch (err) {
        console.warn("Failed to update profile in Firestore:", err);
      }
    }
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isFirebaseActive: isFirebaseConfigured,
        login,
        loginDemo,
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
