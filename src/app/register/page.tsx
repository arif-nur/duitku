"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Mail,
  Lock,
  User,
  UserPlus,
  AlertCircle,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatRupiah } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginDemo, isFirebaseActive } = useAuth();
  const { showSuccess, showError } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [initialBalanceStr, setInitialBalanceStr] = useState("0");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const numInitial = parseFloat(initialBalanceStr) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      showError("Email dan password wajib diisi!");
      return;
    }
    if (password.length < 6) {
      showError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    const res = await register(email, password, displayName.trim(), numInitial);
    setLoading(false);

    if (res.success) {
      showSuccess("Pendaftaran berhasil! Selamat datang di DuitKu.");
      router.push("/dashboard");
    } else {
      setErrorMessage(res.error || "Gagal melakukan pendaftaran.");
      showError(res.error || "Gagal mendaftar.");
    }
  };

  const handleDemoBypass = () => {
    loginDemo(email || "arief@gmail.com", displayName || "Arief");
    showSuccess("Masuk dengan Mode Demo Lokal! Anda dapat langsung menggunakan semua fitur.");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <Wallet className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Daftar Akun DuitKu
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mulai kelola keuangan pribadi Anda dengan lebih rapi & terencana
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
              Nama Lengkap / Panggilan
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Contoh: Arief"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Alamat Email
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Password (Min. 6 Karakter)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Gunakan minimal 6 karakter unik"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              💡 Tip: Hindari password umum seperti "123456" agar Google Chrome tidak menampilkan peringatan kebocoran password.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Saldo Awal Dompet / Rekening (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                Rp
              </span>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={initialBalanceStr}
                onChange={(e) => setInitialBalanceStr(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            {numInitial > 0 && (
              <p className="mt-1 text-xs text-slate-400">Terbaca: {formatRupiah(numInitial)}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 active:scale-95 transition-all ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? "Mendaftarkan..." : "Daftar & Masuk ke Firebase"}</span>
          </button>
        </form>

        {/* Bypass / Demo Option Button */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Belum sempat mengaktifkan provider di Firebase Console?
          </p>
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
          Sudah memiliki akun?{" "}
          <Link
            href="/login"
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
