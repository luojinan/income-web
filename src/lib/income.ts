import type { supabase } from "@/lib/supabase-client";

export type IncomeRecord = {
  id: string;
  owner: string;
  time: string;
  base_salary: number;
  overtime_meal: number;
  housing_fund: number;
  leave_deduction: number;
  housing_fund_deduction: number;
  medical_insurance: number;
  pension_insurance: number;
  unemployment_insurance: number;
  tax: number;
  rent: number;
};

export type IncomeSummaryStats = {
  rangeTitle: string;
  totalNetIncome: number;
  totalGrossIncome: number;
  totalExpense: number;
  avgMonthlyNetIncome: number;
  estimatedAnnualNetIncome: number;
  estimatedAnnualGrossIncome: number;
};

type SupabaseBrowserClient = typeof supabase;

const INCOME_TABLE = "income";

export const INCOME_QUERY_KEY = ["income"] as const;

export async function fetchIncomeRecords(supabase: SupabaseBrowserClient) {
  const { data, error } = await supabase
    .from(INCOME_TABLE)
    .select("*")
    .order("time", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as IncomeRecord[];
}

function getPositive(value: number) {
  return value > 0 ? value : 0;
}

function getNegative(value: number) {
  return value < 0 ? value : 0;
}

function calculateGrossIncome(record: IncomeRecord) {
  return (
    getPositive(record.base_salary) +
    getPositive(record.overtime_meal) +
    getPositive(record.housing_fund) +
    getPositive(record.leave_deduction)
  );
}

function calculateExpense(record: IncomeRecord) {
  return Math.abs(
    getNegative(record.housing_fund_deduction) +
      getNegative(record.medical_insurance) +
      getNegative(record.pension_insurance) +
      getNegative(record.unemployment_insurance) +
      getNegative(record.tax) +
      getNegative(record.rent) +
      getNegative(record.leave_deduction),
  );
}

function formatRangeMonth(date: Date) {
  return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, "0")}月`;
}

export function calculateIncomeSummary(
  records: IncomeRecord[],
): IncomeSummaryStats | null {
  if (records.length === 0) {
    return null;
  }

  let earliest = new Date(records[0].time);
  let latest = new Date(records[0].time);

  const totals = records.reduce(
    (acc, record) => {
      const date = new Date(record.time);
      if (date < earliest) {
        earliest = date;
      }
      if (date > latest) {
        latest = date;
      }

      const grossIncome = calculateGrossIncome(record);
      const expense = calculateExpense(record);

      return {
        totalGrossIncome: acc.totalGrossIncome + grossIncome,
        totalExpense: acc.totalExpense + expense,
      };
    },
    {
      totalGrossIncome: 0,
      totalExpense: 0,
    },
  );

  const totalNetIncome = totals.totalGrossIncome - totals.totalExpense;
  const avgMonthlyNetIncome = totalNetIncome / records.length;

  return {
    rangeTitle: `${formatRangeMonth(earliest)}-${formatRangeMonth(latest)}(${records.length})`,
    totalNetIncome,
    totalGrossIncome: totals.totalGrossIncome,
    totalExpense: totals.totalExpense,
    avgMonthlyNetIncome,
    estimatedAnnualNetIncome: avgMonthlyNetIncome * 12,
    estimatedAnnualGrossIncome: (totals.totalGrossIncome / records.length) * 12,
  };
}

export function transformToChartData(records: IncomeRecord[]) {
  return records.map((record) => {
    const incomeGross = calculateGrossIncome(record);
    const expense = calculateExpense(record);
    const netIncome = incomeGross - expense;

    return {
      month: new Date(record.time).toLocaleDateString("zh-CN", {
        month: "short",
      }),
      netIncome,
      incomeGross,
      expense,
    };
  });
}

export function transformToIncomeBreakdownData(records: IncomeRecord[]) {
  return records.map((record) => ({
    month: new Date(record.time).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
    }),
    base_salary: record.base_salary,
    overtime_meal: record.overtime_meal,
    housing_fund: record.housing_fund,
  }));
}

export function transformToExpenseBreakdownData(records: IncomeRecord[]) {
  return records.map((record) => ({
    month: new Date(record.time).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
    }),
    leave_deduction: Math.abs(record.leave_deduction),
    housing_fund_deduction: Math.abs(record.housing_fund_deduction),
    medical_insurance: Math.abs(record.medical_insurance),
    pension_insurance: Math.abs(record.pension_insurance),
    unemployment_insurance: Math.abs(record.unemployment_insurance),
    tax: Math.abs(record.tax),
    rent: Math.abs(record.rent),
  }));
}
