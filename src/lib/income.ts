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

export function transformToChartData(records: IncomeRecord[]) {
  return records.map((record) => {
    const income =
      (record.base_salary > 0 ? record.base_salary : 0) +
      (record.overtime_meal > 0 ? record.overtime_meal : 0) +
      (record.housing_fund > 0 ? record.housing_fund : 0) +
      (record.leave_deduction > 0 ? record.leave_deduction : 0);

    const expense = Math.abs(
      (record.housing_fund_deduction < 0 ? record.housing_fund_deduction : 0) +
        (record.medical_insurance < 0 ? record.medical_insurance : 0) +
        (record.pension_insurance < 0 ? record.pension_insurance : 0) +
        (record.unemployment_insurance < 0
          ? record.unemployment_insurance
          : 0) +
        (record.tax < 0 ? record.tax : 0) +
        (record.rent < 0 ? record.rent : 0) +
        (record.leave_deduction < 0 ? record.leave_deduction : 0),
    );

    return {
      month: new Date(record.time).toLocaleDateString("zh-CN", {
        month: "short",
      }),
      income,
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
    leave_deduction: record.leave_deduction >= 0 ? record.leave_deduction : 0,
  }));
}

export function transformToExpenseBreakdownData(records: IncomeRecord[]) {
  return records.map((record) => ({
    month: new Date(record.time).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
    }),
    housing_fund_deduction: Math.abs(record.housing_fund_deduction),
    medical_insurance: Math.abs(record.medical_insurance),
    pension_insurance: Math.abs(record.pension_insurance),
    unemployment_insurance: Math.abs(record.unemployment_insurance),
    tax: Math.abs(record.tax),
    rent: Math.abs(record.rent),
  }));
}
