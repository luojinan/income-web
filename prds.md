# 收入数据图表

## 需求描述

实现一个收入数据可视化图表页面，用于展示每月的收入与支出情况。页面需要同时适配移动端和 PC 端。

### 数据来源

数据从 Supabase 数据库获取，单条数据结构如下：

```ts
interface IncomeRecord {
  id: string
  owner: string
  time: string // ISO 8601 日期，如 "2026-01-01T00:00:00+00:00"
  base_salary: number // 基本工资
  overtime_meal: number // 加班餐补
  housing_fund: number // 住房公积金（收入项）
  leave_deduction: number // 请假扣款
  housing_fund_deduction: number // 公积金扣除（负数）
  medical_insurance: number // 医保扣除（负数）
  pension_insurance: number // 养老保险扣除（负数）
  unemployment_insurance: number // 失业保险扣除（负数）
  tax: number // 个税扣除（负数）
  rent: number // 房租支出（负数）
}
```

### 数据处理逻辑

每条记录需要计算以下值：

- **总收入**：所有正数字段之和（`base_salary` + `overtime_meal` + `housing_fund` + `leave_deduction`（当 >= 0 时））
- **总支出**：所有负数字段的绝对值之和（`housing_fund_deduction` + `medical_insurance` + `pension_insurance` + `unemployment_insurance` + `tax` + `rent` + `leave_deduction`（当 < 0 时）），取绝对值后为正数用于图表展示
- **细分收入项**：保留每条记录的 `base_salary`、`overtime_meal`、`housing_fund`、`leave_deduction`（当 >= 0 时，否则为 0）作为独立字段
- **细分支出项**：保留每条记录的 `housing_fund_deduction`、`medical_insurance`、`pension_insurance`、`unemployment_insurance`、`tax`、`rent`、`leave_deduction`（当 < 0 时）取绝对值作为独立字段

### 图表展示

页面包含 3 个图表，均使用 shadcn/ui 的 Chart 组件（基于 Recharts），在移动端和 PC 端都能正常展示和交互。

#### 图表 1：收支总览堆叠柱状图

- X 轴：月份（如 "1月"、"2月"）
- 每根柱子由 2 段颜色堆叠组成：
  - 下半段（`--chart-1`）：当月总收入
  - 上半段（`--chart-2`）：当月总支出（绝对值）
- 悬浮 Tooltip 显示该月收入和支出的具体金额

#### 图表 2：细分收入项趋势折线图

使用折线图展示各收入子项的月度变化趋势：

- X 轴：年月（如 "2026-01"）
- 折线：每条折线代表一个收入子项
  - 基本工资（`base_salary`，`--chart-1`）
  - 加班餐补（`overtime_meal`，`--chart-2`）
  - 住房公积金（`housing_fund`，`--chart-3`）
  - 请假扣款（`leave_deduction` >= 0 时，`--chart-4`）
- 悬浮 Tooltip 显示该月各收入项的具体金额
- 包含 CartesianGrid（仅水平线）辅助阅读

#### 图表 3：细分支出项趋势折线图

使用折线图展示各支出子项的月度变化趋势（均取绝对值展示）：

- X 轴：年月（如 "2026-01"）
- 折线：每条折线代表一个支出子项
  - 公积金扣除（`housing_fund_deduction`，`--chart-1`）
  - 医保（`medical_insurance`，`--chart-2`）
  - 养老保险（`pension_insurance`，`--chart-3`）
  - 失业保险（`unemployment_insurance`，`--chart-4`）
  - 个税（`tax`，`--chart-5`）
  - 房租（`rent`，`--chart-1`，虚线样式区分）
- 悬浮 Tooltip 显示该月各支出项的具体金额
- 包含 CartesianGrid（仅水平线）辅助阅读

### 页面布局

- 新建路由页面 `/income`
- 页面结构：标题 + 图表卡片
- 响应式：移动端全宽，PC 端居中限制最大宽度
- 首页增加入口链接跳转到 `/income`

---

## 技术方案

