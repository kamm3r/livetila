"use client";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
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
    setTimeout(() => setCopy(false), 1000);
  }
  return (
    <Button
      className="w-full gap-2 transition-none ease-initial"
      onClick={copyUrlToClipboard}
      variant="secondary"
      render={
        <motion.button whileTap={{ scale: 0.97, transitionDuration: 0.15 }} />
      }
    >
      {copy ? (
        <CheckIcon className="size-4 ease-initial" />
      ) : (
        <CopyIcon className="size-4 ease-initial" />
      )}
      <span className="sr-only text-sm sm:not-sr-only">
        {copy ? "Kopioitu!" : "Kopioi linkki"}
      </span>
    </Button>
  );
}
