import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnnualBonusTable } from "@/components/annual-bonus-table";
import { ExpenseBreakdownChart } from "@/components/expense-breakdown-chart";
import { IncomeBreakdownChart } from "@/components/income-breakdown-chart";
import { IncomeDetailTable } from "@/components/income-detail-table";
import { IncomeExpenseChart } from "@/components/income-expense-chart";
import { IncomeSourceTabs } from "@/components/income-source-tabs";
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
  getIncomeQueryKey,
  INCOME_SOURCES,
  INCOME_SOURCE_MAP,
  type IncomeSourceId,
  transformToChartData,
  transformToExpenseBreakdownData,
  transformToIncomeBreakdownData,
} from "@/lib/income";
import { supabase } from "@/lib/supabase-client";

export const Route = createFileRoute("/")({ component: IncomeHomePage });

const INCOME_SOURCE_STORAGE_KEY = "income:selected-source-tab";

function IncomeHomePage() {
  const [sourceId, setSourceId] = useState<IncomeSourceId>("luo");
  const [hasLoadedStoredSource, setHasLoadedStoredSource] = useState(false);
  const [timeRange, setTimeRange] = useState("6m");
  const activeSource = INCOME_SOURCE_MAP[sourceId];

  const {
    isLoading: luoLoading,
    data: luoData,
    error: luoQueryError,
    refetch: refetchLuo,
  } = useQuery({
    queryKey: getIncomeQueryKey("luo"),
    queryFn: () => fetchIncomeRecords(supabase, "luo"),
  });
  const {
    isLoading: xinLoading,
    data: xinData,
    error: xinQueryError,
    refetch: refetchXin,
  } = useQuery({
    queryKey: getIncomeQueryKey("xin"),
    queryFn: () => fetchIncomeRecords(supabase, "xin"),
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

  const records = sourceId === "luo" ? (luoData ?? []) : (xinData ?? []);
  const loading = sourceId === "luo" ? luoLoading : xinLoading;
  const refetch = sourceId === "luo" ? refetchLuo : refetchXin;
  const queryError = sourceId === "luo" ? luoQueryError : xinQueryError;

  const availableYears = useMemo(() => {
    const years = new Set(records.map((r) => new Date(r.time).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [records]);

  useEffect(() => {
    if (timeRange === "all" || timeRange.endsWith("m")) {
      return;
    }

    const year = Number(timeRange);
    if (!availableYears.includes(year)) {
      setTimeRange("6m");
    }
  }, [availableYears, timeRange]);

  const filteredRecords = useMemo(() => {
    if (timeRange === "all") {
      return records;
    }

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
    () =>
      transformToIncomeBreakdownData(
        filteredRecords,
        activeSource.incomeMetrics,
      ),
    [activeSource.incomeMetrics, filteredRecords],
  );
  const expenseBreakdownData = useMemo(
    () =>
      transformToExpenseBreakdownData(
        filteredRecords,
        activeSource.expenseMetrics,
      ),
    [activeSource.expenseMetrics, filteredRecords],
  );
  const summary = useMemo(() => calculateIncomeSummary(records), [records]);
  const annualBonusRecords = useMemo(
    () =>
      (annualBonusData ?? []).filter(
        (record) => record.owner === activeSource.owner,
      ),
    [activeSource.owner, annualBonusData],
  );

  const error = queryError instanceof Error ? queryError.message : "";
  const annualBonusError =
    annualBonusQueryError instanceof Error ? annualBonusQueryError.message : "";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedSourceId = window.localStorage.getItem(
      INCOME_SOURCE_STORAGE_KEY,
    );
    const matchedSource = INCOME_SOURCES.find(
      (source) => source.id === storedSourceId,
    );

    if (matchedSource) {
      setSourceId(matchedSource.id);
    }

    setHasLoadedStoredSource(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredSource || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(INCOME_SOURCE_STORAGE_KEY, sourceId);
  }, [hasLoadedStoredSource, sourceId]);

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-2 pb-8 sm:px-6 sm:pb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              收入数据
            </h1>
          </div>
          <IncomeSourceTabs
            sources={INCOME_SOURCES}
            value={sourceId}
            onValueChange={setSourceId}
          />
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

                <IncomeBreakdownChart
                  data={incomeBreakdownData}
                  metrics={activeSource.incomeMetrics}
                />

                <ExpenseBreakdownChart
                  data={expenseBreakdownData}
                  metrics={activeSource.expenseMetrics}
                />
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
              <IncomeDetailTable
                key={sourceId}
                data={filteredRecords}
                columns={activeSource.detailColumns}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
