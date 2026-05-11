import { useState, useEffect, useRef, useCallback } from "react";

export function useScrollDirection(threshold = 6) {
  const [scrolledDown, setScrolledDown] = useState(false);
  const lastY = useRef(0);
  const pausedUntil = useRef(0);

  const pause = useCallback((ms: number) => {
    pausedUntil.current = Date.now() + ms;
  }, []);

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY;
      // While paused: keep lastY current so the first post-pause event
      // compares against the settled position, not a stale one.
      if (Date.now() < pausedUntil.current) {
        lastY.current = y;
        return;
      }
      if (y <= 0) {
        setScrolledDown(false);
        lastY.current = 0;
        return;
      }
      const delta = y - lastY.current;
      lastY.current = y;
      if (delta > threshold) setScrolledDown(true);
      else if (delta < -threshold) setScrolledDown(false);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [threshold]);

  return { scrolledDown, pause };
}
