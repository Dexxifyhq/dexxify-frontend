"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownUp, ArrowLeftRight, Landmark } from "lucide-react";
import {
  useCreateOfframp,
  useCreateSwapQuotation,
  useExecuteSwap,
  useSwapEstimate,
} from "@/lib/hooks/swaps/useSwaps";
import { useSavedBanks } from "@/lib/hooks/misc/useMisc";
import { useLedgerBalance } from "@/lib/hooks/ledger/useLedger";
import type { SavedBank } from "@/lib/types/misc";
import type { WalletAsset } from "@/lib/api/offramp";
import type { SwapQuotation } from "@/lib/api/swaps";
import { cn } from "@/utils/utils";
import {
  AmountField,
  AssetLogo,
  CurrencyPicker,
  ErrorNote,
  FieldLabel,
  ModalShell,
  Note,
  OptionRow,
  PrimaryButton,
  Segmented,
  StepActions,
  Stepper,
  SuccessState,
  Summary,
  TextInput,
  fmt,
} from "./modal-kit";

const SWAP_CURRENCIES = ["NGN", "USDT", "USDC"] as const;
const OFFRAMP_ASSETS = ["USDT", "USDC"] as const;
const MIN_OFFRAMP_USD = 3;

type SwapModalTab = "crypto" | "offramp";
const TABS: { value: SwapModalTab; label: string }[] = [
  { value: "crypto", label: "Swap" },
  { value: "offramp", label: "Offramp to NGN" },
];

type BalanceKey = "ngn" | "usdt" | "usdc";

function useAvailable() {
  const { data: balance } = useLedgerBalance();
  return (code: string) => {
    const key = code.toLowerCase() as BalanceKey;
    const b = balance?.[key]?.balance;
    if (b === undefined) return undefined;
    return code === "NGN" ? `₦${fmt(b)}` : `${fmt(b)} ${code}`;
  };
}

// ── Crypto swap ──────────────────────────────────────────────────────────────

type CryptoSwapStep = "form" | "quotation" | "success";

