export type TransactionType = "income" | "expense";

export type PaymentMethod = "tunai" | "bank" | "ewallet";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  note?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  note?: string;
  color?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface SavingsMovement {
  id: string;
  userId: string;
  goalId: string;
  goalName: string;
  type: "deposit" | "withdraw";
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: number;
}

export interface MonthlyBudget {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  totalBudget: number;
  categoryBudgets: Record<string, number>;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName?: string | null;
  initialBalance: number;
  createdAt: number;
  theme?: "light" | "dark" | "system";
}

export const INCOME_CATEGORIES = [
  "Gaji",
  "Uang Saku",
  "Freelance",
  "Bisnis",
  "Bonus",
  "Investasi",
  "Hadiah",
  "Lainnya",
] as const;

export const EXPENSE_CATEGORIES = [
  "Makanan",
  "Transportasi",
  "Belanja",
  "Pendidikan",
  "Tagihan",
  "Hiburan",
  "Kesehatan",
  "Kebutuhan Pribadi",
  "Keluarga",
  "Lainnya",
] as const;

export const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: "tunai", label: "Tunai (Cash)" },
  { id: "bank", label: "Rekening Bank (Transfer)" },
  { id: "ewallet", label: "E-Wallet (GoPay, OVO, Dana, dll)" },
];
