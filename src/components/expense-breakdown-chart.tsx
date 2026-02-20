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
import { formatCompactNumber } from "@/lib/utils";

interface ExpenseBreakdownChartProps {
  data: {
    month: string;
    housing_fund_deduction: number;
    medical_insurance: number;
    pension_insurance: number;
    unemployment_insurance: number;
    tax: number;
    rent: number;
  }[];
}

const chartConfig = {
  housing_fund_deduction: {
    label: "公积金",
    color: "var(--chart-1)",
  },
  medical_insurance: {
    label: "医保",
    color: "var(--chart-2)",
  },
  pension_insurance: {
    label: "养老保险",
    color: "var(--chart-3)",
  },
  unemployment_insurance: {
    label: "失业保险",
    color: "var(--chart-4)",
  },
  tax: {
    label: "个税",
    color: "var(--chart-5)",
  },
  rent: {
    label: "房租",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ExpenseBreakdownChart({ data }: ExpenseBreakdownChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>支出明细趋势</CardTitle>
        <CardDescription>各支出子项月度变化</CardDescription>
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
            <Line
              dataKey="housing_fund_deduction"
              type="linear"
              stroke="var(--color-housing_fund_deduction)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="medical_insurance"
              type="linear"
              stroke="var(--color-medical_insurance)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="pension_insurance"
              type="linear"
              stroke="var(--color-pension_insurance)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="unemployment_insurance"
              type="linear"
              stroke="var(--color-unemployment_insurance)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="tax"
              type="linear"
              stroke="var(--color-tax)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="rent"
              type="linear"
              stroke="var(--color-rent)"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
