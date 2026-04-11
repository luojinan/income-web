import type { supabase } from "@/lib/supabase-client";

type SupabaseBrowserClient = typeof supabase;

type IncomeRecordBase = {
  id: string;
  owner: string;
  time: string;
};

type LuoIncomeRow = IncomeRecordBase & {
  base_salary: unknown;
  overtime_meal: unknown;
  housing_fund: unknown;
  leave_deduction: unknown;
  housing_fund_deduction: unknown;
  medical_insurance: unknown;
  pension_insurance: unknown;
  unemployment_insurance: unknown;
  tax: unknown;
  rent: unknown;
};

type XinIncomeRow = IncomeRecordBase & {
  base_salary: unknown;
  project_position_subsidy: unknown;
  performance_bonus: unknown;
  overtime_pay: unknown;
  quarterly_bonus: unknown;
  personal_leave_deduction: unknown;
  sick_leave_deduction: unknown;
  housing_fund_deduction: unknown;
  medical_insurance: unknown;
  pension_insurance: unknown;
  unemployment_insurance: unknown;
  tax: unknown;
  rent: unknown;
};

export type IncomeSourceId = "luo" | "xin";

export type IncomeMetricDefinition = {
  key: string;
  label: string;
  strokeDasharray?: string;
};

export type IncomeDetailColumn = {
  key: string;
  label: string;
};

export type IncomeDisplayRecord = {
  id: string;
  owner: string;
  time: string;
  grossIncome: number;
  expense: number;
  netIncome: number;
  detailValues: Record<string, number>;
  incomeBreakdown: Record<string, number>;
  expenseBreakdown: Record<string, number>;
};

