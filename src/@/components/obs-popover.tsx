"use client";

import { InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Embed } from "~/@/components/embed";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "~/@/components/ui/popover";

const popoverVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      bounce: 0.25,
      duration: 0.5,
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    filter: "blur(10px)",
    transition: { duration: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

export function ObsPopover({ slug }: { slug: string }) {
  const [origin, setOrigin] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="top-9 right-5 z-50">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={open ? { rotate: 90 } : { rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="group/button inline-flex h-8 shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap in-data-[slot=button-group]:rounded-md rounded-[min(var(--radius-md),10px)] border border-border bg-background bg-clip-padding px-2.5 font-medium text-sm shadow-xs outline-none transition-all duration-200 hover:scale-105 hover:border-primary/50 hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-expanded:bg-muted aria-expanded:text-foreground aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:border-input dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 dark:hover:bg-input/50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0"
        >
          <AnimatePresence mode="wait" initial={false}>
            <InfoIcon className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">OBS Overlay</span>
          </AnimatePresence>
        </motion.div>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-full max-w-96">
        <motion.div
          variants={popoverVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <PopoverHeader>
            <motion.div variants={itemVariants}>
              <PopoverTitle>OBS Overlay</PopoverTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <PopoverDescription>
                jos haluut näyttää vain tietyn erän tulokset niin tee näin
              </PopoverDescription>
            </motion.div>
          </PopoverHeader>
          <motion.div className="flex flex-col gap-4" variants={itemVariants}>
            <motion.div className="space-y-2" variants={itemVariants}>
              <div className="break-all rounded-lg border bg-muted/90 p-3 font-mono text-sm">
                {`${origin}`}/obs/{slug}
                <br />
                <span className="rounded bg-primary/20 px-1 py-0.5 text-primary">
                  ?round=1&heat=1
                </span>
              </div>
              <motion.div className="text-xs text-muted-foreground">
                Vaihda <code>round</code> ja <code>heat</code> arvoja tarpeen
                mukaan.
              </motion.div>
            </motion.div>
            <Embed slug={slug} />
          </motion.div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
