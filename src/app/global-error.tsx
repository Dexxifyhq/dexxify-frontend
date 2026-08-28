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
      <body className="bg-[#212529] text-[#F8F9FA] min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[#ADB5BD] text-sm">Something went wrong.</p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-[#E9ECEF] text-[#212529] text-sm rounded-md hover:bg-[#F8F9FA] transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
