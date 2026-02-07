"use client";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/@/components/ui/button";

export function Embed({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const round = searchParams.get("round");
  const [copy, setCopy] = useState(false);
  function copyUrlToClipboard() {
    void navigator.clipboard.writeText(
      `${window.location.origin}/obs/${slug}?${!round ? "" : "round=1&"}${round === "Final" ? "" : "heat=1"}`,
    );
    setCopy(true);
    toast.info("Linkki kopioitu leikepöydälle");
    setTimeout(() => setCopy(false), 1500);
  }
  return (
    <Button
      className="w-full gap-2 transition-none ease-initial"
      onClick={copyUrlToClipboard}
      variant="secondary"
      render={
        <motion.button
          whileTap={{
            scale: 0.97,
            transition: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] },
          }}
        />
      }
    >
      <div className="relative flex size-4 items-center justify-center">
        <AnimatePresence initial={false}>
          {copy ? (
            <motion.span
              key="close"
              initial={{ opacity: 0, transition: { duration: 0.15 } }}
              animate={{ opacity: 1, transition: { duration: 0.15 } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0"
            >
              <CheckIcon className="size-4" />
            </motion.span>
          ) : (
            <motion.span
              key="info"
              initial={{ opacity: 0, transition: { duration: 0.15 } }}
              animate={{ opacity: 1, transition: { duration: 0.15 } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
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
