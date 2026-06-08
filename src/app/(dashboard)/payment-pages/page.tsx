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
} from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import EmptyState from "@/components/dashboard/shared/EmptyState";
import { usePaymentPages, useDeletePaymentPage, useUpdatePaymentPage } from "@/lib/hooks/payment-pages/usePaymentPages";
import { toast } from "sonner";
import { cn } from "@/utils/utils";

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
      {copied ? <Check size={13} className="text-[#22C55E]" /> : <Copy size={13} />}
    </button>
  );
}

export default function PaymentPagesPage() {
  const { data, isLoading } = usePaymentPages();
  const deletePage = useDeletePaymentPage();
  const updatePage = useUpdatePaymentPage();

  const pages: any[] = Array.isArray(data) ? data : (data as any)?.data ?? [];

  function handleToggleStatus(page: any) {
    const next = page.status === "active" ? "inactive" : "active";
    updatePage.mutate(
      { id: page.id, payload: { status: next } },
      {
        onSuccess: () => toast.success(`Page ${next === "active" ? "activated" : "deactivated"}.`),
        onError: (err: any) => toast.error(err?.message ?? "Failed to update status."),
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
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-3.5 text-sm font-medium text-[#09090B] hover:bg-white transition-colors"
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
                        className="text-[#52525B] hover:text-[#FAFAFA] transition-colors"
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
                    <p className="text-xs text-[#52525B]">{page.currency ?? "USD"}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    {/* Toggle status */}
                    <button
                      onClick={() => handleToggleStatus(page)}
                      disabled={updatePage.isPending}
                      title={page.status === "active" ? "Deactivate" : "Activate"}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#71717A] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors disabled:opacity-40"
                    >
                      {page.status === "active" ? (
                        <ToggleRight size={16} className="text-[#22C55E]" />
                      ) : (
                        <ToggleLeft size={16} />
                      )}
                    </button>

                    {/* Edit */}
                    <Link
                      href={`/payment-pages/${page.id}/edit`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#71717A] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
                    >
                      <FileText size={14} />
                    </Link>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(page.id)}
                      disabled={deletePage.isPending}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#71717A] hover:bg-[#2D0A0A] hover:text-[#EF4444] transition-colors disabled:opacity-40"
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
    </div>
  );
}
