"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FileText,
  Plus,
  Globe,
  Copy,
  Check,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Loader2,
  ExternalLink,
  Pencil,
  X,
  Save,
  ChevronDown,
} from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import EmptyState from "@/components/dashboard/shared/EmptyState";
import {
  usePaymentPages,
  useDeletePaymentPage,
  useUpdatePaymentPage,
} from "@/lib/hooks/payment-pages/usePaymentPages";
import { toast } from "sonner";
import { cn } from "@/utils/utils";

// ── Helpers ────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        status === "active"
          ? "bg-[#052E16]/60 text-[#22C55E] border border-[#14532D]/40"
          : status === "draft"
            ? "bg-[#1C1C1F] text-[#71717A] border border-[#2a2a2e]"
            : "bg-[#451A03]/60 text-[#F59E0B] border border-[#78350F]/40",
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      className="text-[#52525B] hover:text-[#FAFAFA] transition-colors"
      title="Copy link"
    >
      {copied ? (
        <Check size={13} className="text-[#22C55E]" />
      ) : (
        <Copy size={13} />
      )}
    </button>
  );
}

// ── Edit drawer ────────────────────────────────────────────────────────────

const drawerInputCls =
  "h-10 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors";

function DrawerField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[#A1A1AA]">
        {label}
      </label>
      {children}
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-[#52525B]">{label}</span>
      <span
        className={cn("truncate text-xs text-[#A1A1AA]", mono && "font-mono")}
      >
        {value}
      </span>
    </div>
  );
}

interface EditDrawerProps {
  page: any;
  onClose: () => void;
  updatePage: ReturnType<typeof useUpdatePaymentPage>;
}

