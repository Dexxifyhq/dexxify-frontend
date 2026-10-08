// Human-readable copy for a payment.failed SSE event's `reason` code —
// shared across every hosted payment surface (checkout sessions, invoices,
// payment pages).

const FAILURE_REASONS: Record<string, string> = {
  compliance_rejected:
    "This payment was flagged by compliance checks and couldn't be completed.",
  expired: "The payment window for this session expired.",
};

export function humanizeFailureReason(reason?: string): string {
  if (!reason) {
    return "Something went wrong processing your payment. Please contact the merchant for help.";
  }
  return (
    FAILURE_REASONS[reason] ??
    reason.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase())
  );
}