function CryptoSwapFlow({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<CryptoSwapStep>("form");
  const [fromCurrency, setFromCurrency] = useState("USDT");
  const [toCurrency, setToCurrency] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [quotation, setQuotation] = useState<SwapQuotation | null>(null);
  // Quote timer: the seconds left are derived from expiresAt and a clock
  // that ticks once a second; quoteWindow is the full length, for the bar.
  const [now, setNow] = useState(() => Date.now());
  const [quoteWindow, setQuoteWindow] = useState(0);
  const createQuotation = useCreateSwapQuotation();
  const executeSwap = useExecuteSwap();
  const available = useAvailable();

  // Live estimate
  const estimateEnabled =
    !!fromCurrency &&
    !!toCurrency &&
    !!amount &&
    Number(amount) > 0 &&
    fromCurrency !== toCurrency;
  const { data: estimate, isFetching: estimateFetching } = useSwapEstimate(
    fromCurrency,
    toCurrency,
    amount,
  );

  const countdown = quotation
    ? Math.max(
        0,
        Math.round((new Date(quotation.expiresAt).getTime() - now) / 1000),
      )
    : 0;
  const timerExpired = countdown <= 0;

  // Tick the clock while a live quote is on screen.
  useEffect(() => {
    if (step !== "quotation" || !quotation || timerExpired) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [step, quotation, timerExpired]);

  // Picking the currency already on the other side swaps the two.
  const pickFrom = (c: string) => {
    if (c === toCurrency) setToCurrency(fromCurrency);
    setFromCurrency(c);
  };
  const pickTo = (c: string) => {
    if (c === fromCurrency) setFromCurrency(toCurrency);
    setToCurrency(c);
  };
  const flip = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleGetQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const q = await createQuotation.mutateAsync({
        fromCurrency,
        toCurrency,
        amount,
      });
      const t = Date.now();
      setNow(t);
      setQuoteWindow(
        Math.max(
          0,
          Math.round((new Date(q.expiresAt).getTime() - t) / 1000),
        ),
      );
      setQuotation(q);
      setStep("quotation");
    } catch {
      // error shown inline
    }
  };

  const handleExecute = async () => {
    if (!quotation) return;
    try {
      await executeSwap.mutateAsync(quotation.id);
      setStep("success");
    } catch {
      // error shown inline
    }
  };

  const backToForm = () => {
    createQuotation.reset();
    executeSwap.reset();
    setStep("form");
  };

  const quotationError =
    createQuotation.error instanceof Error
      ? createQuotation.error.message
      : null;
  const executeError =
    executeSwap.error instanceof Error ? executeSwap.error.message : null;

  if (step === "success" && quotation) {
    return (
      <SuccessState
        title="Swap complete"
        description="The converted funds are in your balance."
        onDone={onDone}
      >
        <Summary
          rows={[
            { label: "You paid", value: `${fmt(quotation.sourceAmount)} ${quotation.fromCurrency}` },
            { label: "You received", value: `${fmt(quotation.targetAmount)} ${quotation.toCurrency}` },
          ]}
        />
      </SuccessState>
    );
  }

  if (step === "quotation" && quotation) {
    const mm = String(Math.floor(countdown / 60)).padStart(2, "0");
    const ss = String(countdown % 60).padStart(2, "0");
    const left = quoteWindow > 0 ? countdown / quoteWindow : 0;
    return (
      <div className="flex flex-col gap-5">
        <Stepper steps={["Amount", "Review"]} current={1} />

        {/* Pay → receive */}
        <div className="rounded-2xl bg-dash-bg p-4">
          <div className="flex items-center gap-3">
            <AssetLogo symbol={quotation.fromCurrency} className="h-9 w-9" />
            <div>
              <p className="text-xs text-dash-muted">You pay</p>
              <p className="text-lg font-semibold text-dash-foreground">
                {fmt(quotation.sourceAmount)} {quotation.fromCurrency}
              </p>
            </div>
          </div>
          <div className="my-2 ml-4 h-5 border-l border-dashed border-dash-border-strong" />
          <div className="flex items-center gap-3">
            <AssetLogo symbol={quotation.toCurrency} className="h-9 w-9" />
            <div>
              <p className="text-xs text-dash-muted">You receive</p>
              <p className="text-lg font-semibold text-dash-success">
                {fmt(quotation.targetAmount)} {quotation.toCurrency}
              </p>
            </div>
          </div>
        </div>

        <Summary
          rows={[
            {
              label: "Rate",
              value: `1 ${quotation.fromCurrency} = ${quotation.rate} ${quotation.toCurrency}`,
            },
          ]}
        />

        {/* Quote timer */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-dash-muted">Quote expires in</span>
            <span
              className={cn(
                "font-mono font-semibold",
                timerExpired
                  ? "text-dash-error"
                  : countdown <= 30
                    ? "text-dash-warning"
                    : "text-dash-foreground",
              )}
            >
              {timerExpired ? "Expired" : `${mm}:${ss}`}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-dash-hover">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-1000 ease-linear",
                countdown <= 30 ? "bg-dash-warning" : "bg-dash-accent",
              )}
              style={{ width: `${left * 100}%` }}
            />
          </div>
        </div>

        <ErrorNote message={executeError} />

        {timerExpired ? (
          <StepActions onBack={backToForm}>
            <PrimaryButton onClick={backToForm}>Get new quote</PrimaryButton>
          </StepActions>
        ) : (
          <StepActions onBack={backToForm}>
            <PrimaryButton
              onClick={handleExecute}
              loading={executeSwap.isPending}
            >
              Confirm swap
            </PrimaryButton>
          </StepActions>
        )}
      </div>
    );
  }

  // Step: form
  const fromAvail = available(fromCurrency);
  return (
    <form onSubmit={handleGetQuote} className="flex flex-col gap-5">
      <Stepper steps={["Amount", "Review"]} current={0} />

      <div className="relative flex flex-col gap-2">
        <div>
          <FieldLabel>You pay</FieldLabel>
          <AmountField
            autoFocus
            value={amount}
            onChange={setAmount}
            currency={
              <CurrencyPicker
                value={fromCurrency}
                options={SWAP_CURRENCIES}
                onChange={pickFrom}
              />
            }
            hint={fromAvail ? `Available: ${fromAvail}` : undefined}
          />
        </div>

        <button
          type="button"
          onClick={flip}
          aria-label="Swap direction"
          className="absolute left-1/2 top-[calc(50%+6px)] z-1 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-dash-border bg-dash-card text-dash-muted shadow-sm transition-colors hover:text-dash-foreground"
        >
          <ArrowDownUp size={15} />
        </button>

        <div>
          <FieldLabel>You receive (estimate)</FieldLabel>
          <div className="flex items-center gap-3 rounded-2xl border border-dash-border bg-dash-bg px-4 py-3.5">
            <p
              className={cn(
                "min-w-0 flex-1 truncate text-3xl font-medium tracking-tight",
                estimateEnabled && estimate && !estimateFetching
                  ? "text-dash-foreground"
                  : "text-dash-faint",
              )}
            >
              {estimateEnabled && estimateFetching
                ? "…"
                : estimateEnabled && estimate
                  ? fmt(estimate.targetAmount)
                  : "0.00"}
            </p>
            <CurrencyPicker
              value={toCurrency}
              options={SWAP_CURRENCIES}
              onChange={pickTo}
            />
          </div>
        </div>
      </div>

      {estimateEnabled && estimate && !estimateFetching && (
        <p className="text-center text-xs text-dash-muted">
          1 {fromCurrency} ≈ {estimate.rate} {toCurrency}
        </p>
      )}

      <ErrorNote message={quotationError} />
      <PrimaryButton
        type="submit"
        disabled={!(Number(amount) > 0) || fromCurrency === toCurrency}
        loading={createQuotation.isPending}
      >
        Get quote
      </PrimaryButton>
    </form>
  );
}

