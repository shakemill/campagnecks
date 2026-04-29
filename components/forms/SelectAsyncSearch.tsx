"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";

type Option = {
  value: string;
  label: string;
};

type SelectAsyncSearchProps = {
  options: Option[];
  onSelect: (value: string) => void;
};

export function SelectAsyncSearch({ options, onSelect }: SelectAsyncSearchProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const lowered = query.toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(lowered));
  }, [options, query]);

  return (
    <div className="space-y-2">
      <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Chercher..." />
      <div className="max-h-52 overflow-y-auto rounded-md border bg-white">
        {filtered.map((option) => (
          <button
            type="button"
            key={option.value}
            onClick={() => onSelect(option.value)}
            className="w-full border-b px-3 py-2 text-left text-sm hover:bg-surface-muted"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
