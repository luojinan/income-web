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
import type { IncomeDetailColumn, IncomeDisplayRecord } from "@/lib/income";

const COLLAPSED_ROW_COUNT = 6;

export function IncomeDetailTable({
  data,
  columns,
}: {
  data: IncomeDisplayRecord[];
  columns: IncomeDetailColumn[];
}) {
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>月份</TableHead>
                {columns.map((column) => (
                  <TableHead key={column.key} className="text-right">
                    {column.label}
                  </TableHead>
                ))}
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
                  {columns.map((column) => (
                    <TableCell key={column.key} className="text-right">
                      {(record.detailValues[column.key] ?? 0).toLocaleString()}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
