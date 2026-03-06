import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnnualBonusTable } from "@/components/annual-bonus-table";
import { ExpenseBreakdownChart } from "@/components/expense-breakdown-chart";
import { IncomeBreakdownChart } from "@/components/income-breakdown-chart";
import { IncomeDetailTable } from "@/components/income-detail-table";
import { IncomeExpenseChart } from "@/components/income-expense-chart";
import { IncomeSummaryCard } from "@/components/income-summary-card";
import { TimeRangeSelect } from "@/components/time-range-select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ANNUAL_BONUS_QUERY_KEY,
  fetchAnnualBonusRecords,
} from "@/lib/annual-bonus";
import {
  calculateIncomeSummary,
  fetchIncomeRecords,
  INCOME_QUERY_KEY,
  transformToChartData,
  transformToExpenseBreakdownData,
  transformToIncomeBreakdownData,
} from "@/lib/income";
import { supabase } from "@/lib/supabase-client";

export const Route = createFileRoute("/")({ component: IncomeHomePage });

function IncomeHomePage() {
  const {
    isLoading: loading,
    data,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: INCOME_QUERY_KEY,
    queryFn: () => fetchIncomeRecords(supabase),
  });
  const {
    isLoading: annualBonusLoading,
    data: annualBonusData,
    error: annualBonusQueryError,
    refetch: refetchAnnualBonus,
  } = useQuery({
    queryKey: ANNUAL_BONUS_QUERY_KEY,
    queryFn: () => fetchAnnualBonusRecords(supabase),
  });

  const records = data ?? [];
  const annualBonusRecords = annualBonusData ?? [];
  const [timeRange, setTimeRange] = useState("6m");

  const availableYears = useMemo(() => {
    const years = new Set(records.map((r) => new Date(r.time).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (timeRange === "all") return records;

    if (timeRange.endsWith("m")) {
      const count = parseInt(timeRange, 10);
      return records.slice(-count);
    }

    const year = parseInt(timeRange, 10);
    return records.filter((r) => new Date(r.time).getFullYear() === year);
  }, [records, timeRange]);

  const chartData = useMemo(
    () => transformToChartData(filteredRecords),
    [filteredRecords],
  );
  const incomeBreakdownData = useMemo(
    () => transformToIncomeBreakdownData(filteredRecords),
    [filteredRecords],
  );
  const expenseBreakdownData = useMemo(
    () => transformToExpenseBreakdownData(filteredRecords),
    [filteredRecords],
  );
  const summary = useMemo(() => calculateIncomeSummary(records), [records]);

  const error = queryError instanceof Error ? queryError.message : "";
  const annualBonusError =
    annualBonusQueryError instanceof Error ? annualBonusQueryError.message : "";

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-2 pb-8 sm:px-6 sm:pb-10">
        <div className="flex items-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            收入数据
          </h1>
        </div>

        {error && (
          <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                refetch();
              }}
            >
              重试
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col gap-6">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="bg-card h-64 animate-pulse rounded-xl border"
              />
            ))}
          </div>
        )}

        {!loading && !error && (
          <div className="flex flex-col gap-6">
            <IncomeSummaryCard summary={summary} />

            <div className="flex justify-end">
              <TimeRangeSelect
                value={timeRange}
                onValueChange={setTimeRange}
                availableYears={availableYears}
              />
            </div>

            {filteredRecords.length > 0 && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>收支总览</CardTitle>
                    <CardDescription>每月收入与支出对比</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <IncomeExpenseChart data={chartData} />
                  </CardContent>
                </Card>

                <IncomeBreakdownChart data={incomeBreakdownData} />

                <ExpenseBreakdownChart data={expenseBreakdownData} />
              </>
            )}

            <AnnualBonusTable
              data={annualBonusRecords}
              loading={annualBonusLoading}
              error={annualBonusError}
              onRetry={() => {
                refetchAnnualBonus();
              }}
            />

            {filteredRecords.length > 0 && (
              <IncomeDetailTable data={filteredRecords} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
