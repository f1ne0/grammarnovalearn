import { Box } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * Scrollable area with a fully custom scrollbar — the native scrollbar is
 * hidden and we render our own thumb. This avoids macOS/Chrome overlay quirks
 * (where the native bar only shows while actively scrolling). The thumb is
 * visible while hovering the area (and only when content overflows).
 */
export function ScrollArea({
  maxHeight,
  children,
}: {
  maxHeight: string | number;
  children: ReactNode;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const [thumb, setThumb] = useState({ height: 0, top: 0, visible: false });

  const recompute = useCallback(() => {
    const el = viewport.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight + 1) {
      setThumb((t) => (t.visible ? { ...t, visible: false } : t));
      return;
    }
    const h = Math.max(28, (clientHeight / scrollHeight) * clientHeight);
    const top =
      (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - h);
    setThumb({ height: h, top, visible: true });
  }, []);

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    // Observe content changes (rows added/removed)
    const mo = new MutationObserver(recompute);
    mo.observe(el, { childList: true, subtree: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [recompute]);

  return (
    <Box
      position="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Box
        ref={viewport}
        maxH={maxHeight}
        overflowY="auto"
        overscrollBehavior="contain"
        onScroll={recompute}
        css={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": { width: 0, height: 0, display: "none" },
        }}
      >
        {children}
      </Box>
      {thumb.visible && (
        <Box
          position="absolute"
          right="2px"
          top={`${thumb.top}px`}
          w="6px"
          h={`${thumb.height}px`}
          borderRadius="999px"
          bg="#3a3a40"
          opacity={hover ? 1 : 0}
          transition="opacity 150ms ease"
          pointerEvents="none"
        />
      )}
    </Box>
  );
}