### 1. 依赖安装

```bash
# 安装 recharts（shadcn/ui chart 组件的底层依赖）
pnpm add recharts

# 添加 shadcn/ui chart 组件
pnpm dlx shadcn@latest add chart
```

### 2. 新增文件

| 文件 | 说明 |
|------|------|
| `src/routes/income.tsx` | 收入图表路由页面（数据获取 + 页面布局） |
| `src/components/income-expense-chart.tsx` | 收支堆叠柱状图组件 |
| `src/components/income-breakdown-chart.tsx` | 细分收入项趋势折线图组件 |
| `src/components/expense-breakdown-chart.tsx` | 细分支出项趋势折线图组件 |
| `src/components/ui/chart.tsx` | shadcn/ui Chart 组件（由 CLI 自动生成） |
| `src/lib/income.ts` | 数据获取与处理逻辑 |

### 3. 数据层（`src/lib/income.ts`）

```ts
// Supabase 查询
export const INCOME_QUERY_KEY = ["income"]

export async function fetchIncomeRecords(supabaseClient) {
  const { data, error } = await supabaseClient
    .from("income")
    .select("*")
    .order("time", { ascending: true })

  if (error) throw error
  return data
}

// 数据转换：将原始记录转为图表数据
export function transformToChartData(records: IncomeRecord[]) {
  return records.map((record) => {
    const income = (record.base_salary > 0 ? record.base_salary : 0)
      + (record.overtime_meal > 0 ? record.overtime_meal : 0)
      + (record.housing_fund > 0 ? record.housing_fund : 0)
      + (record.leave_deduction > 0 ? record.leave_deduction : 0)

    const expense = Math.abs(
      (record.housing_fund_deduction < 0 ? record.housing_fund_deduction : 0)
      + (record.medical_insurance < 0 ? record.medical_insurance : 0)
      + (record.pension_insurance < 0 ? record.pension_insurance : 0)
      + (record.unemployment_insurance < 0 ? record.unemployment_insurance : 0)
      + (record.tax < 0 ? record.tax : 0)
      + (record.rent < 0 ? record.rent : 0)
      + (record.leave_deduction < 0 ? record.leave_deduction : 0)
    )

    return {
      month: new Date(record.time).toLocaleDateString("zh-CN", { month: "short" }),
      income,
      expense,
    }
  })
}

// 数据转换：将原始记录转为细分收入项折线图数据
export function transformToIncomeBreakdownData(records: IncomeRecord[]) {
  return records.map((record) => ({
    month: new Date(record.time).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit" }),
    base_salary: record.base_salary,
    overtime_meal: record.overtime_meal,
    housing_fund: record.housing_fund,
    leave_deduction: record.leave_deduction >= 0 ? record.leave_deduction : 0,
  }))
}

// 数据转换：将原始记录转为细分支出项折线图数据（取绝对值）
export function transformToExpenseBreakdownData(records: IncomeRecord[]) {
  return records.map((record) => ({
    month: new Date(record.time).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit" }),
    housing_fund_deduction: Math.abs(record.housing_fund_deduction),
    medical_insurance: Math.abs(record.medical_insurance),
    pension_insurance: Math.abs(record.pension_insurance),
    unemployment_insurance: Math.abs(record.unemployment_insurance),
    tax: Math.abs(record.tax),
    rent: Math.abs(record.rent),
  }))
}
```

### 4. 收支堆叠柱状图组件（`src/components/income-expense-chart.tsx`）

独立的图表渲染组件，接收处理后的图表数据作为 props。页面后续会基于同一份数据添加更多图表组件，因此每个图表都应是独立组件。

```tsx
interface IncomeExpenseChartProps {
  data: { month: string; income: number; expense: number }[]
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
} satisfies ChartConfig

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  return (
    <ChartContainer config={chartConfig}>
      <BarChart data={data}>
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <Bar dataKey="income" stackId="a" fill="var(--color-income)" radius={[0, 0, 4, 4]} />
        <Bar dataKey="expense" stackId="a" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
        <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
      </BarChart>
    </ChartContainer>
  )
}
```

