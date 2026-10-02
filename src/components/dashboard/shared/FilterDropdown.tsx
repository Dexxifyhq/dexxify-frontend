"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/utils/utils";

/**
 * Dashboard filter menu: a button that opens a rounded list, the selected
 * option tinted blue with a tick. Opens upward when there isn't room below.
 */
export default function FilterDropdown<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open && ref.current) {
      // ~44px per option plus padding; flip if that won't fit below.
      const menuHeight = options.length * 44 + 16;
      const rect = ref.current.getBoundingClientRect();
      setUp(window.innerHeight - rect.bottom < menuHeight + 8);
    }
    setOpen((v) => !v);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        className={cn(
          "flex h-11 items-center gap-3 rounded-xl border bg-dash-card pl-4 pr-3.5 text-sm font-medium text-dash-foreground transition-colors",
          open ? "border-tone-blue" : "border-dash-border hover:bg-dash-bg",
        )}
      >
        {selected?.label}
        <ChevronDown
          size={15}
          className={cn(
            "text-dash-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className={cn(
            "absolute right-0 z-20 w-max min-w-full rounded-2xl border border-dash-border bg-dash-card p-1.5 shadow-xl",
            up ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          {options.map((o) => {
            const isSel = o.value === value;
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-6 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-dash-foreground transition-colors",
                    isSel ? "bg-tone-blue/10" : "hover:bg-dash-hover",
                  )}
                >
                  {o.label}
                  {isSel && <Check size={15} className="text-tone-blue" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
