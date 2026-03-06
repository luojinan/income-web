import type { supabase } from "@/lib/supabase-client";

export type AnnualBonusSalaryItem = {
  monthly_salary: number;
  months: number;
};

export type AnnualBonusRecord = {
  id: string;
  owner: string;
  bonus_year: number;
  team_base: number | null;
  base_months: number | null;
  performance_rating: string | null;
  performance_multiplier: number | null;
  salary_breakdown: AnnualBonusSalaryItem[];
  gross_bonus: number;
  tax: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type AnnualBonusRecordRow = Omit<AnnualBonusRecord, "salary_breakdown"> & {
  salary_breakdown: unknown;
};

type SupabaseBrowserClient = typeof supabase;

const ANNUAL_BONUS_TABLE = "annual_bonus_records";

export const ANNUAL_BONUS_QUERY_KEY = ["annual-bonus"] as const;

export async function fetchAnnualBonusRecords(supabase: SupabaseBrowserClient) {
  const { data, error } = await supabase
    .from(ANNUAL_BONUS_TABLE)
    .select("*")
    .order("bonus_year", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as AnnualBonusRecordRow[]).map((record) => ({
    ...record,
    bonus_year: toNumber(record.bonus_year),
    team_base: toNullableNumber(record.team_base),
    base_months: toNullableNumber(record.base_months),
    performance_multiplier: toNullableNumber(record.performance_multiplier),
    gross_bonus: toNumber(record.gross_bonus),
    tax: toNumber(record.tax),
    salary_breakdown: normalizeSalaryBreakdown(record.salary_breakdown),
  }));
}

export function calculateAnnualBonusSummary(record: AnnualBonusRecord) {
  const netBonus = record.gross_bonus - record.tax;

  return {
    netBonus,
    avgMonthlyGross: record.gross_bonus / 12,
    avgMonthlyNet: netBonus / 12,
  };
}

export function hasAnnualBonusParameters(record: AnnualBonusRecord) {
  return Boolean(
    record.team_base !== null ||
      record.base_months !== null ||
      record.performance_rating ||
      record.performance_multiplier !== null ||
      record.salary_breakdown.length > 0,
  );
}

function normalizeSalaryBreakdown(value: unknown): AnnualBonusSalaryItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const monthlySalary = toNullableNumber(
      Reflect.get(item, "monthly_salary") as unknown,
    );
    const months = toNullableNumber(Reflect.get(item, "months") as unknown);

    if (monthlySalary === null || months === null) {
      return [];
    }

    return [{ monthly_salary: monthlySalary, months }];
  });
}

function toNumber(value: unknown) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function toNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}