export type IncomeSourceDefinition = {
  id: IncomeSourceId;
  label: string;
  owner: string;
  tableName: string;
  incomeMetrics: IncomeMetricDefinition[];
  expenseMetrics: IncomeMetricDefinition[];
  detailColumns: IncomeDetailColumn[];
  normalizeRecord: (record: unknown) => IncomeDisplayRecord;
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

const luoIncomeSource = {
  id: "luo",
  label: "Luo",
  owner: "luo",
  tableName: "income",
  incomeMetrics: [
    { key: "base_salary", label: "基本工资" },
    { key: "overtime_meal", label: "加班餐补" },
    { key: "housing_fund", label: "住房公积金" },
  ],
  expenseMetrics: [
    { key: "leave_deduction", label: "请假扣款" },
    { key: "housing_fund_deduction", label: "公积金" },
    { key: "medical_insurance", label: "医保" },
    { key: "pension_insurance", label: "养老保险" },
    { key: "unemployment_insurance", label: "失业保险" },
    { key: "tax", label: "个税" },
    { key: "rent", label: "房租", strokeDasharray: "5 5" },
  ],
  detailColumns: [
    { key: "base_salary", label: "底薪" },
    { key: "overtime_meal", label: "加班餐补" },
    { key: "housing_fund", label: "公积金" },
    { key: "leave_deduction", label: "请假扣款" },
    { key: "housing_fund_deduction", label: "公积金扣除" },
    { key: "medical_insurance", label: "医疗保险" },
    { key: "pension_insurance", label: "养老保险" },
    { key: "unemployment_insurance", label: "失业保险" },
    { key: "tax", label: "个税" },
    { key: "rent", label: "房租" },
  ],
  normalizeRecord: normalizeLuoIncomeRecord,
} satisfies IncomeSourceDefinition;

const xinIncomeSource = {
  id: "xin",
  label: "Xin",
  owner: "xin",
  tableName: "income-xin",
  incomeMetrics: [
    { key: "base_salary", label: "基本工资" },
    { key: "project_position_subsidy", label: "项目岗位补贴" },
    { key: "performance_bonus", label: "绩效奖金" },
    { key: "overtime_pay", label: "加班费" },
    { key: "quarterly_bonus", label: "季度奖金" },
  ],
  expenseMetrics: [
    { key: "personal_leave_deduction", label: "事假扣款" },
    { key: "sick_leave_deduction", label: "病假扣款" },
    { key: "housing_fund_deduction", label: "公积金" },
    { key: "medical_insurance", label: "医保" },
    { key: "pension_insurance", label: "养老保险" },
    { key: "unemployment_insurance", label: "失业保险" },
    { key: "tax", label: "个税" },
    { key: "rent", label: "房租", strokeDasharray: "5 5" },
  ],
  detailColumns: [
    { key: "base_salary", label: "底薪" },
    { key: "project_position_subsidy", label: "项目岗位补贴" },
    { key: "performance_bonus", label: "绩效奖金" },
    { key: "overtime_pay", label: "加班费" },
    { key: "quarterly_bonus", label: "季度奖金" },
    { key: "personal_leave_deduction", label: "事假扣款" },
    { key: "sick_leave_deduction", label: "病假扣款" },
    { key: "housing_fund_deduction", label: "公积金扣除" },
    { key: "medical_insurance", label: "医疗保险" },
    { key: "pension_insurance", label: "养老保险" },
    { key: "unemployment_insurance", label: "失业保险" },
    { key: "tax", label: "个税" },
    { key: "rent", label: "房租" },
  ],
  normalizeRecord: normalizeXinIncomeRecord,
} satisfies IncomeSourceDefinition;

export const INCOME_SOURCES = [luoIncomeSource, xinIncomeSource];

export const INCOME_SOURCE_MAP = Object.fromEntries(
  INCOME_SOURCES.map((source) => [source.id, source]),
) as Record<IncomeSourceId, IncomeSourceDefinition>;

export function getIncomeQueryKey(sourceId: IncomeSourceId) {
  return ["income", sourceId] as const;
}

export async function fetchIncomeRecords(
  supabase: SupabaseBrowserClient,
  sourceId: IncomeSourceId,
) {
  const source = INCOME_SOURCE_MAP[sourceId];
  const { data, error } = await supabase
    .from(source.tableName)
    .select("*")
    .order("time", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(source.normalizeRecord);
}

export function calculateIncomeSummary(
  records: IncomeDisplayRecord[],
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

      return {
        totalGrossIncome: acc.totalGrossIncome + record.grossIncome,
        totalExpense: acc.totalExpense + record.expense,
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

export function transformToChartData(records: IncomeDisplayRecord[]) {
  return records.map((record) => ({
    month: new Date(record.time).toLocaleDateString("zh-CN", {
      month: "short",
    }),
    netIncome: record.netIncome,
    incomeGross: record.grossIncome,
    expense: record.expense,
  }));
}

export function transformToIncomeBreakdownData(
  records: IncomeDisplayRecord[],
  metrics: IncomeMetricDefinition[],
) {
  return transformToBreakdownData(records, metrics, "incomeBreakdown");
}

export function transformToExpenseBreakdownData(
  records: IncomeDisplayRecord[],
  metrics: IncomeMetricDefinition[],
) {
  return transformToBreakdownData(records, metrics, "expenseBreakdown");
}

function transformToBreakdownData(
  records: IncomeDisplayRecord[],
  metrics: IncomeMetricDefinition[],
  key: "incomeBreakdown" | "expenseBreakdown",
) {
  return records.map((record) => ({
    month: new Date(record.time).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
    }),
    ...Object.fromEntries(
      metrics.map((metric) => [metric.key, record[key][metric.key] ?? 0]),
    ),
  }));
}

function normalizeLuoIncomeRecord(record: unknown): IncomeDisplayRecord {
  const row = record as LuoIncomeRow;
  const baseSalary = toNumber(row.base_salary);
  const overtimeMeal = toNumber(row.overtime_meal);
  const housingFund = toNumber(row.housing_fund);
  const leaveDeduction = toNumber(row.leave_deduction);
  const housingFundDeduction = toNumber(row.housing_fund_deduction);
  const medicalInsurance = toNumber(row.medical_insurance);
  const pensionInsurance = toNumber(row.pension_insurance);
  const unemploymentInsurance = toNumber(row.unemployment_insurance);
  const tax = toNumber(row.tax);
  const rent = toNumber(row.rent);

  const incomeBreakdown = {
    base_salary: getPositive(baseSalary),
    overtime_meal: getPositive(overtimeMeal),
    housing_fund: getPositive(housingFund),
  };

  const expenseBreakdown = {
    leave_deduction: Math.abs(getNegative(leaveDeduction)),
    housing_fund_deduction: Math.abs(getNegative(housingFundDeduction)),
    medical_insurance: Math.abs(getNegative(medicalInsurance)),
    pension_insurance: Math.abs(getNegative(pensionInsurance)),
    unemployment_insurance: Math.abs(getNegative(unemploymentInsurance)),
    tax: Math.abs(getNegative(tax)),
    rent: Math.abs(getNegative(rent)),
  };

  const grossIncome = sumValues(incomeBreakdown) + getPositive(leaveDeduction);
  const expense = sumValues(expenseBreakdown);

  return {
    id: row.id,
    owner: row.owner,
    time: row.time,
    grossIncome,
    expense,
    netIncome: grossIncome - expense,
    detailValues: {
      base_salary: baseSalary,
      overtime_meal: overtimeMeal,
      housing_fund: housingFund,
      leave_deduction: leaveDeduction,
      housing_fund_deduction: housingFundDeduction,
      medical_insurance: medicalInsurance,
      pension_insurance: pensionInsurance,
      unemployment_insurance: unemploymentInsurance,
      tax,
      rent,
    },
    incomeBreakdown,
    expenseBreakdown,
  };
}

function normalizeXinIncomeRecord(record: unknown): IncomeDisplayRecord {
  const row = record as XinIncomeRow;
  const baseSalary = toNumber(row.base_salary);
  const projectPositionSubsidy = toNumber(row.project_position_subsidy);
  const performanceBonus = toNumber(row.performance_bonus);
  const overtimePay = toNumber(row.overtime_pay);
  const quarterlyBonus = toNumber(row.quarterly_bonus);
  const personalLeaveDeduction = toNumber(row.personal_leave_deduction);
  const sickLeaveDeduction = toNumber(row.sick_leave_deduction);
  const housingFundDeduction = toNumber(row.housing_fund_deduction);
  const medicalInsurance = toNumber(row.medical_insurance);
  const pensionInsurance = toNumber(row.pension_insurance);
  const unemploymentInsurance = toNumber(row.unemployment_insurance);
  const tax = toNumber(row.tax);
  const rent = toNumber(row.rent);

  const incomeBreakdown = {
    base_salary: getPositive(baseSalary),
    project_position_subsidy: getPositive(projectPositionSubsidy),
    performance_bonus: getPositive(performanceBonus),
    overtime_pay: getPositive(overtimePay),
    quarterly_bonus: getPositive(quarterlyBonus),
  };

  const expenseBreakdown = {
    personal_leave_deduction: Math.abs(getNegative(personalLeaveDeduction)),
    sick_leave_deduction: Math.abs(getNegative(sickLeaveDeduction)),
    housing_fund_deduction: Math.abs(getNegative(housingFundDeduction)),
    medical_insurance: Math.abs(getNegative(medicalInsurance)),
    pension_insurance: Math.abs(getNegative(pensionInsurance)),
    unemployment_insurance: Math.abs(getNegative(unemploymentInsurance)),
    tax: Math.abs(getNegative(tax)),
    rent: Math.abs(getNegative(rent)),
  };

  const grossIncome = sumValues(incomeBreakdown);
  const expense = sumValues(expenseBreakdown);

  return {
    id: row.id,
    owner: row.owner,
    time: row.time,
    grossIncome,
    expense,
    netIncome: grossIncome - expense,
    detailValues: {
      base_salary: baseSalary,
      project_position_subsidy: projectPositionSubsidy,
      performance_bonus: performanceBonus,
      overtime_pay: overtimePay,
      quarterly_bonus: quarterlyBonus,
      personal_leave_deduction: personalLeaveDeduction,
      sick_leave_deduction: sickLeaveDeduction,
      housing_fund_deduction: housingFundDeduction,
      medical_insurance: medicalInsurance,
      pension_insurance: pensionInsurance,
      unemployment_insurance: unemploymentInsurance,
      tax,
      rent,
    },
    incomeBreakdown,
    expenseBreakdown,
  };
}

function formatRangeMonth(date: Date) {
  return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, "0")}月`;
}

function getPositive(value: number) {
  return value > 0 ? value : 0;
}

function getNegative(value: number) {
  return value < 0 ? value : 0;
}

function sumValues(values: Record<string, number>) {
  return Object.values(values).reduce((total, value) => total + value, 0);
}

function toNumber(value: unknown) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}