// ── Offramp ──────────────────────────────────────────────────────────────────

function OfframpFlow({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [cryptoAsset, setCryptoAsset] = useState<WalletAsset>("USDT");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [success, setSuccess] = useState(false);
  const [belowMinError, setBelowMinError] = useState<string | null>(null);

  const { data: savedBanks, isLoading: banksLoading } = useSavedBanks();
  const createOfframp = useCreateOfframp();
  const available = useAvailable();

  const bankList: SavedBank[] = (savedBanks as SavedBank[] | undefined) ?? [];
  const selectedBank = bankList.find(
    (b) => b.provider_recipient_id === recipientId,
  );

  const belowMin = () => {
    if (Number(cryptoAmount) < MIN_OFFRAMP_USD) {
      setBelowMinError(
        `Minimum offramp amount is $${MIN_OFFRAMP_USD.toFixed(2)}.`,
      );
      return true;
    }
    setBelowMinError(null);
    return false;
  };

  const handleSubmit = async () => {
    if (belowMin()) return;
    try {
      await createOfframp.mutateAsync({
        crypto_asset: cryptoAsset,
        crypto_amount: Number(cryptoAmount),
        recipient_id: recipientId,
      });
      setSuccess(true);
    } catch {
      // error shown inline
    }
  };

  const offrampError =
    belowMinError ??
    (createOfframp.error instanceof Error ? createOfframp.error.message : null);

  if (success) {
    return (
      <SuccessState
        title="Offramp submitted"
        description="The naira will be paid to your bank account."
        onDone={onDone}
      >
        <Summary
          rows={[
            { label: "You sent", value: `${fmt(cryptoAmount)} ${cryptoAsset}` },
            {
              label: "To",
              value: selectedBank
                ? `${selectedBank.bank_name} · ${selectedBank.account_number}`
                : recipientId,
            },
          ]}
        />
      </SuccessState>
    );
  }

  const avail = available(cryptoAsset);

  return (
    <div className="flex flex-col gap-5">
      <Stepper steps={["Amount", "Recipient", "Review"]} current={step} />

      {step === 0 && (
        <>
          <div>
            <FieldLabel>You send</FieldLabel>
            <AmountField
              autoFocus
              value={cryptoAmount}
              onChange={(v) => {
                setCryptoAmount(v);
                setBelowMinError(null);
              }}
              currency={
                <CurrencyPicker
                  value={cryptoAsset}
                  options={OFFRAMP_ASSETS}
                  onChange={(v) => setCryptoAsset(v as WalletAsset)}
                />
              }
              hint={avail ? `Available: ${avail}` : undefined}
            />
          </div>
          <Note>
            Minimum offramp amount is ${MIN_OFFRAMP_USD.toFixed(2)}. You&apos;ll
            receive naira in a bank account.
          </Note>
          <ErrorNote message={belowMinError} />
          <PrimaryButton
            disabled={!(Number(cryptoAmount) > 0)}
            onClick={() => {
              if (!belowMin()) setStep(1);
            }}
          >
            Continue
          </PrimaryButton>
        </>
      )}

      {step === 1 && (
        <>
          <div>
            <FieldLabel>Bank recipient</FieldLabel>
            {banksLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-15 animate-pulse rounded-xl bg-dash-hover"
                  />
                ))}
              </div>
            ) : bankList.length > 0 ? (
              <div className="max-h-64 space-y-2 overflow-y-auto pr-0.5">
                {bankList.map((bank) => (
                  <OptionRow
                    key={bank.id}
                    selected={recipientId === bank.provider_recipient_id}
                    onSelect={() => setRecipientId(bank.provider_recipient_id)}
                    leading={
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dash-hover text-dash-muted">
                        <Landmark size={15} />
                      </span>
                    }
                    title={bank.account_name}
                    subtitle={`${bank.bank_name} · ${bank.account_number}`}
                  />
                ))}
              </div>
            ) : (
              <TextInput
                placeholder="Recipient ID"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
              />
            )}
          </div>
          <StepActions onBack={() => setStep(0)}>
            <PrimaryButton
              disabled={!recipientId.trim()}
              onClick={() => setStep(2)}
            >
              Continue
            </PrimaryButton>
          </StepActions>
        </>
      )}

      {step === 2 && (
        <>
          <Summary
            rows={[
              {
                label: "To",
                value: selectedBank ? selectedBank.account_name : recipientId,
              },
              ...(selectedBank
                ? [
                    {
                      label: "Bank",
                      value: `${selectedBank.bank_name} · ${selectedBank.account_number}`,
                    },
                  ]
                : []),
              { label: "Receive in", value: "NGN" },
              {
                label: "You send",
                value: `${fmt(cryptoAmount)} ${cryptoAsset}`,
                emphasis: true,
              },
            ]}
          />
          <ErrorNote message={offrampError} />
          <StepActions onBack={() => setStep(1)}>
            <PrimaryButton
              loading={createOfframp.isPending}
              onClick={handleSubmit}
            >
              Confirm offramp
            </PrimaryButton>
          </StepActions>
        </>
      )}
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────

export default function SwapModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<SwapModalTab>("crypto");
  // Remounts the flows on each open so they start fresh.
  const [session, setSession] = useState(0);

  const handleDone = useCallback(() => {
    onClose();
    setTab("crypto");
    setSession((s) => s + 1);
  }, [onClose]);

  const handleClose = useCallback(() => {
    onClose();
    setSession((s) => s + 1);
  }, [onClose]);

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      icon={ArrowLeftRight}
      tone="violet"
      title="Swap"
      subtitle="Convert between currencies or cash out to naira"
    >
      <div className="flex flex-col gap-5">
        <Segmented value={tab} options={TABS} onChange={setTab} />
        {tab === "crypto" && (
          <CryptoSwapFlow key={`c${session}`} onDone={handleDone} />
        )}
        {tab === "offramp" && (
          <OfframpFlow key={`o${session}`} onDone={handleDone} />
        )}
      </div>
    </ModalShell>
  );
}