function EditDrawer({ page, onClose, updatePage }: EditDrawerProps) {
  const [title, setTitle] = useState(page.title ?? "");
  const [description, setDescription] = useState(page.description ?? "");
  const [amount, setAmount] = useState(String(page.amount ?? ""));
  const [status, setStatus] = useState<string>(page.status ?? "active");

  function handleSave() {
    if (!title.trim()) return;
    updatePage.mutate(
      {
        id: page.id,
        payload: {
          title: title.trim(),
          description: description,
          ...(amount && Number(amount) > 0 ? { amount: Number(amount) } : {}),
          status: status as any,
        },
      },
      {
        onSuccess: () => {
          toast.success("Payment page updated.");
          onClose();
        },
        onError: (err: any) =>
          toast.error(err?.message ?? "Failed to update page."),
      },
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[#1C1C1F] bg-[#111113] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C1C1F] px-6 py-5">
          <div>
            <h2 className="text-base font-bold text-[#FAFAFA]">
              Edit Payment Page
            </h2>
            <p className="mt-0.5 font-mono text-xs text-[#52525B]">
              /p/{page.slug}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#71717A] transition-colors hover:bg-[#1C1C1F] hover:text-[#FAFAFA]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="flex flex-col gap-5">
            <DrawerField label="Page Title *">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Summer Sale Checkout"
                className={drawerInputCls}
                autoFocus
              />
            </DrawerField>

            <DrawerField label="Description">
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell your customers what they're paying for…"
                className={`${drawerInputCls} h-auto resize-y py-2.5`}
              />
            </DrawerField>

            <DrawerField label="Amount">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`${drawerInputCls} flex-1`}
                />
                <span className="shrink-0 text-sm font-semibold text-[#52525B]">
                  {page.currency}
                </span>
              </div>
            </DrawerField>

            <DrawerField label="Status">
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`${drawerInputCls} cursor-pointer appearance-none pr-9`}
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A]"
                />
              </div>
            </DrawerField>

            {/* Read-only page info */}
            <div className="rounded-xl border border-[#1C1C1F] bg-[#0A0B0E] p-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                Page info
              </p>
              <div className="flex flex-col gap-2.5">
                <InfoRow label="Slug" value={`/p/${page.slug}`} mono />
                <InfoRow label="Currency" value={page.currency ?? "USD"} />
                {page.created_at && (
                  <InfoRow
                    label="Created"
                    value={new Date(page.created_at).toLocaleDateString(
                      undefined,
                      { dateStyle: "medium" },
                    )}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#1C1C1F] px-6 py-4">
          <button
            onClick={onClose}
            className="h-10 rounded-lg border border-[#1C1C1F] px-5 text-sm font-medium text-[#A1A1AA] transition-colors hover:bg-[#1C1C1F] hover:text-[#FAFAFA]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || updatePage.isPending}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#2563EB] px-5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {updatePage.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {updatePage.isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function PaymentPagesPage() {
  const { data, isLoading } = usePaymentPages();
  const deletePage = useDeletePaymentPage();
  const updatePage = useUpdatePaymentPage();

  const [editingPage, setEditingPage] = useState<any | null>(null);

  const pages: any[] = Array.isArray(data) ? data : ((data as any)?.data ?? []);

  function handleToggleStatus(page: any) {
    const next = page.status === "active" ? "inactive" : "active";
    updatePage.mutate(
      { id: page.id, payload: { status: next } },
      {
        onSuccess: () =>
          toast.success(
            `Page ${next === "active" ? "activated" : "deactivated"}.`,
          ),
        onError: (err: any) =>
          toast.error(err?.message ?? "Failed to update status."),
      },
    );
  }

  function handleDelete(id: string) {
    deletePage.mutate(id, {
      onSuccess: () => toast.success("Payment page deleted."),
      onError: (err: any) => toast.error(err?.message ?? "Failed to delete."),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payment Pages"
        description="Permanent, reusable pages for accepting crypto payments."
        actions={
          <Link
            href="/payment-pages/new"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-3.5 text-sm font-medium text-[#09090B] transition-colors hover:bg-white"
          >
            <Plus size={15} />
            New Page
          </Link>
        }
      />

      <section className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F]">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={22} className="animate-spin text-[#3F3F46]" />
          </div>
        ) : pages.length === 0 ? (
          <EmptyState
            icon={<FileText size={28} strokeWidth={1.5} />}
            title="No payment pages yet"
            description="Create a permanent page to start accepting payments from anyone."
            className="py-24"
          />
        ) : (
          <ul className="divide-y divide-[#1C1C1F]">
            {pages.map((page: any) => {
              const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${page.slug}`;
              return (
                <li key={page.id} className="flex items-center gap-4 px-5 py-4">
                  {/* Icon */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#1C1C1F] bg-[#111113]">
                    <Globe size={15} className="text-[#52525B]" />
                  </div>

                  {/* Main info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-[#FAFAFA]">
                        {page.title}
                      </p>
                      <StatusBadge status={page.status} />
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <p className="truncate font-mono text-xs text-[#52525B]">
                        /p/{page.slug}
                      </p>
                      <CopyButton text={publicUrl} />
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#52525B] transition-colors hover:text-[#FAFAFA]"
                      >
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-sm font-medium text-[#FAFAFA]">
                      {page.amount_type === "flexible"
                        ? "Flexible"
                        : `$${Number(page.amount).toFixed(2)}`}
                    </p>
                    <p className="text-xs text-[#52525B]">{page.currency}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    {/* Toggle status */}
                    <button
                      onClick={() => handleToggleStatus(page)}
                      disabled={updatePage.isPending}
                      title={
                        page.status === "active" ? "Deactivate" : "Activate"
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#71717A] transition-colors hover:bg-[#1C1C1F] hover:text-[#FAFAFA] disabled:opacity-40"
                    >
                      {page.status === "active" ? (
                        <ToggleRight size={16} className="text-[#22C55E]" />
                      ) : (
                        <ToggleLeft size={16} />
                      )}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => setEditingPage(page)}
                      title="Edit"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#71717A] transition-colors hover:bg-[#1C1C1F] hover:text-[#FAFAFA]"
                    >
                      <Pencil size={14} />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(page.id)}
                      disabled={deletePage.isPending}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#71717A] transition-colors hover:bg-[#2D0A0A] hover:text-[#EF4444] disabled:opacity-40"
                    >
                      {deletePage.isPending ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Edit drawer */}
      {editingPage && (
        <EditDrawer
          page={editingPage}
          onClose={() => setEditingPage(null)}
          updatePage={updatePage}
        />
      )}
    </div>
  );
}
