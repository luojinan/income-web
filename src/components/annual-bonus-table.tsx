import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type AnnualBonusRecord,
  calculateAnnualBonusSummary,
  hasAnnualBonusParameters,
} from "@/lib/annual-bonus";

const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const factorFormatter = new Intl.NumberFormat("zh-CN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
});

export function AnnualBonusTable({
  data,
  loading = false,
  error,
  onRetry,
}: {
  data: AnnualBonusRecord[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>年终奖</CardTitle>
        <CardDescription>年度奖金结果与测算参数</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="bg-muted/40 h-48 animate-pulse rounded-lg border" />
        )}

        {!loading && error && (
          <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-destructive">{error}</p>
            {onRetry && (
              <Button type="button" variant="outline" onClick={onRetry}>
                重试
              </Button>
            )}
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="text-muted-foreground rounded-lg border border-dashed px-4 py-10 text-center text-sm">
            暂无年终奖记录，后续录入后会在这里展示税前、税额、到手和测算明细。
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>年份</TableHead>
                <TableHead className="text-right">税前金额</TableHead>
                <TableHead className="text-right">税额</TableHead>
                <TableHead className="text-right">到手金额</TableHead>
                <TableHead>绩效</TableHead>
                <TableHead className="text-right">绩效系数</TableHead>
                <TableHead className="text-right">团队基数</TableHead>
                <TableHead className="text-right">详情</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((record) => {
                const summary = calculateAnnualBonusSummary(record);
                const hasParameters = hasAnnualBonusParameters(record);

                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.bonus_year}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(record.gross_bonus)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(record.tax)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {formatCurrency(summary.netBonus)}
                    </TableCell>
                    <TableCell>
                      {record.performance_rating ? (
                        <Badge variant="secondary">
                          {record.performance_rating.toUpperCase()}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatFactor(record.performance_multiplier)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatFactor(record.team_base)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger
                          render={
                            <Button type="button" variant="ghost" size="sm" />
                          }
                        >
                          详情
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {record.bonus_year} 年终奖明细
                            </DialogTitle>
                          </DialogHeader>

                          <dl className="grid gap-2 text-sm">
                            <DetailItem
                              label="税前金额"
                              value={formatCurrency(record.gross_bonus)}
                            />
                            <DetailItem
                              label="税额"
                              value={formatCurrency(record.tax)}
                            />
                            <DetailItem
                              label="到手金额"
                              value={formatCurrency(summary.netBonus)}
                              valueClassName="font-medium text-primary"
                            />
                            <DetailItem
                              label="月均税前"
                              value={formatCurrency(
                                summary.avgMonthlyGross,
                              )}
                            />
                            <DetailItem
                              label="月均到手"
                              value={formatCurrency(summary.avgMonthlyNet)}
                            />
                          </dl>

                          {hasParameters && (
                            <section>
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <h3 className="text-sm font-medium">
                                  工资构成明细
                                </h3>
                                <Badge variant="outline">
                                  {record.salary_breakdown.length > 0
                                    ? `共 ${record.salary_breakdown.length} 条`
                                    : "未记录"}
                                </Badge>
                              </div>

                              {record.salary_breakdown.length > 0 ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>月薪</TableHead>
                                      <TableHead className="text-right">
                                        月数
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {record.salary_breakdown.map(
                                      (item, index) => (
                                        <TableRow
                                          key={`${record.id}-${index}`}
                                        >
                                          <TableCell>
                                            {formatCurrency(
                                              item.monthly_salary,
                                            )}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {factorFormatter.format(
                                              item.months,
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      ),
                                    )}
                                  </TableBody>
                                </Table>
                              ) : (
                                <p className="text-muted-foreground text-sm">
                                  未记录工资构成明细
                                </p>
                              )}
                            </section>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function DetailItem({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={valueClassName}>{value}</dd>
    </div>
  );
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatFactor(value: number | null) {
  return value === null ? "—" : factorFormatter.format(value);
}
