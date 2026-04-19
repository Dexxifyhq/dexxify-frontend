"use client";

import { Search, ChevronDown } from "lucide-react";

// ── Primitives ─────────────────────────────────────────────────────────────

export function SearchInput({
  placeholder = "Search…",
  value,
  onChange,
}: {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-64 rounded-lg border border-[#1C1C1F] bg-[#0D0D0F] pl-9 pr-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
      />
    </div>
  );
}

export function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const selected = options.find((o) => o.value === value)?.label ?? label;

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 appearance-none rounded-lg border border-[#1C1C1F] bg-[#0D0D0F] pl-3 pr-8 text-sm text-[#A1A1AA] hover:border-[#2563EB] focus:border-[#2563EB] focus:outline-none transition-colors cursor-pointer"
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#52525B]"
      />
    </div>
  );
}

// ── FilterBar container ────────────────────────────────────────────────────

export default function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">{children}</div>
  );
}
