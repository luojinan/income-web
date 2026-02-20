import type { IncomeSummaryStats } from "@/lib/income";

const formatter = new Intl.NumberFormat("zh-CN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatAmount(value: number) {
  return formatter.format(value);
}

export function IncomeSummaryCard({
  summary,
}: {
  summary: IncomeSummaryStats | null;
}) {
  if (!summary) {
    return (
      <section className="space-y-2 px-1">
        <p className="text-sm text-muted-foreground">暂无收入记录</p>
      </section>
    );
  }

  return (
    <section className="space-y-3 px-1">
      <p className="text-sm text-muted-foreground">{summary.rangeTitle}</p>
      <div className="space-y-2 text-sm sm:text-base">
        <p>至今到手总收入：{formatAmount(summary.totalNetIncome)}</p>
        <p>至今税前总收入：{formatAmount(summary.totalGrossIncome)}</p>
        <p>至今税金房租总支出：{formatAmount(summary.totalExpense)}</p>
        <p>至今平均到手月入：{formatAmount(summary.avgMonthlyNetIncome)}</p>
        <p>预计到手年入：{formatAmount(summary.estimatedAnnualNetIncome)}</p>
        <p>预计税前年入：{formatAmount(summary.estimatedAnnualGrossIncome)}</p>
      </div>
    </section>
  );
}
