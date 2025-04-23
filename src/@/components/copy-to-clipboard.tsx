"use client";

import { InfoIcon } from "lucide-react";
import { Embed } from "~/@/components/embed";
import { Button } from "~/@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/@/components/ui/popover";

export function CopytoClipboard({ slug }: { slug: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild className="">
        <Button variant="ghost" className="px-2" size="icon">
          <InfoIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">OBS Overlay</h4>
            <p className="text-muted-foreground text-sm">
              Get your live stream overlay for track and field
            </p>
          </div>
          <div className="flex gap-4">
            <Embed slug={slug} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
