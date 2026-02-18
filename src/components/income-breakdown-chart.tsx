import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
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

interface IncomeBreakdownChartProps {
  data: {
    month: string;
    base_salary: number;
    overtime_meal: number;
    housing_fund: number;
    leave_deduction: number;
  }[];
}

const chartConfig = {
  base_salary: {
    label: "基本工资",
    color: "var(--chart-1)",
  },
  overtime_meal: {
    label: "加班餐补",
    color: "var(--chart-2)",
  },
  housing_fund: {
    label: "住房公积金",
    color: "var(--chart-3)",
  },
  leave_deduction: {
    label: "请假扣款",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function IncomeBreakdownChart({ data }: IncomeBreakdownChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>收入明细趋势</CardTitle>
        <CardDescription>各收入子项月度变化</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="base_salary"
              type="linear"
              stroke="var(--color-base_salary)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="overtime_meal"
              type="linear"
              stroke="var(--color-overtime_meal)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="housing_fund"
              type="linear"
              stroke="var(--color-housing_fund)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="leave_deduction"
              type="linear"
              stroke="var(--color-leave_deduction)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
