"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { API_BASE, refreshAccessToken } from "@/lib/api-client";
import { useProfile } from "@/lib/hooks/auth/useProfile";
import {
  REALTIME_EVENT_TYPES,
  type RealtimeEventType,
} from "@/lib/realtime/events";

type RealtimeListener = (data: Record<string, unknown>) => void;

interface RealtimeContextValue {
  connected: boolean;
  subscribe: (
    eventType: RealtimeEventType,
    listener: RealtimeListener,
  ) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  connected: false,
  subscribe: () => () => {},
});

// Query key roots that reflect money/transaction state and should refresh
// when a live event lands.
const INVALIDATE_ON_EVENT = [
  "webhooks",
  "wallets",
  "payment-sessions",
  "payouts-domain",
  "dashboard",
  "balance",
  "swaps",
  "refunds",
  "ledger",
  "ramp",
  "invoices",
  "pos-devices",
];

// A burst of related events (e.g. transaction.received → payment.completed
// for one payment) should trigger one refetch pass, not one per event.
const INVALIDATE_DEBOUNCE_MS = 400;

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_BASE_DELAY_MS = 500;

const TOAST_EVENTS: Partial<
  Record<RealtimeEventType, { variant: "success" | "error"; title: string }>
> = {
  "payment.completed": { variant: "success", title: "Payment completed" },
  "payment.partial": { variant: "error", title: "Partial payment" },
  "payment.failed": { variant: "error", title: "Payment failed" },
  "deposit.confirmed": { variant: "success", title: "Deposit confirmed" },
  "deposit.failed": { variant: "error", title: "Deposit failed" },
  "payout.success": { variant: "success", title: "Payout sent" },
  "payout.failed": { variant: "error", title: "Payout failed" },
  "swap.completed": { variant: "success", title: "Swap completed" },
  "swap.failed": { variant: "error", title: "Swap failed" },
  "offramp.completed": { variant: "success", title: "Offramp completed" },
  "offramp.failed": { variant: "error", title: "Offramp failed" },
  "refund.success": { variant: "success", title: "Refund completed" },
  "refund.failed": { variant: "error", title: "Refund failed" },
  "pos_device.linked": { variant: "success", title: "Device linked" },
};

function describeEvent(data: Record<string, unknown>): string | undefined {
  const amount = data.amount ?? data.netAmount ?? data.targetAmount;
  const unit = data.currency ?? data.asset ?? data.toCurrency;
  if (amount == null) return undefined;
  return unit ? `${String(amount)} ${String(unit)}` : String(amount);
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const listenersRef = useRef(
    new Map<RealtimeEventType, Set<RealtimeListener>>(),
  );
  const invalidateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [connected, setConnected] = useState(false);

  const mode = profile?.mode;

  useEffect(() => {
    if (!mode) return;

    let cancelled = false;
    let source: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cleanupListeners: (() => void) | null = null;
    let consecutiveFailures = 0;

    const scheduleInvalidate = () => {
      if (invalidateTimerRef.current) clearTimeout(invalidateTimerRef.current);
      invalidateTimerRef.current = setTimeout(() => {
        for (const root of INVALIDATE_ON_EVENT) {
          void qc.invalidateQueries({ queryKey: [root] });
        }
      }, INVALIDATE_DEBOUNCE_MS);
    };

    const connect = () => {
      const es = new EventSource(`${API_BASE}/realtime/events`, {
        withCredentials: true,
      });
      source = es;

      es.onopen = () => {
        setConnected(true);
        consecutiveFailures = 0;
      };

      es.onerror = () => {
        setConnected(false);
        if (cancelled) return;

        if (es.readyState === EventSource.CLOSED) {
          es.close();

          if (consecutiveFailures >= MAX_RECONNECT_ATTEMPTS) {
            console.warn(
              "[realtime] giving up after repeated connection failures — check auth/business context",
            );
            return;
          }
          consecutiveFailures += 1;

          void refreshAccessToken().then((refreshed) => {
            if (cancelled || !refreshed) return;
            const delay =
              RECONNECT_BASE_DELAY_MS * 2 ** (consecutiveFailures - 1);
            reconnectTimer = setTimeout(connect, delay);
          });
        }
      };

      const cleanups = REALTIME_EVENT_TYPES.map((eventType) => {
        const handler = (event: MessageEvent) => {
          let data: Record<string, unknown> = {};
          try {
            const raw = event.data as string;
            data = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
          } catch {
            // non-JSON payload — ignore, still route/invalidate below
          }

          listenersRef.current
            .get(eventType)
            ?.forEach((listener) => listener(data));

          const toastConfig = TOAST_EVENTS[eventType];
          if (toastConfig) {
            toast[toastConfig.variant](toastConfig.title, {
              description: describeEvent(data),
            });
          }

          scheduleInvalidate();
        };

        es.addEventListener(eventType, handler);
        return () => es.removeEventListener(eventType, handler);
      });

      cleanupListeners = () => cleanups.forEach((cleanup) => cleanup());
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (invalidateTimerRef.current) clearTimeout(invalidateTimerRef.current);
      cleanupListeners?.();
      source?.close();
      setConnected(false);
    };
  }, [mode, qc]);

  const subscribe = useCallback(
    (eventType: RealtimeEventType, listener: RealtimeListener) => {
      const listeners = listenersRef.current;
      if (!listeners.has(eventType)) listeners.set(eventType, new Set());
      listeners.get(eventType)!.add(listener);
      return () => listeners.get(eventType)?.delete(listener);
    },
    [],
  );

  const value = useMemo<RealtimeContextValue>(
    () => ({ connected, subscribe }),
    [connected, subscribe],
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}

/**
 * Subscribe a component to one live event type — e.g. to refresh a specific
 * view beyond the provider's default broad invalidation, or react to an
 * event that isn't in the default toast list. `listener` should have a
 * stable identity (useCallback) to avoid resubscribing every render.
 */
export function useRealtimeEvent(
  eventType: RealtimeEventType,
  listener: RealtimeListener,
) {
  const { subscribe } = useRealtime();
  useEffect(
    () => subscribe(eventType, listener),
    [eventType, listener, subscribe],
  );
}
