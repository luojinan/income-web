import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { formatCompactNumber } from "@/lib/utils";

interface IncomeExpenseChartProps {
  data: {
    month: string;
    netIncome: number;
    incomeGross: number;
    expense: number;
  }[];
}

const chartConfig = {
  netIncome: {
    label: "到手金额",
    color: "var(--chart-1)",
  },
  expense: {
    label: "支出",
    color: "var(--chart-2)",
  },
  incomeGross: {
    label: "收入",
    color: "var(--chart-3)",
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
          dataKey="netIncome"
          stackId="a"
          fill="var(--color-netIncome)"
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
            const current = props.payload?.[0]?.payload as
              | {
                  month: string;
                  netIncome: number;
                  incomeGross: number;
                  expense: number;
                }
              | undefined;

            if (!props.active || !current) {
              return null;
            }

            const rows = [
              {
                key: "incomeGross",
                label: "收入",
                value: current.incomeGross,
                color: "#9ca3af",
              },
              {
                key: "expense",
                label: "支出",
                value: current.expense,
                color: "var(--color-expense)",
              },
              {
                key: "netIncome",
                label: "到手",
                value: current.netIncome,
                color: "var(--color-netIncome)",
              },
            ];

            return (
              <div className="border-border/50 bg-background grid min-w-32 items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
                <div className="font-medium">{current.month}</div>
                <div className="grid gap-1.5">
                  {rows.map((row) => (
                    <div
                      key={row.key}
                      className="flex w-full items-center gap-2 leading-none"
                    >
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: row.color }}
                      />
                      <div className="flex flex-1 items-center justify-between">
                        <span className="text-muted-foreground">
                          {row.label}
                        </span>
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {tooltipNumberFormatter.format(row.value)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }}
          cursor={false}
        />
      </BarChart>
    </ChartContainer>
  );
}
