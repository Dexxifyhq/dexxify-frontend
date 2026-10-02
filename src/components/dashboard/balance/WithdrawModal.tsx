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

const STABLECOIN_FEE = "$1.00";
const FIAT_FEE = "₦300.00";

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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

  const withdrawStableCoin = useWithdrawStableCoin();
  const withdrawFiat = useWithdrawFiat();
  const { data: savedAddresses } = useSavedWithdrawalAddresses();
  const { data: savedBanks } = useSavedBanks();
  const { data: balance } = useLedgerBalance();

  const addressList = (savedAddresses as WithdrawalAddress[] | undefined) ?? [];
  const bankList = (savedBanks as SavedBank[] | undefined) ?? [];
  const selectedBank = bankList.find(
    (b) => b.provider_recipient_id === fiatBankId,
  );

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
    try {
      await withdrawStableCoin.mutateAsync({
        address: scAddress,
        amount: Number(scAmount),
        network: scNetwork,
        token: scToken,
        externalId: generateUUID(),
      });
      setScSuccess(true);
    } catch {
      // error shown inline
    }
  };

  const handleFiatSubmit = async () => {
    try {
      await withdrawFiat.mutateAsync({
        recipient_id: fiatBankId,
        amount: Number(fiatAmount),
        narration: fiatNarration || undefined,
      });
      setFiatSuccess(true);
    } catch {
      // error shown inline
    }
  };

  const scError =
    withdrawStableCoin.error instanceof Error
      ? withdrawStableCoin.error.message
      : null;
  const fiatError =
    withdrawFiat.error instanceof Error ? withdrawFiat.error.message : null;

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
                        leading={<AssetLogo symbol={sa.token} className="h-8 w-8" />}
                        title={sa.label}
                        subtitle={`${shortAddress(sa.address)} · ${sa.network}`}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div>
                <FieldLabel>
                  {addressList.length > 0
                    ? "Or enter an address"
                    : "Destination address"}
                </FieldLabel>
                <TextInput
                  placeholder="0x…"
                  value={scAddress}
                  onChange={(e) => {
                    setScAddress(e.target.value);
                    setScLabel("");
                  }}
                  className="font-mono"
                />
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
              <Note>
                A {STABLECOIN_FEE} fee is deducted from your balance.
              </Note>
              <StepActions onBack={() => setStep(0)}>
                <PrimaryButton
                  disabled={!(Number(scAmount) > 0)}
                  onClick={() => setStep(2)}
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
                  { label: "Address", value: <span className="font-mono text-xs">{scAddress}</span> },
                  { label: "Network", value: scNetwork || "—" },
                  { label: "Fee", value: `${STABLECOIN_FEE} · from balance` },
                  { label: "Amount", value: `${fmt(scAmount)} ${scToken}`, emphasis: true },
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
                        selected={fiatBankId === bank.provider_recipient_id}
                        onSelect={() => setFiatBankId(bank.provider_recipient_id)}
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
              <Note>A {FIAT_FEE} fee is deducted from your balance.</Note>
              <StepActions onBack={() => setStep(0)}>
                <PrimaryButton
                  disabled={!(Number(fiatAmount) > 0)}
                  onClick={() => setStep(2)}
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
                    value: selectedBank ? selectedBank.account_name : fiatBankId,
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
                  { label: "Amount", value: `₦${fmt(fiatAmount)}`, emphasis: true },
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
