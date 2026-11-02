"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api-client";
import type {
  PaymentPartialEvent,
  PaymentCompletedEvent,
  PaymentFailedEvent,
} from "@/lib/types/payment-session-events";

interface PaymentSessionEventsState {
  partial: PaymentPartialEvent | null;
  completed: PaymentCompletedEvent | null;
  failed: PaymentFailedEvent | null;
}

const INITIAL_STATE: PaymentSessionEventsState = {
  partial: null,
  completed: null,
  failed: null,
};

export function usePaymentSessionEvents(
  sessionId: string | undefined,
  enabled = true,
): PaymentSessionEventsState {
  const [state, setState] = useState<PaymentSessionEventsState>(INITIAL_STATE);

  useEffect(() => {
    if (!sessionId || !enabled) return;

    const source = new EventSource(
      `${API_BASE}/payment-sessions/${sessionId}/events`,
    );

    const listen = <T>(type: string, handler: (data: T) => void) => {
      const onEvent = (event: MessageEvent) => {
        try {
          handler(JSON.parse(event.data as string) as T);
        } catch {
          // malformed payload — ignore this frame
        }
      };
      source.addEventListener(type, onEvent);
      return () => source.removeEventListener(type, onEvent);
    };

    const cleanups = [
      listen<PaymentPartialEvent>("payment.partial", (data) =>
        setState((s) => ({ ...s, partial: data })),
      ),
      listen<PaymentCompletedEvent>("payment.completed", (data) => {
        setState((s) => ({ ...s, completed: data }));
        source.close();
      }),
      listen<PaymentFailedEvent>("payment.failed", (data) => {
        setState((s) => ({ ...s, failed: data }));
        source.close();
      }),
    ];

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      source.close();
    };
  }, [sessionId, enabled]);

  return state;
}
