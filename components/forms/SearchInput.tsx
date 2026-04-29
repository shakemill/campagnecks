"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";

type SearchInputProps = {
  value?: string;
  onDebouncedChange: (value: string) => void;
};

export function SearchInput({ value = "", onDebouncedChange }: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => onDebouncedChange(internalValue), 300);
    return () => clearTimeout(timeout);
  }, [internalValue, onDebouncedChange]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        value={internalValue}
        onChange={(event) => setInternalValue(event.target.value)}
        className="pl-9"
        placeholder="Rechercher..."
      />
    </div>
  );
}