### 5. 细分收入项趋势折线图组件（`src/components/income-breakdown-chart.tsx`）

独立的折线图组件，展示各收入子项的月度变化趋势。

```tsx
interface IncomeBreakdownChartProps {
  data: {
    month: string
    base_salary: number
    overtime_meal: number
    housing_fund: number
    leave_deduction: number
  }[]
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
} satisfies ChartConfig

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
            <Line dataKey="base_salary" type="linear" stroke="var(--color-base_salary)" strokeWidth={2} dot={false} />
            <Line dataKey="overtime_meal" type="linear" stroke="var(--color-overtime_meal)" strokeWidth={2} dot={false} />
            <Line dataKey="housing_fund" type="linear" stroke="var(--color-housing_fund)" strokeWidth={2} dot={false} />
            <Line dataKey="leave_deduction" type="linear" stroke="var(--color-leave_deduction)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
```

### 6. 细分支出项趋势折线图组件（`src/components/expense-breakdown-chart.tsx`）

独立的折线图组件，展示各支出子项的月度变化趋势（均为绝对值）。

```tsx
interface ExpenseBreakdownChartProps {
  data: {
    month: string
    housing_fund_deduction: number
    medical_insurance: number
    pension_insurance: number
    unemployment_insurance: number
    tax: number
    rent: number
  }[]
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
} satisfies ChartConfig

export function ExpenseBreakdownChart({ data }: ExpenseBreakdownChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>支出明细趋势</CardTitle>
        <CardDescription>各支出子项月度变化</CardDescription>
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
            <Line dataKey="housing_fund_deduction" type="linear" stroke="var(--color-housing_fund_deduction)" strokeWidth={2} dot={false} />
            <Line dataKey="medical_insurance" type="linear" stroke="var(--color-medical_insurance)" strokeWidth={2} dot={false} />
            <Line dataKey="pension_insurance" type="linear" stroke="var(--color-pension_insurance)" strokeWidth={2} dot={false} />
            <Line dataKey="unemployment_insurance" type="linear" stroke="var(--color-unemployment_insurance)" strokeWidth={2} dot={false} />
            <Line dataKey="tax" type="linear" stroke="var(--color-tax)" strokeWidth={2} dot={false} />
            <Line dataKey="rent" type="linear" stroke="var(--color-rent)" strokeWidth={2} dot={false} strokeDasharray="5 5" />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
```

### 7. 页面组件（`src/routes/income.tsx`）

页面负责数据获取与布局编排，将处理后的数据传递给各图表组件：

- 使用 `createFileRoute("/income")` 创建路由
- 使用 `useQuery` + `fetchIncomeRecords` 获取数据
- 使用 `transformToChartData`、`transformToIncomeBreakdownData`、`transformToExpenseBreakdownData` 分别转换为各图表格式
- 将转换后的数据分别传入对应图表组件

```tsx
// 页面结构示意
function IncomePage() {
  const { data } = useQuery(...)
  const chartData = transformToChartData(data)
  const incomeBreakdownData = transformToIncomeBreakdownData(data)
  const expenseBreakdownData = transformToExpenseBreakdownData(data)

  return (
    <div>
      <h1>收入数据</h1>
      {/* 收支堆叠柱状图 */}
      <IncomeExpenseChart data={chartData} />
      {/* 细分收入项趋势折线图 */}
      <IncomeBreakdownChart data={incomeBreakdownData} />
      {/* 细分支出项趋势折线图 */}
      <ExpenseBreakdownChart data={expenseBreakdownData} />
    </div>
  )
}
```

### 8. 首页入口

在 `src/routes/index.tsx` 的链接区域增加跳转到 `/income` 的入口链接。

### 9. 响应式适配

- 图表卡片使用 `w-full max-w-2xl mx-auto` 控制宽度
- `ChartContainer` 自身已具备响应式能力，无需额外处理
- 移动端通过触摸交互查看 Tooltip
