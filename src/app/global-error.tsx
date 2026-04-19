"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="bg-[#09090B] text-[#FAFAFA] min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[#71717A] text-sm">Something went wrong.</p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-md hover:bg-[#1D4ED8] transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
