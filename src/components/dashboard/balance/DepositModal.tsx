"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownToLine, Search } from "lucide-react";
import {
  useCreateDepositAccount,
  useIssueIdentity,
} from "@/lib/hooks/deposit-accounts/useDepositAccounts";
import { depositAccountsApi } from "@/lib/api/deposit-accounts";
import { payApi } from "@/lib/api/pay";
import { flattenAssets, type FlatAsset } from "@/lib/utils/assets";
import type { DepositIdentityChain } from "@/lib/types/deposit-accounts";
import WalletQRCode from "@/components/ui/WalletQRCode";
import {
  AssetLogo,
  CopyButton,
  ErrorNote,
  FieldLabel,
  ModalShell,
  Note,
  OptionRow,
  PrimaryButton,
  SecondaryButton,
  Stepper,
  TextInput,
} from "./modal-kit";

interface DepositAddress {
  chain: string;
  address: string;
  createdAt?: string;
}
interface NgnVirtualAccount {
  currency: string;
  accountNumber: string;
  accountName: string;
  bankName?: string;
}
interface WalletResult {
  id: string;
  deposit_addresses: string | DepositAddress[];
  ngn_virtual_accounts: string | NgnVirtualAccount[];
}

function parseJsonField<T>(field: string | T[]): T[] {
  if (Array.isArray(field)) return field;
  if (!field) return [];
  try {
    return JSON.parse(field as string) as T[];
  } catch {
    return [];
  }
}

const STEPS = ["Asset", "Address"];

