import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { IncomeMetricDefinition } from "@/lib/income";
import { formatCompactNumber } from "@/lib/utils";

interface IncomeBreakdownChartProps {
  data: Array<Record<string, number | string>>;
  metrics: IncomeMetricDefinition[];
}

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#0f766e",
  "#c2410c",
  "#be185d",
  "#4338ca",
];

export function IncomeBreakdownChart({
  data,
  metrics,
}: IncomeBreakdownChartProps) {
  const chartConfig = Object.fromEntries(
    metrics.map((metric, index) => [
      metric.key,
      {
        label: metric.label,
        color: chartColors[index % chartColors.length],
      },
    ]),
  ) satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>收入明细趋势</CardTitle>
        <CardDescription>各收入子项月度变化</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={data} margin={{ left: 24, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatCompactNumber}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {metrics.map((metric) => (
              <Line
                key={metric.key}
                dataKey={metric.key}
                type="linear"
                stroke={`var(--color-${metric.key})`}
                strokeWidth={2}
                dot={false}
                strokeDasharray={metric.strokeDasharray}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
