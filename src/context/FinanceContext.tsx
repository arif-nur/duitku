"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  runTransaction,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import {
  Transaction,
  SavingsGoal,
  SavingsMovement,
  MonthlyBudget,
} from "@/types";
import { getCurrentMonthString, getTodayDateString } from "@/lib/utils";

interface FinanceContextType {
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  savingsMovements: SavingsMovement[];
  budgets: MonthlyBudget[];
  currentMonthBudget: MonthlyBudget | null;
  loading: boolean;

  // Real-time calculated balances
  initialBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  availableBalance: number;
  netWorth: number;

  // Monthly stats
  monthIncome: number;
  monthExpense: number;
  remainingBudget: number | null;
  budgetUsagePercent: number;

  // Actions
  addTransaction: (tx: Omit<Transaction, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<{ success: boolean; error?: string }>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<{ success: boolean; error?: string }>;
  deleteTransaction: (id: string) => Promise<{ success: boolean; error?: string }>;

  addSavingsGoal: (goal: Omit<SavingsGoal, "id" | "userId" | "currentAmount" | "createdAt" | "updatedAt">) => Promise<{ success: boolean; error?: string }>;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => Promise<{ success: boolean; error?: string }>;
  deleteSavingsGoal: (id: string) => Promise<{ success: boolean; error?: string }>;

  depositToGoal: (goalId: string, amount: number, note?: string) => Promise<{ success: boolean; error?: string }>;
  withdrawFromGoal: (goalId: string, amount: number, note?: string) => Promise<{ success: boolean; error?: string }>;

  saveBudget: (month: string, totalBudget: number, categoryBudgets: Record<string, number>) => Promise<{ success: boolean; error?: string }>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Local storage keys for fallback demo mode
const LOCAL_TX_KEY = "duitku_demo_tx";
const LOCAL_GOALS_KEY = "duitku_demo_goals";
const LOCAL_MOVEMENTS_KEY = "duitku_demo_movements";
const LOCAL_BUDGETS_KEY = "duitku_demo_budgets";

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user, userProfile } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [savingsMovements, setSavingsMovements] = useState<SavingsMovement[]>([]);
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
  const [loading, setLoading] = useState(true);

  const initialBalance = userProfile?.initialBalance || 0;

