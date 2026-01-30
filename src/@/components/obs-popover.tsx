"use client";

import { InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  return (
    <Popover>
      <PopoverTrigger className="top-9 right-5 z-50">
        <div className="group/button inline-flex h-8 shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap in-data-[slot=button-group]:rounded-md rounded-[min(var(--radius-md),10px)] border border-border bg-background bg-clip-padding px-2.5 font-medium text-sm shadow-xs outline-none transition-all duration-200 hover:scale-105 hover:border-primary/50 hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-expanded:bg-muted aria-expanded:text-foreground aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:border-input dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 dark:hover:bg-input/50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0">
          <InfoIcon className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only">OBS Overlay</span>
        </div>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-full max-w-96">
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
    </Popover>
  );
}
