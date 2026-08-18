import { Construction } from "lucide-react";
import PageHeader from "./PageHeader";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} description={description} />
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dash-border bg-dash-card py-24 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-dash-hover text-dash-faint">
          <Construction size={22} strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-medium text-dash-muted">Coming soon</p>
          <p className="mt-1 text-xs text-dash-faint">This section is under construction.</p>
        </div>
      </div>
    </div>
  );
}
