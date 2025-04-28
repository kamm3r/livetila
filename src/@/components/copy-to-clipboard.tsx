"use client";

import { Embed } from "~/@/components/embed";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/@/components/ui/tooltip";

export function CopytoClipboard({ slug }: { slug: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Embed slug={slug} />
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <h4 className="leading-none font-medium">OBS Overlay</h4>
              <p className="text-muted-foreground text-sm">
                Get your live stream overlay for track and field
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
