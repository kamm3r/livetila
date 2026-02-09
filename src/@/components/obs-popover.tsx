"use client";

import { InfoIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { Embed } from "~/@/components/embed";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "~/@/components/ui/popover";

export function ObsPopover({ slug }: { slug: string }) {
  const [origin, setOrigin] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const actionsRef = useRef(null);
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen} actionsRef={actionsRef}>
      <PopoverTrigger
        className="inline-flex h-8 shrink-0 rounded select-none items-center justify-center gap-2 whitespace-nowrap border border-border bg-background bg-clip-padding px-2.5 font-medium text-sm shadow-xs outline-none hover:border-primary/50 hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0"
        render={
          <motion.button
            whileTap={{
              scale: 0.97,
              transition: {
                duration: 0.12,
                ease: [0.25, 0.1, 0.25, 1],
              },
            }}
          />
        }
      >
        <InfoIcon className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only">OBS Overlay</span>
      </PopoverTrigger>
      <AnimatePresence>
        {open ? (
          <PopoverContent
            align="end"
            className="w-full max-w-96"
            render={
              <motion.div
                initial={{ opacity: 0, transform: "scale(0.2)" }}
                animate={{ opacity: 1, transform: "scale(1)" }}
                exit={{ opacity: 0, transform: "scale(0.2)" }}
                transition={{ type: "spring", duration: 0.4, bounce: 0 }}
              />
            }
          >
            <PopoverHeader>
              <PopoverTitle>OBS Overlay</PopoverTitle>
              <PopoverDescription>
                jos haluut näyttää vain tietyn erän tulokset niin tee näin
              </PopoverDescription>
            </PopoverHeader>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <div className="break-all rounded-lg border bg-muted/90 p-3 font-mono text-sm">
                  {`${origin}`}/obs/{slug}
                  <br />
                  <span className="rounded bg-primary/20 px-1 py-0.5 text-primary">
                    ?round=1&heat=1
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Vaihda <code>round</code> ja <code>heat</code> arvoja tarpeen
                  mukaan.
                </div>
              </div>
              <Embed slug={slug} />
            </div>
          </PopoverContent>
        ) : null}
      </AnimatePresence>
    </Popover>
  );
}