export default function DepositModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<0 | 1>(0);
  const [selectedKey, setSelectedKey] = useState("");
  const [query, setQuery] = useState("");
  const [walletResult, setWalletResult] = useState<WalletResult | null>(null);

  const { data: rawAssets, isLoading: assetsLoading } = useQuery({
    queryKey: ["deposit-assets"],
    queryFn: payApi.getDepositAssets,
    staleTime: 5 * 60_000,
  });

  const createDepositAccount = useCreateDepositAccount();
  const issueIdentity = useIssueIdentity();

  const assets: FlatAsset[] = flattenAssets(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped response envelope
    (rawAssets as any)?.data ?? rawAssets ?? {},
  );
  const q = query.trim().toLowerCase();
  const visibleAssets = q
    ? assets.filter((a) =>
        `${a.symbol} ${a.name} ${a.networkDisplay}`.toLowerCase().includes(q),
      )
    : assets;

  const selectedAsset = assets.find((a) => a.key === selectedKey) ?? null;

  const handleCreate = async () => {
    if (!selectedAsset) return;
    try {
      // 1. Create the deposit account
      const depositAccount = await createDepositAccount.mutateAsync({
        customer_id: undefined,
      });
      const depositAccountId: string = depositAccount.id;

      // 2. Issue a deposit identity for the selected chain
      await issueIdentity.mutateAsync({
        walletId: depositAccountId,
        dto: {
          type: "static_deposit_address",
          chain: selectedAsset.chainKey as DepositIdentityChain,
        },
      });

      // 3. Re-fetch wallet to get the updated deposit_addresses
      const updated = await depositAccountsApi.getById(depositAccountId);
      setWalletResult(updated as unknown as WalletResult);
      setStep(1);
    } catch {
      // errors shown inline
    }
  };

  const handleClose = () => {
    setStep(0);
    setSelectedKey("");
    setQuery("");
    setWalletResult(null);
    createDepositAccount.reset();
    issueIdentity.reset();
    onClose();
  };

  const depositAddresses = walletResult
    ? parseJsonField<DepositAddress>(walletResult.deposit_addresses)
    : [];
  const ngnAccounts = walletResult
    ? parseJsonField<NgnVirtualAccount>(walletResult.ngn_virtual_accounts)
    : [];
  const matchedAddress = selectedAsset
    ? depositAddresses.find((da) => da.chain === selectedAsset.chainKey)
    : null;

  const createError =
    createDepositAccount.error instanceof Error
      ? createDepositAccount.error.message
      : issueIdentity.error instanceof Error
        ? issueIdentity.error.message
        : null;
  const isCreating = createDepositAccount.isPending || issueIdentity.isPending;

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      icon={ArrowDownToLine}
      tone="green"
      title="Deposit funds"
      subtitle="Get an address to receive crypto into your balance"
    >
      <div className="flex flex-col gap-5">
        <Stepper steps={STEPS} current={step} />

        {step === 0 ? (
          <>
            <div>
              <FieldLabel>Asset &amp; network</FieldLabel>
              {assets.length > 6 && (
                <div className="relative mb-2">
                  <Search
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-dash-faint"
                  />
                  <TextInput
                    placeholder="Search assets or networks"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}
              {assetsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-15 animate-pulse rounded-xl bg-dash-hover"
                    />
                  ))}
                </div>
              ) : visibleAssets.length === 0 ? (
                <p className="rounded-xl bg-dash-bg px-4 py-6 text-center text-sm text-dash-muted">
                  {assets.length === 0
                    ? "No deposit assets are available right now."
                    : "No assets match your search."}
                </p>
              ) : (
                <div className="max-h-72 space-y-2 overflow-y-auto pr-0.5">
                  {visibleAssets.map((a) => (
                    <OptionRow
                      key={a.key}
                      selected={a.key === selectedKey}
                      onSelect={() => setSelectedKey(a.key)}
                      leading={<AssetLogo symbol={a.symbol} className="h-8 w-8" />}
                      title={a.symbol}
                      subtitle={a.name}
                      trailing={
                        <span className="shrink-0 rounded-full bg-dash-hover px-2 py-0.5 text-[11px] font-medium text-dash-muted">
                          {a.networkDisplay}
                        </span>
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            <ErrorNote message={createError} />

            <PrimaryButton
              disabled={!selectedKey}
              loading={isCreating}
              onClick={handleCreate}
            >
              {createDepositAccount.isPending
                ? "Creating wallet…"
                : issueIdentity.isPending
                  ? "Issuing address…"
                  : "Generate deposit address"}
            </PrimaryButton>
          </>
        ) : (
          <>
            {selectedAsset && (
              <div className="flex items-center gap-3 rounded-2xl bg-dash-bg px-4 py-3">
                <AssetLogo symbol={selectedAsset.symbol} className="h-8 w-8" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-dash-foreground">
                    {selectedAsset.symbol}
                  </p>
                  <p className="text-xs text-dash-muted">{selectedAsset.name}</p>
                </div>
                <span className="rounded-full bg-dash-card px-2.5 py-1 text-xs font-medium text-dash-muted">
                  {selectedAsset.networkDisplay}
                </span>
              </div>
            )}

            {matchedAddress ? (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-2xl border border-dash-border p-3">
                  <WalletQRCode address={matchedAddress.address} size={168} />
                </div>
                <div className="w-full">
                  <FieldLabel>Deposit address</FieldLabel>
                  <div className="flex items-center gap-2 rounded-xl border border-dash-border px-3.5 py-3">
                    <span className="min-w-0 flex-1 break-all font-mono text-xs text-dash-foreground">
                      {matchedAddress.address}
                    </span>
                    <CopyButton value={matchedAddress.address} label="Copy" />
                  </div>
                </div>
                <Note tone="warning">
                  Only send {selectedAsset?.symbol} on the{" "}
                  {selectedAsset?.networkDisplay} network to this address.
                  Anything else may be lost.
                </Note>
              </div>
            ) : (
              <Note>
                No deposit address found for the selected network. Try a
                different asset or network.
              </Note>
            )}

            {ngnAccounts.length > 0 && (
              <div>
                <FieldLabel>NGN virtual accounts</FieldLabel>
                <div className="space-y-2">
                  {ngnAccounts.map((va, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-dash-border px-3.5 py-3"
                    >
                      <AssetLogo symbol="NGN" className="h-8 w-8" />
                      <div className="min-w-0 flex-1">
                        {va.bankName && (
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
                            {va.bankName}
                          </p>
                        )}
                        <p className="font-mono text-sm text-dash-foreground">
                          {va.accountNumber}
                        </p>
                        <p className="truncate text-xs text-dash-muted">
                          {va.accountName}
                        </p>
                      </div>
                      <CopyButton value={va.accountNumber} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <SecondaryButton onClick={() => setStep(0)} className="w-full">
              Choose a different asset
            </SecondaryButton>
          </>
        )}
      </div>
    </ModalShell>
  );
}
