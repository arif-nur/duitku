"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFinance } from "@/context/FinanceContext";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { StatCards } from "@/components/dashboard/StatCards";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { CategorySummary } from "@/components/dashboard/CategorySummary";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { SavingsGoalModal } from "@/components/savings/SavingsGoalModal";
import { SavingsMovementModal } from "@/components/savings/SavingsMovementModal";
import { Transaction, SavingsGoal, TransactionType } from "@/types";
import { formatTanggalIndo } from "@/lib/utils";
import { Sparkles, Database, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { userProfile, isFirebaseActive } = useAuth();
  const {
    transactions,
    savingsGoals,
    availableBalance,
    totalSavings,
    netWorth,
    monthIncome,
    monthExpense,
    remainingBudget,
    budgetUsagePercent,
    currentMonthBudget,
  } = useFinance();

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<TransactionType>("expense");
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [moveMode, setMoveMode] = useState<"deposit" | "withdraw">("deposit");

  const todayStr = formatTanggalIndo(new Date());

  const handleOpenAddIncome = () => {
    setEditingTx(null);
    setTxModalType("income");
    setIsTxModalOpen(true);
  };

  const handleOpenAddExpense = () => {
    setEditingTx(null);
    setTxModalType("expense");
    setIsTxModalOpen(true);
  };

  const handleOpenAddSavings = () => {
    if (savingsGoals.length > 0) {
      setSelectedGoal(savingsGoals[0]);
      setMoveMode("deposit");
      setIsMoveModalOpen(true);
    } else {
      setIsGoalModalOpen(true);
    }
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTx(tx);
    setTxModalType(tx.type);
    setIsTxModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Halo, {userProfile?.displayName || "Sobat DuitKu"}! 👋
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {todayStr} • Kelola keuangan dengan bijak dan terencana.
          </p>
        </div>

        {/* Database Mode Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
              isFirebaseActive
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isFirebaseActive ? "Cloud Firestore Aktif" : "Local Engine (Siap Pakai)"}</span>
          </div>
        </div>
      </div>

      {/* Main Balance Card */}
      <BalanceCard
        availableBalance={availableBalance}
        totalSavings={totalSavings}
        netWorth={netWorth}
      />

      {/* Quick Action Buttons */}
      <QuickActions
        onAddIncome={handleOpenAddIncome}
        onAddExpense={handleOpenAddExpense}
        onAddSavings={handleOpenAddSavings}
      />

      {/* 4 Stat Cards */}
      <StatCards
        monthIncome={monthIncome}
        monthExpense={monthExpense}
        totalSavings={totalSavings}
        remainingBudget={remainingBudget}
        budgetUsagePercent={budgetUsagePercent}
        hasBudget={Boolean(currentMonthBudget)}
      />

      {/* Two Column Layout: Charts & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Financial Chart & Recent Transactions */}
        <div className="lg:col-span-2 space-y-6">
          <FinancialChart transactions={transactions} />
          <RecentTransactions
            transactions={transactions}
            onEdit={handleEditTransaction}
          />
        </div>

        {/* Right 1 Col: Category Summary & Savings Goals Shortcut */}
        <div className="space-y-6">
          <CategorySummary transactions={transactions} />

          {/* Savings Mini Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Tabungan Impian
              </h3>
              <Link
                href="/savings"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1"
              >
                Semua
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {savingsGoals.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xs text-slate-400 mb-3">Belum ada target tabungan.</p>
                <button
                  onClick={() => setIsGoalModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm"
                >
                  + Buat Target
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {savingsGoals.slice(0, 3).map((goal) => {
                  const pct =
                    goal.targetAmount > 0
                      ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                      : 0;
                  return (
                    <div
                      key={goal.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
                    >
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-slate-800 dark:text-slate-200 truncate">{goal.name}</span>
                        <span className="text-emerald-600 dark:text-emerald-400">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Modal (Add/Edit) */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        initialType={txModalType}
        editingTransaction={editingTx}
      />

      {/* Savings Goal Modal (Create) */}
      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
      />

      {/* Savings Movement Modal (Deposit/Withdraw) */}
      <SavingsMovementModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        goal={selectedGoal}
        mode={moveMode}
      />
    </div>
  );
}
