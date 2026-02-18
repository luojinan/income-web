import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TimeRangeSelect({
  value,
  onValueChange,
  availableYears,
}: {
  value: string;
  onValueChange: (value: string) => void;
  availableYears: number[];
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        onValueChange(v ?? "all");
      }}
    >
      <SelectTrigger size="sm">
        <SelectValue placeholder="选择时间范围" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>时间范围</SelectLabel>
          <SelectItem value="3m">最近3个月</SelectItem>
          <SelectItem value="6m">最近6个月</SelectItem>
          <SelectItem value="12m">最近12个月</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>按年份</SelectLabel>
          {availableYears.map((year) => (
            <SelectItem key={year} value={String(year)}>
              {year}年
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectItem value="all">全部</SelectItem>
      </SelectContent>
    </Select>
  );
}
