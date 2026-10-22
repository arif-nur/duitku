"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  User,
  Wallet,
  Shield,
  Moon,
  Sun,
  LogOut,
  LogIn,
  Save,
  Database,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useFinance } from "@/context/FinanceContext";
import { useToast } from "@/context/ToastContext";
import { formatRupiah } from "@/lib/utils";
import { isFirebaseConfigured } from "@/lib/firebase";

export default function SettingsPage() {
  const { userProfile, updateUserProfile, logout } = useAuth();
  const isFirebaseActive = isFirebaseConfigured;
  const { initialBalance } = useFinance();
  const { showSuccess, showError } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [balanceInput, setBalanceInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || "");
      setBalanceInput(String(userProfile.initialBalance || 0));
    }
  }, [userProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const newBal = parseFloat(balanceInput) || 0;

    setSubmitting(true);
    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        initialBalance: newBal,
      });
      showSuccess("Pengaturan profil dan saldo awal berhasil diperbarui!");
    } catch {
      showError("Gagal memperbarui pengaturan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <span className="p-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Settings className="w-6 h-6" />
          </span>
          Pengaturan Akun & Saldo
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Sesuaikan profil pengguna, tetapkan saldo awal pembukaan, dan periksa status database.
        </p>
      </div>

      {/* Profile & Initial Balance Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            Profil Pengguna & Saldo Awal
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Nama Tampilan
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nama Anda"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Email Terdaftar
              </label>
              <input
                type="email"
                disabled
                value={userProfile?.email || "saya@cuanku.id"}
                className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Saldo Awal Pembukaan (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                Rp
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              Saldo awal adalah jumlah uang riil di kantong/bank Anda ketika mulai menggunakan aplikasi. Saldo akhir dihitung: Saldo Awal + Pemasukan − Pengeluaran − Tabungan.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Account & Login System Navigation */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LogIn className="w-5 h-5 text-emerald-600" />
              Sistem Akun & Autentikasi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              {userProfile?.email && userProfile.email !== "saya@cuanku.id"
                ? `Akun Anda saat ini terhubung dengan email ${userProfile.email}. Anda dapat berganti akun kapan saja.`
                : "Saat ini Anda menggunakan akun perangkat lokal tanpa login. Masuk atau buat akun baru untuk menyimpan data Anda ke Cloud Firebase dan akses di perangkat lain."}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all text-center"
            >
              {userProfile?.email && userProfile.email !== "saya@cuanku.id" ? "Ganti Akun" : "Masuk ke Akun"}
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs active:scale-95 transition-all text-center"
            >
              Daftar Baru
            </Link>
          </div>
        </div>
      </div>

      {/* Database Connection Status Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          Status Integrasi Database Firebase
        </h2>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-xs font-semibold text-slate-400">Mode Database Saat Ini:</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
              <CheckCircle2
                className={`w-4 h-4 ${isFirebaseActive ? "text-emerald-500" : "text-indigo-500"}`}
              />
              {isFirebaseActive ? "Firebase Cloud Firestore Aktif" : "Local Engine (Browser Storage Siap Pakai)"}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Keamanan:</span>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
              <Shield className="w-3.5 h-3.5" />
              Tersedia Security Rules
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-200 space-y-1">
          <p className="font-semibold">💡 Ingin menghubungkan dengan project Firebase Anda sendiri?</p>
          <p>
            Cukup salin kredensial web project Anda ke file <code>.env.local</code> (lihat contoh panduan di <code>.env.local.example</code>). Aturan keamanan siap pakai telah disediakan di file <code>firestore.rules</code>.
          </p>
        </div>
      </div>

      {/* Logout Action */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Keluar dari Akun</h3>
          <p className="text-xs text-slate-400">Akhiri sesi penggunaan aplikasi CuanKu ini.</p>
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
}