  // Synchronize with Firebase Firestore or Local Storage
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setSavingsGoals([]);
      setSavingsMovements([]);
      setBudgets([]);
      setLoading(false);
      return;
    }

    if (isFirebaseConfigured && db) {
      // Setup Firestore Realtime Listeners
      const txRef = query(collection(db, "users", user.uid, "transactions"), orderBy("createdAt", "desc"));
      const unsubTx = onSnapshot(txRef, (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Transaction));
        setTransactions(items);
      });

      const goalsRef = query(collection(db, "users", user.uid, "savingsGoals"), orderBy("createdAt", "desc"));
      const unsubGoals = onSnapshot(goalsRef, (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as SavingsGoal));
        setSavingsGoals(items);
      });

      const moveRef = query(collection(db, "users", user.uid, "savingsMovements"), orderBy("createdAt", "desc"));
      const unsubMove = onSnapshot(moveRef, (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as SavingsMovement));
        setSavingsMovements(items);
      });

      const budgetsRef = query(collection(db, "users", user.uid, "budgets"));
      const unsubBudgets = onSnapshot(budgetsRef, (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as MonthlyBudget));
        setBudgets(items);
        setLoading(false);
      });

      return () => {
        unsubTx();
        unsubGoals();
        unsubMove();
        unsubBudgets();
      };
    } else {
      // Local fallback mode: load from LocalStorage
      try {
        const localTx = localStorage.getItem(`${LOCAL_TX_KEY}_${user.uid}`);
        const localGoals = localStorage.getItem(`${LOCAL_GOALS_KEY}_${user.uid}`);
        const localMovements = localStorage.getItem(`${LOCAL_MOVEMENTS_KEY}_${user.uid}`);
        const localBudgets = localStorage.getItem(`${LOCAL_BUDGETS_KEY}_${user.uid}`);

        if (localTx) setTransactions(JSON.parse(localTx));
        else {
          // Starter transactions for demo
          const initialTx: Transaction[] = [
            {
              id: "tx-1",
              userId: user.uid,
              type: "income",
              amount: 5000000,
              category: "Gaji",
              date: getTodayDateString(),
              paymentMethod: "bank",
              note: "Gaji bulanan",
              createdAt: Date.now() - 86400000 * 2,
            },
            {
              id: "tx-2",
              userId: user.uid,
              type: "expense",
              amount: 45000,
              category: "Makanan",
              date: getTodayDateString(),
              paymentMethod: "ewallet",
              note: "Makan siang ayam geprek",
              createdAt: Date.now() - 86400000,
            },
            {
              id: "tx-3",
              userId: user.uid,
              type: "expense",
              amount: 150000,
              category: "Tagihan",
              date: getTodayDateString(),
              paymentMethod: "bank",
              note: "Tagihan internet rumah",
              createdAt: Date.now() - 3600000 * 3,
            },
          ];
          setTransactions(initialTx);
          localStorage.setItem(`${LOCAL_TX_KEY}_${user.uid}`, JSON.stringify(initialTx));
        }

        if (localGoals) setSavingsGoals(JSON.parse(localGoals));
        else {
          const initialGoal: SavingsGoal[] = [
            {
              id: "goal-1",
              userId: user.uid,
              name: "Dana Darurat",
              targetAmount: 10000000,
              currentAmount: 1500000,
              targetDate: "2026-12-31",
              note: "Persiapan dana cadangan 6 bulan",
              color: "#10b981",
              createdAt: Date.now(),
            },
          ];
          setSavingsGoals(initialGoal);
          localStorage.setItem(`${LOCAL_GOALS_KEY}_${user.uid}`, JSON.stringify(initialGoal));
        }

        if (localMovements) setSavingsMovements(JSON.parse(localMovements));
        if (localBudgets) setBudgets(JSON.parse(localBudgets));
      } catch (e) {
        console.error("Local storage load error:", e);
      }
      setLoading(false);
    }
  }, [user]);

  // Synchronize changes to local storage when in demo mode
  const saveLocalData = (key: string, data: any) => {
    if (!user || isFirebaseConfigured) return;
    try {
      localStorage.setItem(`${key}_${user.uid}`, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving local data:", e);
    }
  };

  // Calculations
  const {
    totalIncome,
    totalExpense,
    totalSavings,
    availableBalance,
    netWorth,
    monthIncome,
    monthExpense,
  } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    let mInc = 0;
    let mExp = 0;
    const currentMonth = getCurrentMonthString();

    for (const t of transactions) {
      const isThisMonth = t.date.startsWith(currentMonth);
      if (t.type === "income") {
        inc += t.amount;
        if (isThisMonth) mInc += t.amount;
      } else if (t.type === "expense") {
        exp += t.amount;
        if (isThisMonth) mExp += t.amount;
      }
    }

    const savings = savingsGoals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
    // Saldo Tersedia = Saldo Awal + Total Masuk - Total Keluar - Uang di Tabungan
    const available = initialBalance + inc - exp - savings;
    // Total Kekayaan = Saldo Tersedia + Tabungan
    const totalNetWorth = available + savings;

    return {
      totalIncome: inc,
      totalExpense: exp,
      totalSavings: savings,
      availableBalance: available,
      netWorth: totalNetWorth,
      monthIncome: mInc,
      monthExpense: mExp,
    };
  }, [transactions, savingsGoals, initialBalance]);

  // Current Month Budget
  const currentMonth = getCurrentMonthString();
  const currentMonthBudget = useMemo(() => {
    return budgets.find((b) => b.month === currentMonth) || null;
  }, [budgets, currentMonth]);

  const remainingBudget = currentMonthBudget
    ? currentMonthBudget.totalBudget - monthExpense
    : null;

  const budgetUsagePercent = currentMonthBudget && currentMonthBudget.totalBudget > 0
    ? Math.min(100, Math.round((monthExpense / currentMonthBudget.totalBudget) * 100))
    : 0;

  // --- ACTIONS ---

  const addTransaction = async (
    txData: Omit<Transaction, "id" | "userId" | "createdAt" | "updatedAt">
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Harap login terlebih dahulu." };
    if (!txData.amount || txData.amount <= 0) {
      return { success: false, error: "Nominal harus lebih dari 0." };
    }
    if (!txData.date) {
      return { success: false, error: "Tanggal transaksi harus diisi." };
    }

    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId: user.uid,
      createdAt: Date.now(),
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(collection(db, "users", user.uid, "transactions"), newTx.id);
        await setDoc(docRef, newTx);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Gagal menyimpan transaksi ke Firestore." };
      }
    } else {
      const updated = [newTx, ...transactions];
      setTransactions(updated);
      saveLocalData(LOCAL_TX_KEY, updated);
      return { success: true };
    }
  };

  const updateTransaction = async (
    id: string,
    txData: Partial<Transaction>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Harap login terlebih dahulu." };
    if (txData.amount !== undefined && txData.amount <= 0) {
      return { success: false, error: "Nominal harus lebih dari 0." };
    }

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "users", user.uid, "transactions", id);
        await updateDoc(docRef, { ...txData, updatedAt: Date.now() });
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Gagal memperbarui transaksi." };
      }
    } else {
      const updated = transactions.map((t) =>
        t.id === id ? { ...t, ...txData, updatedAt: Date.now() } : t
      );
      setTransactions(updated);
      saveLocalData(LOCAL_TX_KEY, updated);
      return { success: true };
    }
  };

  const deleteTransaction = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Harap login terlebih dahulu." };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "users", user.uid, "transactions", id);
        await deleteDoc(docRef);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Gagal menghapus transaksi." };
      }
    } else {
      const updated = transactions.filter((t) => t.id !== id);
      setTransactions(updated);
      saveLocalData(LOCAL_TX_KEY, updated);
      return { success: true };
    }
  };

  const addSavingsGoal = async (
    goalData: Omit<SavingsGoal, "id" | "userId" | "currentAmount" | "createdAt" | "updatedAt">
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Harap login terlebih dahulu." };
    if (!goalData.targetAmount || goalData.targetAmount <= 0) {
      return { success: false, error: "Target nominal harus lebih dari 0." };
    }
    if (!goalData.name.trim()) {
      return { success: false, error: "Nama tabungan tidak boleh kosong." };
    }

    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId: user.uid,
      currentAmount: 0,
      createdAt: Date.now(),
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(collection(db, "users", user.uid, "savingsGoals"), newGoal.id);
        await setDoc(docRef, newGoal);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Gagal menambahkan target tabungan." };
      }
    } else {
      const updated = [newGoal, ...savingsGoals];
      setSavingsGoals(updated);
      saveLocalData(LOCAL_GOALS_KEY, updated);
      return { success: true };
    }
  };

  const updateSavingsGoal = async (
    id: string,
    goalData: Partial<SavingsGoal>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Harap login terlebih dahulu." };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "users", user.uid, "savingsGoals", id);
        await updateDoc(docRef, { ...goalData, updatedAt: Date.now() });
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Gagal memperbarui target tabungan." };
      }
    } else {
      const updated = savingsGoals.map((g) =>
        g.id === id ? { ...g, ...goalData, updatedAt: Date.now() } : g
      );
      setSavingsGoals(updated);
      saveLocalData(LOCAL_GOALS_KEY, updated);
      return { success: true };
    }
  };

  const deleteSavingsGoal = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Harap login terlebih dahulu." };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "users", user.uid, "savingsGoals", id);
        await deleteDoc(docRef);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Gagal menghapus target tabungan." };
      }
    } else {
      const updated = savingsGoals.filter((g) => g.id !== id);
      setSavingsGoals(updated);
      saveLocalData(LOCAL_GOALS_KEY, updated);
      return { success: true };
    }
  };

  // Setoran ke tabungan (Memindahkan uang dari saldo tersedia ke tabungan)
  const depositToGoal = async (
    goalId: string,
    amount: number,
    note?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Harap login terlebih dahulu." };
    if (amount <= 0) return { success: false, error: "Nominal setoran harus lebih dari 0." };

    if (amount > availableBalance) {
      return {
        success: false,
        error: `Saldo tersedia tidak mencukupi (Saldo: Rp${availableBalance.toLocaleString("id-ID")}).`,
      };
    }

    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) return { success: false, error: "Target tabungan tidak ditemukan." };

    const movement: SavingsMovement = {
      id: `move-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId: user.uid,
      goalId,
      goalName: goal.name,
      type: "deposit",
      amount,
      date: getTodayDateString(),
      note: note || "Setoran tabungan",
      createdAt: Date.now(),
    };

    if (isFirebaseConfigured && db) {
      try {
        const goalRef = doc(db, "users", user.uid, "savingsGoals", goalId);
        const moveRef = doc(collection(db, "users", user.uid, "savingsMovements"), movement.id);

        await runTransaction(db, async (txn) => {
          const sfDoc = await txn.get(goalRef);
          if (!sfDoc.exists()) throw new Error("Target tabungan tidak ada!");
          const cur = sfDoc.data().currentAmount || 0;
          txn.update(goalRef, { currentAmount: cur + amount, updatedAt: Date.now() });
          txn.set(moveRef, movement);
        });

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Gagal melakukan setoran tabungan." };
      }
    } else {
      const updatedGoals = savingsGoals.map((g) =>
        g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
      );
      const updatedMoves = [movement, ...savingsMovements];
      setSavingsGoals(updatedGoals);
      setSavingsMovements(updatedMoves);
      saveLocalData(LOCAL_GOALS_KEY, updatedGoals);
      saveLocalData(LOCAL_MOVEMENTS_KEY, updatedMoves);
      return { success: true };
    }
  };

  // Penarikan dari tabungan (Mengembalikan uang dari tabungan ke saldo tersedia)
  const withdrawFromGoal = async (
    goalId: string,
    amount: number,
    note?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Harap login terlebih dahulu." };
    if (amount <= 0) return { success: false, error: "Nominal penarikan harus lebih dari 0." };

    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) return { success: false, error: "Target tabungan tidak ditemukan." };
    if (amount > goal.currentAmount) {
      return {
        success: false,
        error: `Saldo tabungan ini hanya tersisa Rp${goal.currentAmount.toLocaleString("id-ID")}.`,
      };
    }

    const movement: SavingsMovement = {
      id: `move-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId: user.uid,
      goalId,
      goalName: goal.name,
      type: "withdraw",
      amount,
      date: getTodayDateString(),
      note: note || "Penarikan tabungan",
      createdAt: Date.now(),
    };

    if (isFirebaseConfigured && db) {
      try {
        const goalRef = doc(db, "users", user.uid, "savingsGoals", goalId);
        const moveRef = doc(collection(db, "users", user.uid, "savingsMovements"), movement.id);

        await runTransaction(db, async (txn) => {
          const sfDoc = await txn.get(goalRef);
          if (!sfDoc.exists()) throw new Error("Target tabungan tidak ada!");
          const cur = sfDoc.data().currentAmount || 0;
          txn.update(goalRef, { currentAmount: Math.max(0, cur - amount), updatedAt: Date.now() });
          txn.set(moveRef, movement);
        });

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Gagal melakukan penarikan tabungan." };
      }
    } else {
      const updatedGoals = savingsGoals.map((g) =>
        g.id === goalId ? { ...g, currentAmount: Math.max(0, g.currentAmount - amount) } : g
      );
      const updatedMoves = [movement, ...savingsMovements];
      setSavingsGoals(updatedGoals);
      setSavingsMovements(updatedMoves);
      saveLocalData(LOCAL_GOALS_KEY, updatedGoals);
      saveLocalData(LOCAL_MOVEMENTS_KEY, updatedMoves);
      return { success: true };
    }
  };

  const saveBudget = async (
    month: string,
    totalBudget: number,
    categoryBudgets: Record<string, number>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Harap login terlebih dahulu." };

    const budgetId = `budget-${month}`;
    const budgetData: MonthlyBudget = {
      id: budgetId,
      userId: user.uid,
      month,
      totalBudget,
      categoryBudgets,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "users", user.uid, "budgets", budgetId);
        await setDoc(docRef, budgetData, { merge: true });
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Gagal menyimpan anggaran." };
      }
    } else {
      const filtered = budgets.filter((b) => b.month !== month);
      const updated = [budgetData, ...filtered];
      setBudgets(updated);
      saveLocalData(LOCAL_BUDGETS_KEY, updated);
      return { success: true };
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        savingsGoals,
        savingsMovements,
        budgets,
        currentMonthBudget,
        loading,
        initialBalance,
        totalIncome,
        totalExpense,
        totalSavings,
        availableBalance,
        netWorth,
        monthIncome,
        monthExpense,
        remainingBudget,
        budgetUsagePercent,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        depositToGoal,
        withdrawFromGoal,
        saveBudget,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
