import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  trendPercent?: number;
  icon?: LucideIcon;
};

export function StatCard({ title, value, trendPercent = 0, icon: Icon }: StatCardProps) {
  const positive = trendPercent >= 0;
  return (
    <Card className="rounded-xl border shadow-soft-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-pink/10 text-brand-pink">
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="font-heading text-2xl font-bold text-brand-gray">{value}</p>
        <p
          className={cn(
            "flex items-center gap-1 text-xs",
            positive ? "text-brand-green" : "text-red-600",
          )}
        >
          {positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {Math.abs(trendPercent)}%
        </p>
      </CardContent>
    </Card>
  );
}
