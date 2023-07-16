"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "../@/components/ui/command";
import { Button } from "../@/components/ui/button";
// import { compsAtom, filteredCompsAtom, inputAtom } from "../utils/store";
// import { useAtom, useAtomValue } from "jotai";
import { useQuery as searchQuery } from "@tanstack/react-query";
import { CompetitionList } from "../types/comp";
import { CircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function Search() {
  const router = useRouter();
  const { data: searchData } = searchQuery({
    queryKey: ["competitions"],
    queryFn: () =>
      fetch(
        "https://cached-public-api.tuloslista.com/live/v1/competition"
      ).then((res) => res.json()) as Promise<CompetitionList[]>,
  });
  // const [_, setComp] = useAtom(compsAtom);
  // setComp(searchData!);
  // const list = useAtomValue(filteredCompsAtom);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.altKey)) {
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className="w-full text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-none"
          aria-hidden="true"
        >
          <path d="m19 19-3.5-3.5" />
          <circle cx="11" cy="11" r="6" />
        </svg>
        <span className="flex-auto">Quick search...</span>
        <kbd className="font-sans font-semibold">
          <abbr className="text-no-underline">Alt</abbr> K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {/* <CommandGroup heading="Suggestions">
          </CommandGroup>
          <CommandSeparator /> */}
          <CommandGroup heading="Kilpailut">
            {searchData?.map((comp) => (
              <CommandItem
                key={comp.Id}
                onSelect={() => {
                  runCommand(() => router.push(`/${comp.Id}`));
                }}
              >
                <div className="mr-2 flex h-4 w-4 items-center justify-center">
                  <CircleIcon className="h-3 w-3" />
                </div>
                <span>{comp.Name}</span>-
                <span>
                  {new Date(comp.Date).toLocaleString("fi-FI", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                  })}
                </span>
                <CommandShortcut>Alt P</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
