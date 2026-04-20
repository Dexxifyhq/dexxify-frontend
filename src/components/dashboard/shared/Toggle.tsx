"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  size?: "sm" | "md";
  ariaLabel?: string;
}

export default function Toggle({
  checked,
  onChange,
  size = "md",
  ariaLabel,
}: ToggleProps) {
  const dims =
    size === "sm"
      ? "h-5 w-9"
      : "h-[22px] w-[40px]";
  const knob =
    size === "sm" ? "h-3.5 w-3.5" : "h-[16px] w-[16px]";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex shrink-0 items-center rounded-full border transition-colors ${dims} ${
        checked
          ? "border-[#22C55E] bg-[#22C55E]"
          : "border-[#1C1C1F] bg-[#09090B]"
      }`}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 rounded-full transition-all ${knob} ${
          checked
            ? "right-[2px] bg-white"
            : "left-[2px] bg-[#52525B]"
        }`}
      />
    </button>
  );
}
