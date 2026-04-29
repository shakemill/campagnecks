import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DataCardProps = {
  title: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  description?: string;
};

export function DataCard({ title, children, icon: Icon, description }: DataCardProps) {
  return (
    <Card className="rounded-xl border shadow-soft-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-heading text-base text-brand-gray">
          {Icon ? (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-pink/10 text-brand-pink">
              <Icon className="h-4 w-4" />
            </span>
          ) : null}
          <span>{title}</span>
        </CardTitle>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
