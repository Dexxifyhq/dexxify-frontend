"use client";

import { useCallback, useState } from "react";
import { ArrowUpFromLine, Landmark } from "lucide-react";
import {
  useSavedWithdrawalAddresses,
  useWithdrawFiat,
  useWithdrawStableCoin,
} from "@/lib/hooks/deposit-accounts/useDepositAccounts";
import { useSavedBanks } from "@/lib/hooks/misc/useMisc";
import { useLedgerBalance } from "@/lib/hooks/ledger/useLedger";
import type { WithdrawalAddress } from "@/lib/types/deposit-accounts";
import type { SavedBank } from "@/lib/types/misc";
import {
  AmountField,
  AssetLogo,
  CurrencyBadge,
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
  shortAddress,
} from "./modal-kit";

type WithdrawTab = "stablecoin" | "fiat";

const TABS: { value: WithdrawTab; label: string }[] = [
  { value: "stablecoin", label: "Stablecoin" },
  { value: "fiat", label: "Bank (NGN)" },
];
const STEPS = ["Destination", "Amount", "Review"];

// CC MIN_STABLECOIN_WITHDRAWAL = 1.2
// CC MIN_FIAT_WITHDRAWAL = 1000
const MIN_STABLECOIN_WITHDRAWAL_AMOUNT = 2;
const MIN_FIAT_WITHDRAWAL_AMOUNT = 2000;
const FIAT_FEE_AMOUNT = 400;
const STABLECOIN_FEE_AMOUNT = 1.5;
const MIN_STABLECOIN_WITHDRAWAL = "$2.00";
const MIN_FIAT_WITHDRAWAL = "₦2000";
const STABLECOIN_FEE = "$1.50";
const FIAT_FEE = "₦400.00";

