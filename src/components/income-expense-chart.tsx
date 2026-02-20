import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCompactNumber } from "@/lib/utils";

interface IncomeExpenseChartProps {
  data: { month: string; income: number; incomeGross: number; expense: number }[];
}

const chartConfig = {
  income: {
    label: "收入",
    color: "var(--chart-1)",
  },
  expense: {
    label: "支出",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const tooltipNumberFormatter = new Intl.NumberFormat("zh-CN", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  return (
    <ChartContainer config={chartConfig}>
      <BarChart data={data}>
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={formatCompactNumber}
        />
        <Bar
          dataKey="income"
          stackId="a"
          fill="var(--color-income)"
          radius={[0, 0, 4, 4]}
        />
        <Bar
          dataKey="expense"
          stackId="a"
          fill="var(--color-expense)"
          radius={[4, 4, 0, 0]}
        />
        <ChartTooltip
          content={(props) => {
            const orderedPayload = [...(props.payload ?? [])].sort((a, b) => {
              const aKey = `${a.dataKey ?? ""}`;
              const bKey = `${b.dataKey ?? ""}`;
              if (aKey === bKey) return 0;
              if (aKey === "expense") return -1;
              if (bKey === "expense") return 1;
              return 0;
            });

            return (
              <ChartTooltipContent
                {...props}
                payload={orderedPayload}
                formatter={(value, _name, item) => {
                  const rawDisplayValue =
                    item.dataKey === "income"
                      ? item.payload.incomeGross
                      : Number(value);
                  const displayValue = Number.isFinite(rawDisplayValue)
                    ? rawDisplayValue
                    : 0;
                  const label = item.dataKey === "income" ? "收入" : "支出";
                  const indicatorColor = item.payload.fill || item.color;

                  return (
                    <>
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: indicatorColor }}
                      />
                      <div className="flex flex-1 items-center justify-between leading-none">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {tooltipNumberFormatter.format(displayValue)}
                        </span>
                      </div>
                    </>
                  );
                }}
              />
            );
          }}
          cursor={false}
        />
      </BarChart>
    </ChartContainer>
  );
}
