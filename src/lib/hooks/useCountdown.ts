import { useState, useEffect } from "react";

export function useCountdown(initial = 0) {
  const [count, setCount] = useState(initial);

  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  const start = (seconds: number) => setCount(seconds);
  const reset = () => setCount(0);

  return { count, start, reset };
}
