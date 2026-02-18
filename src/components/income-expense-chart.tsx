import { Bar, BarChart, XAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface IncomeExpenseChartProps {
  data: { month: string; income: number; expense: number }[];
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

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  return (
    <ChartContainer config={chartConfig}>
      <BarChart data={data}>
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
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
        <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
      </BarChart>
    </ChartContainer>
  );
}
