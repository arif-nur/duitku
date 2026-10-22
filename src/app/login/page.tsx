"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginDemo, resetPassword, isFirebaseActive } = useAuth();
  const { showSuccess, showError } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      showError("Email dan password wajib diisi!");
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      showSuccess("Selamat datang kembali di DuitKu!");
      router.push("/dashboard");
    } else {
      setErrorMessage(res.error || "Gagal masuk ke akun.");
      showError(res.error || "Gagal masuk.");
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      showError("Masukkan email Anda terlebih dahulu pada kolom email.");
      return;
    }
    setResetting(true);
    const res = await resetPassword(email);
    setResetting(false);
    if (res.success) {
      showSuccess("Instruksi reset password telah dikirim ke email Anda!");
    } else {
      showError(res.error || "Gagal memproses reset password.");
    }
  };

  const handleDemoBypass = () => {
    loginDemo(email || "arief@gmail.com", "Arief");
    showSuccess("Masuk dengan Mode Demo Lokal! Anda dapat langsung menggunakan semua fitur.");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand Logo & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <Wallet className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Masuk ke DuitKu
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Aplikasi PWA Catatan Keuangan Pribadi Modern
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{errorMessage}</div>
            </div>
            {errorMessage.includes("Firebase Console") && (
              <div className="pt-2 border-t border-rose-200 dark:border-rose-900">
                <a
                  href="https://console.firebase.google.com/project/dompet-my/authentication/providers"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline flex items-center gap-1 hover:text-rose-900"
                >
                  Buka Pengaturan Authentication Firebase
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resetting}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {resetting ? "Mengirim..." : "Lupa password?"}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 active:scale-95 transition-all ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? "Memproses..." : "Masuk ke Akun"}</span>
          </button>
        </form>

        {/* Demo Bypass */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
          <button
            type="button"
            onClick={handleDemoBypass}
            className="w-full py-2.5 px-4 rounded-2xl border border-dashed border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Masuk Langsung (Mode Demo Cepat)</span>
          </button>
        </div>

        <div className="text-center text-xs text-slate-500">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Daftar Akun Baru
          </Link>
        </div>
      </div>
    </div>
  );
}
