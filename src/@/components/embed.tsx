"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/@/components/ui/button";

const EASE_STANDARD: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export function Embed({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const round = searchParams.get("round");
  const [copy, setCopy] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  function copyUrlToClipboard() {
    void navigator.clipboard.writeText(
      `${window.location.origin}/obs/${slug}?${!round ? "" : "round=1&"}${
        round === "Final" ? "" : "heat=1"
      }`,
    );

    setCopy(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    toast.info("Linkki kopioitu leikepöydälle");

    timeoutRef.current = window.setTimeout(() => {
      setCopy(false);
      timeoutRef.current = null;
    }, 1500);
  }

  return (
    <Button
      className="w-full gap-2 transition-none"
      onClick={copyUrlToClipboard}
      variant="secondary"
      render={
        <motion.button
          whileTap={{
            scale: 0.97,
            transition: {
              duration: 0.12,
              ease: EASE_STANDARD,
            },
          }}
        />
      }
    >
      <div className="relative flex size-4 items-center justify-center">
        <AnimatePresence initial={false}>
          {copy ? (
            <motion.span
              key="check"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.15,
                ease: EASE_STANDARD,
              }}
              className="absolute inset-0"
            >
              <CheckIcon className="size-4" />
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.15,
                ease: EASE_STANDARD,
              }}
              className="absolute inset-0"
            >
              <CopyIcon className="size-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <span className="sr-only text-sm sm:not-sr-only">
        {copy ? "Kopioitu!" : "Kopioi linkki"}
      </span>
    </Button>
  );
}
