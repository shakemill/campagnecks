"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DateRangePickerProps = {
  onChange: (value: { from?: Date; to?: Date }) => void;
};

export function DateRangePicker({ onChange }: DateRangePickerProps) {
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});

  const updateRange = (field: "from" | "to", value: string) => {
    const next = {
      ...range,
      [field]: value ? new Date(value) : undefined,
    };
    setRange(next);
    onChange(next);
  };

  return (
    <div className="grid gap-2 md:grid-cols-2">
      <div className="space-y-1">
        <Label>Debut</Label>
        <Input type="date" onChange={(event) => updateRange("from", event.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Fin</Label>
        <Input type="date" onChange={(event) => updateRange("to", event.target.value)} />
      </div>
    </div>
  );
}
