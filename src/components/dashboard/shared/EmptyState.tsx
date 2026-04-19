import { Filter } from "lucide-react";
import { cn } from "@/utils/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description: string;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 py-16 text-center", className)}>
      <div className="text-[#3F3F46]">
        {icon ?? <Filter size={28} strokeWidth={1.5} />}
      </div>
      {title && <p className="text-sm font-medium text-[#71717A]">{title}</p>}
      <p className="text-sm text-[#52525B]">{description}</p>
    </div>
  );
}
