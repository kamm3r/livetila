// How an event's progress reads in lists: a coloured dot and a short label.
// The event switcher and event search share these so they never disagree.
export const eventStatusDot: Record<string, string> = {
  Unallocated: "bg-muted-foreground/40",
  Allocated: "bg-sky-500",
  Progress: "bg-red-500",
  Official: "bg-emerald-500",
};

export const eventStatusLabel: Record<string, string> = {
  Unallocated: "Eräjako tulossa",
  Allocated: "Eräjaot tehty",
  Progress: "LIVE",
  Official: "Tulokset valmiit",
};
