import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { IncomeRecord } from "@/lib/income";

const COLLAPSED_ROW_COUNT = 6;

export function IncomeDetailTable({ data }: { data: IncomeRecord[] }) {
  const [expanded, setExpanded] = useState(false);

  const reversedData = useMemo(() => data.slice().reverse(), [data]);

  const displayData = expanded
    ? reversedData
    : reversedData.slice(0, COLLAPSED_ROW_COUNT);

  const showToggle = reversedData.length > COLLAPSED_ROW_COUNT;

  return (
    <Card>
      <CardHeader>
        <CardTitle>收支明细</CardTitle>
        <CardDescription>每月收支详细数据</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>月份</TableHead>
              <TableHead className="text-right">底薪</TableHead>
              <TableHead className="text-right">加班餐补</TableHead>
              <TableHead className="text-right">公积金</TableHead>
              <TableHead className="text-right">请假扣款</TableHead>
              <TableHead className="text-right">公积金扣除</TableHead>
              <TableHead className="text-right">医疗保险</TableHead>
              <TableHead className="text-right">养老保险</TableHead>
              <TableHead className="text-right">失业保险</TableHead>
              <TableHead className="text-right">个税</TableHead>
              <TableHead className="text-right">房租</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">
                  {new Date(record.time).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "2-digit",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {record.base_salary.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {record.overtime_meal.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {record.housing_fund.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {record.leave_deduction.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {record.housing_fund_deduction.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {record.medical_insurance.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {record.pension_insurance.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {record.unemployment_insurance.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {record.tax.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {record.rent.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {showToggle && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setExpanded((prev) => !prev);
              }}
            >
              {expanded ? (
                <>
                  收起
                  <HugeiconsIcon icon={ArrowUp01Icon} className="ml-1 size-4" />
                </>
              ) : (
                <>
                  展开全部 (共 {reversedData.length} 条)
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    className="ml-1 size-4"
                  />
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
