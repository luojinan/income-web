import type { IncomeSourceDefinition, IncomeSourceId } from "@/lib/income";
import { cn } from "@/lib/utils";

export function IncomeSourceTabs({
  sources,
  value,
  onValueChange,
}: {
  sources: IncomeSourceDefinition[];
  value: IncomeSourceId;
  onValueChange: (value: IncomeSourceId) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="收入数据来源"
      className="bg-muted inline-flex rounded-xl p-1"
    >
      {sources.map((source) => {
        const selected = source.id === value;

        return (
          <button
            key={source.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              selected
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => {
              onValueChange(source.id);
            }}
          >
            {source.label}
          </button>
        );
      })}
    </div>
  );
}
