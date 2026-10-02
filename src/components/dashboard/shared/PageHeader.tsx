interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

// Title and actions share the first row; the description runs underneath at
// full width. When the actions are wider than the space beside the title
// (several buttons on a phone), they scroll sideways rather than dropping
// onto a line of their own.
export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-3">
        <h1 className="shrink-0 text-xl font-bold tracking-tight text-dash-foreground sm:text-2xl">
          {title}
        </h1>
        {actions && (
          <div className="min-w-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* ml-auto keeps the buttons right-aligned while they fit; once
                they overflow, w-max lets the row scroll from its start. */}
            <div className="ml-auto flex w-max items-center gap-2">{actions}</div>
          </div>
        )}
      </div>
      {description && <p className="text-sm text-dash-muted">{description}</p>}
    </div>
  );
}