export default function WithdrawModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<WithdrawTab>("stablecoin");
  const [step, setStep] = useState(0);

  // Stablecoin state
  const [scAddress, setScAddress] = useState("");
  const [scLabel, setScLabel] = useState("");
  const [scAmount, setScAmount] = useState("");
  const [scNetwork, setScNetwork] = useState("");
  const [scToken, setScToken] = useState("");
  const [scSuccess, setScSuccess] = useState(false);

  // Fiat state
  const [fiatBankId, setFiatBankId] = useState("");
  const [fiatAmount, setFiatAmount] = useState("");
  const [fiatNarration, setFiatNarration] = useState("");
  const [fiatSuccess, setFiatSuccess] = useState(false);
  const [brokenLogos, setBrokenLogos] = useState<Set<string>>(new Set());

  const withdrawStableCoin = useWithdrawStableCoin();
  const withdrawFiat = useWithdrawFiat();
  const { data: savedAddresses } = useSavedWithdrawalAddresses();
  const { data: savedBanks } = useSavedBanks();
  const { data: balance } = useLedgerBalance();

  const addressList = (savedAddresses as WithdrawalAddress[] | undefined) ?? [];
  const bankList = (savedBanks as SavedBank[] | undefined) ?? [];
  const selectedBank = bankList.find((b) => b.id === fiatBankId);

  let scError;
  let fiatError;

  const handleClose = useCallback(() => {
    setStep(0);
    setScSuccess(false);
    setFiatSuccess(false);
    withdrawStableCoin.reset();
    withdrawFiat.reset();
    onClose();
  }, [onClose, withdrawStableCoin, withdrawFiat]);

  const switchTab = (t: WithdrawTab) => {
    setTab(t);
    setStep(0);
  };

  const handleStablecoinSubmit = async () => {
    if (
      !scAmount ||
      Number(scAmount) <
        MIN_STABLECOIN_WITHDRAWAL_AMOUNT + STABLECOIN_FEE_AMOUNT
    ) {
      scError = "Insufficient balance to process withdrawal";
      return;
    }
    try {
      await withdrawStableCoin.mutateAsync({
        address: scAddress,
        amount: Number(scAmount),
        network: scNetwork,
        token: scToken,
        externalId: crypto.randomUUID(),
      });
      setScSuccess(true);
    } catch {
      // error shown inline
    }
  };

  const handleFiatSubmit = async () => {
    if (
      !fiatAmount ||
      Number(fiatAmount) < MIN_FIAT_WITHDRAWAL_AMOUNT + FIAT_FEE_AMOUNT
    ) {
      fiatError = "Insufficient balance to process withdrawal";
      return;
    }
    try {
      await withdrawFiat.mutateAsync({
        bank_id: fiatBankId,
        amount: Number(fiatAmount),
        narration: fiatNarration || undefined,
      });
      setFiatSuccess(true);
    } catch {
      // error shown inline
    }
  };

  scError =
    withdrawStableCoin.error instanceof Error
      ? withdrawStableCoin.error.message
      : null;
  fiatError =
    withdrawFiat.error instanceof Error ? withdrawFiat.error.message : null;

  const scAmountError =
    scAmount.trim() !== "" &&
    Number(scAmount) > 0 &&
    Number(scAmount) < MIN_STABLECOIN_WITHDRAWAL_AMOUNT
      ? `Minimum withdrawal is ${MIN_STABLECOIN_WITHDRAWAL}.`
      : null;
  const fiatAmountError =
    fiatAmount.trim() !== "" &&
    Number(fiatAmount) > 0 &&
    Number(fiatAmount) < MIN_FIAT_WITHDRAWAL_AMOUNT
      ? `Minimum withdrawal is ${MIN_FIAT_WITHDRAWAL}.`
      : null;

  // Available balance for the token being withdrawn, when the ledger tracks it.
  const tokenKey = scToken.toLowerCase();
  const scAvailable =
    tokenKey === "usdt" || tokenKey === "usdc"
      ? balance?.[tokenKey].balance
      : undefined;

  const success = tab === "stablecoin" ? scSuccess : fiatSuccess;

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      icon={ArrowUpFromLine}
      tone="blue"
      title="Withdraw funds"
      subtitle="Send to a crypto wallet or a Nigerian bank account"
    >
      {success ? (
        tab === "stablecoin" ? (
          <SuccessState
            title="Withdrawal submitted"
            description="Your stablecoin withdrawal is on its way."
            onDone={handleClose}
          >
            <Summary
              rows={[
                { label: "Amount", value: `${fmt(scAmount)} ${scToken}` },
                { label: "To", value: scLabel || shortAddress(scAddress) },
                { label: "Network", value: scNetwork || "—" },
              ]}
            />
          </SuccessState>
        ) : (
          <SuccessState
            title="Withdrawal submitted"
            description="Your bank withdrawal is on its way."
            onDone={handleClose}
          >
            <Summary
              rows={[
                { label: "Amount", value: `₦${fmt(fiatAmount)}` },
                {
                  label: "To",
                  value: selectedBank
                    ? `${selectedBank.bank_name} · ${selectedBank.account_number}`
                    : fiatBankId,
                },
              ]}
            />
          </SuccessState>
        )
      ) : (
        <div className="flex flex-col gap-5">
          <Segmented value={tab} options={TABS} onChange={switchTab} />
          <Stepper steps={STEPS} current={step} />

          {/* ── Stablecoin ─────────────────────────────────────────── */}
          {tab === "stablecoin" && step === 0 && (
            <>
              {addressList.length > 0 && (
                <div>
                  <FieldLabel>Saved addresses</FieldLabel>
                  <div className="max-h-56 space-y-2 overflow-y-auto pr-0.5">
                    {addressList.map((sa) => (
                      <OptionRow
                        key={sa.id}
                        selected={scAddress === sa.address}
                        onSelect={() => {
                          setScAddress(sa.address);
                          setScLabel(sa.label);
                          setScNetwork(sa.network);
                          setScToken(sa.token);
                        }}
                        leading={
                          <AssetLogo symbol={sa.token} className="h-8 w-8" />
                        }
                        title={sa.label}
                        subtitle={`${shortAddress(sa.address)} · ${sa.network}`}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div>
                <FieldLabel>
                  {addressList.length === 0 &&
                    "Please add a wallet address for withdrawal"}
                </FieldLabel>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Network</FieldLabel>
                  <div className="flex h-11 items-center rounded-xl bg-dash-bg px-3.5 text-sm text-dash-muted">
                    {scNetwork || "—"}
                  </div>
                </div>
                <div>
                  <FieldLabel>Token</FieldLabel>
                  <div className="flex h-11 items-center rounded-xl bg-dash-bg px-3.5 text-sm text-dash-muted">
                    {scToken || "—"}
                  </div>
                </div>
              </div>
              <PrimaryButton
                disabled={!scAddress.trim()}
                onClick={() => setStep(1)}
              >
                Continue
              </PrimaryButton>
            </>
          )}

          {tab === "stablecoin" && step === 1 && (
            <>
              <div>
                <FieldLabel>Amount</FieldLabel>
                <AmountField
                  autoFocus
                  value={scAmount}
                  onChange={setScAmount}
                  currency={<CurrencyBadge code={scToken} />}
                  hint={
                    scAvailable !== undefined
                      ? `Available: ${fmt(scAvailable)} ${scToken}`
                      : undefined
                  }
                />
              </div>
              <Note>Minimum withdrawal is {MIN_STABLECOIN_WITHDRAWAL}.</Note>
              <Note>A {STABLECOIN_FEE} fee is deducted from your balance.</Note>
              <ErrorNote message={scAmountError} />
              <StepActions onBack={() => setStep(0)}>
                <PrimaryButton
                  disabled={
                    !(Number(scAmount) >= MIN_STABLECOIN_WITHDRAWAL_AMOUNT)
                  }
                  onClick={() => {
                    scError = null;
                    setStep(2);
                  }}
                >
                  Continue
                </PrimaryButton>
              </StepActions>
            </>
          )}

          {tab === "stablecoin" && step === 2 && (
            <>
              <Summary
                rows={[
                  { label: "To", value: scLabel || shortAddress(scAddress) },
                  {
                    label: "Address",
                    value: (
                      <span className="font-mono text-xs">{scAddress}</span>
                    ),
                  },
                  { label: "Network", value: scNetwork || "—" },
                  { label: "Fee", value: `${STABLECOIN_FEE} · from balance` },
                  {
                    label: "Amount",
                    value: `${fmt(scAmount)} ${scToken}`,
                    emphasis: true,
                  },
                ]}
              />
              <ErrorNote message={scError} />
              <StepActions onBack={() => setStep(1)}>
                <PrimaryButton
                  loading={withdrawStableCoin.isPending}
                  onClick={handleStablecoinSubmit}
                >
                  Confirm withdrawal
                </PrimaryButton>
              </StepActions>
            </>
          )}

          {/* ── Fiat ───────────────────────────────────────────────── */}
          {tab === "fiat" && step === 0 && (
            <>
              <div>
                <FieldLabel>Bank recipient</FieldLabel>
                {bankList.length > 0 ? (
                  <div className="max-h-64 space-y-2 overflow-y-auto pr-0.5">
                    {bankList.map((bank) => (
                      <OptionRow
                        key={bank.id}
                        selected={fiatBankId === bank.id}
                        onSelect={() => setFiatBankId(bank.id)}
                        leading={
                          bank.logo_url && !brokenLogos.has(bank.logo_url) ? (
                            <img
                              src={bank.logo_url}
                              alt=""
                              className="h-8 w-8 shrink-0 rounded-full bg-dash-hover object-contain"
                              onError={() =>
                                setBrokenLogos((s) =>
                                  new Set(s).add(bank.logo_url),
                                )
                              }
                            />
                          ) : (
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dash-hover text-dash-muted">
                              <Landmark size={15} />
                            </span>
                          )
                        }
                        title={bank.account_name}
                        subtitle={`${bank.bank_name} · ${bank.account_number}`}
                      />
                    ))}
                  </div>
                ) : (
                  <TextInput
                    placeholder="Recipient ID"
                    value={fiatBankId}
                    onChange={(e) => setFiatBankId(e.target.value)}
                  />
                )}
              </div>
              <PrimaryButton
                disabled={!fiatBankId.trim()}
                onClick={() => setStep(1)}
              >
                Continue
              </PrimaryButton>
            </>
          )}

          {tab === "fiat" && step === 1 && (
            <>
              <div>
                <FieldLabel>Amount</FieldLabel>
                <AmountField
                  autoFocus
                  value={fiatAmount}
                  onChange={setFiatAmount}
                  currency={<CurrencyBadge code="NGN" />}
                  hint={
                    balance
                      ? `Available: ₦${fmt(balance.ngn.balance)}`
                      : undefined
                  }
                />
              </div>
              <div>
                <FieldLabel>Narration (optional)</FieldLabel>
                <TextInput
                  placeholder="Payment description…"
                  value={fiatNarration}
                  onChange={(e) => setFiatNarration(e.target.value)}
                />
              </div>
              <Note>Minimum withdrawal is {MIN_FIAT_WITHDRAWAL}.</Note>
              <Note>A {FIAT_FEE} fee is deducted from your balance.</Note>
              <ErrorNote message={fiatAmountError} />
              <StepActions onBack={() => setStep(0)}>
                <PrimaryButton
                  disabled={!(Number(fiatAmount) >= MIN_FIAT_WITHDRAWAL_AMOUNT)}
                  onClick={() => {
                    fiatError = null;
                    setStep(2);
                  }}
                >
                  Continue
                </PrimaryButton>
              </StepActions>
            </>
          )}

          {tab === "fiat" && step === 2 && (
            <>
              <Summary
                rows={[
                  {
                    label: "To",
                    value: selectedBank
                      ? selectedBank.account_name
                      : fiatBankId,
                  },
                  ...(selectedBank
                    ? [
                        {
                          label: "Bank",
                          value: `${selectedBank.bank_name} · ${selectedBank.account_number}`,
                        },
                      ]
                    : []),
                  ...(fiatNarration
                    ? [{ label: "Narration", value: fiatNarration }]
                    : []),
                  { label: "Fee", value: `${FIAT_FEE} · from balance` },
                  {
                    label: "Amount",
                    value: `₦${fmt(fiatAmount)}`,
                    emphasis: true,
                  },
                ]}
              />
              <ErrorNote message={fiatError} />
              <StepActions onBack={() => setStep(1)}>
                <PrimaryButton
                  loading={withdrawFiat.isPending}
                  onClick={handleFiatSubmit}
                >
                  Confirm withdrawal
                </PrimaryButton>
              </StepActions>
            </>
          )}
        </div>
      )}
    </ModalShell>
  );
}
