"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/@/components/ui/card";
import { Input } from "~/@/components/ui/input";
import { Button } from "~/@/components/ui/button";
import {
  CalendarIcon,
  Search,
  Filter,
  X,
  Check,
  Download,
  Share2,
  MapPin,
  Star,
  Clock,
  Tag,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { fi } from "date-fns/locale";
import { Calendar } from "~/@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/@/components/ui/command";
import { Badge } from "~/@/components/ui/badge";
import { cn } from "~/@/lib/utils";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/@/components/ui/dropdown-menu";
import { useMediaQuery } from "~/@/hooks/use-mobile";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/@/components/ui/tooltip";
import {
  getStatusLabel,
  getStatusBadgeColor,
  getVenueType,
} from "~/@/utils/event-utils";
import { type Competitions } from "~/types/events";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/@/components/ui/table";

export function EventsList({ competitions }: { competitions: Competitions }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>(
    [],
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [openOrganizations, setOpenOrganizations] = useState(false);
  const [openCategories, setOpenCategories] = useState(false);
  const [openLocations, setOpenLocations] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">(
    isMobile ? "cards" : "table",
  );
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "upcoming" | "ongoing" | "completed"
  >("all");
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  // Get unique organizations, categories, and locations
  const organizations = Array.from(
    new Set(competitions.map((comp) => comp.OrganizationName)),
  ).sort();
  const categories = Array.from(
    new Set(competitions.map((comp) => getVenueType(comp.Stadion.Type))),
  ).sort();
  const locations = Array.from(
    new Set(
      competitions.map((comp) => comp.Stadion.Name).filter(Boolean) as string[],
    ),
  ).sort();

  // Toggle favorite status for a competition
  // const toggleFavorite = (id: number) => {
  //   setCompetitions(
  //     competitions.map((comp) =>
  //       comp.Id === id ? { ...comp, isFavorite: !comp.isFavorite } : comp,
  //     ),
  //   );
  // };

  // Map LiveStatus to our status types
  const mapLiveStatus = (
    status: string,
  ): "upcoming" | "ongoing" | "completed" => {
    // const now = new Date();
    // const compDate = new Date();

    // For demo purposes, we'll consider competitions before today as completed,
    // today as ongoing, and after today as upcoming
    if (status === "ActiveListed") {
      return "upcoming";
    } else if (status === "ActiveOngoing") {
      return "ongoing";
    } else {
      return "completed";
    }
  };

  // Filter competitions based on all criteria
  const filteredCompetitions = competitions
    .filter((comp) => {
      // Search term filter
      const matchesSearch =
        comp.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.OrganizationName.toLowerCase().includes(
          searchTerm.toLowerCase(),
        ) ||
        comp.Stadion.Name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Date range filter
      let matchesDate = true;
      if (dateRange.from && dateRange.to) {
        const compDate = parseISO(comp.Date);
        matchesDate = isWithinInterval(compDate, {
          start: dateRange.from,
          end: dateRange.to,
        });
      }

      // Organization filter
      const matchesOrganization =
        selectedOrganizations.length === 0 ||
        selectedOrganizations.includes(comp.OrganizationName);

      // Category filter
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(getVenueType(comp.Stadion.Type));

      // Location filter
      const matchesLocation =
        selectedLocations.length === 0 ||
        (comp.Stadion.Name && selectedLocations.includes(comp.Stadion.Name));

      // Favorites filter
      // const matchesFavorites = !showFavoritesOnly || comp.isFavorite === true;

      // Status filter
      const mappedStatus = mapLiveStatus(comp.LiveStatus);
      const matchesStatus =
        statusFilter === "all" || mappedStatus === statusFilter;

      return (
        matchesSearch &&
        matchesDate &&
        matchesOrganization &&
        matchesCategory &&
        matchesLocation &&
        // matchesFavorites &&
        matchesStatus
      );
    })
    .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime()); // Sort by date, newest first

  // Quick action handlers
  const handleTodayEvents = () => {
    const today = new Date();
    setDateRange({
      from: today,
      to: today,
    });
  };

  const handleThisWeekend = () => {
    const today = new Date();
    const friday = new Date(today);
    const sunday = new Date(today);

    // Set to next Friday if today is after Friday
    const dayOfWeek = today.getDay();
    const daysUntilFriday =
      dayOfWeek <= 5 ? 5 - dayOfWeek : 5 + (7 - dayOfWeek);
    friday.setDate(today.getDate() + daysUntilFriday);

    // Sunday is 2 days after Friday
    sunday.setDate(friday.getDate() + 2);

    setDateRange({
      from: friday,
      to: sunday,
    });
  };

  const handleNextWeek = () => {
    const today = new Date();
    const nextMonday = new Date(today);
    const nextSunday = new Date(today);

    // Set to next Monday
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    nextMonday.setDate(today.getDate() + daysUntilNextMonday);

    // Next Sunday is 6 days after next Monday
    nextSunday.setDate(nextMonday.getDate() + 6);

    setDateRange({
      from: nextMonday,
      to: nextSunday,
    });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setDateRange({ from: undefined, to: undefined });
    setSelectedOrganizations([]);
    setSelectedCategories([]);
    setSelectedLocations([]);
    setShowFavoritesOnly(false);
    setStatusFilter("all");
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Date",
      "Organization",
      "Name",
      "Venue",
      "Location",
      "Status",
      "Favorite",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredCompetitions.map((comp) =>
        [
          format(new Date(comp.Date), "d.M.yyyy", { locale: fi }),
          `"${comp.OrganizationName}"`,
          `"${comp.Name}"`,
          getVenueType(comp.Stadion.Type),
          `"${comp.Stadion.Name}"`,
          mapLiveStatus(comp.LiveStatus),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "tuloslista_competitions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm ??
    dateRange.from ??
    dateRange.to ??
    selectedOrganizations.length > 0 ??
    selectedCategories.length > 0 ??
    selectedLocations.length > 0 ??
    showFavoritesOnly ??
    statusFilter !== "all";

  return (
    <>
      {/* Filters */}
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
          <CardTitle className="text-base font-medium">
            Haku ja suodatus
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          >
            {isFilterExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isFilterExpanded ? "Collapse" : "Expand"}
            </span>
          </Button>
        </CardHeader>

        {isFilterExpanded && (
          <CardContent className="space-y-3 p-4 pt-0">
            {/* Main filters row */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-5">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Hae kilpailua, seuraa tai paikkakuntaa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9 pl-8"
                />
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9 justify-start text-left font-normal",
                      !dateRange.from &&
                        !dateRange.to &&
                        "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <span className="truncate">
                          {format(dateRange.from, "d.M.yyyy", { locale: fi })} -{" "}
                          {format(dateRange.to, "d.M.yyyy", { locale: fi })}
                        </span>
                      ) : (
                        format(dateRange.from, "d.M.yyyy", { locale: fi })
                      )
                    ) : (
                      "Valitse päivämäärä"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    // @ts-expect-error TODO: Fix this
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              <Popover open={openCategories} onOpenChange={setOpenCategories}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    role="combobox"
                    aria-expanded={openCategories}
                    className="h-9 justify-start text-left font-normal"
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    {selectedCategories.length === 0 ? (
                      <span className="truncate">Kategoria</span>
                    ) : (
                      <span className="truncate">
                        {selectedCategories.length} kat.
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Etsi kategoriaa..." />
                    <CommandList>
                      <CommandEmpty>Ei löytynyt kategorioita.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {categories.map((category) => (
                          <CommandItem
                            key={category}
                            onSelect={() => {
                              setSelectedCategories((prev) =>
                                prev.includes(category)
                                  ? prev.filter((item) => item !== category)
                                  : [...prev, category],
                              );
                            }}
                          >
                            <div
                              className={cn(
                                "border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                                selectedCategories.includes(category)
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50 [&_svg]:invisible",
                              )}
                            >
                              <Check className={cn("h-4 w-4")} />
                            </div>
                            {category}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <Popover
                open={openOrganizations}
                onOpenChange={setOpenOrganizations}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    role="combobox"
                    aria-expanded={openOrganizations}
                    className="h-9 justify-start text-left font-normal"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    {selectedOrganizations.length === 0 ? (
                      <span className="truncate">Seura</span>
                    ) : (
                      <span className="truncate">
                        {selectedOrganizations.length} seuraa
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Etsi seuraa..." />
                    <CommandList>
                      <CommandEmpty>Ei löytynyt seuroja.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {organizations.map((org) => (
                          <CommandItem
                            key={org}
                            onSelect={() => {
                              setSelectedOrganizations((prev) =>
                                prev.includes(org)
                                  ? prev.filter((item) => item !== org)
                                  : [...prev, org],
                              );
                            }}
                          >
                            <div
                              className={cn(
                                "border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                                selectedOrganizations.includes(org)
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50 [&_svg]:invisible",
                              )}
                            >
                              <Check className={cn("h-4 w-4")} />
                            </div>
                            {org}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <Popover open={openLocations} onOpenChange={setOpenLocations}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    role="combobox"
                    aria-expanded={openLocations}
                    className="h-9 justify-start text-left font-normal"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    {selectedLocations.length === 0 ? (
                      <span className="truncate">Sijainti</span>
                    ) : (
                      <span className="truncate">
                        {selectedLocations.length} sij.
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Etsi sijaintia..." />
                    <CommandList>
                      <CommandEmpty>Ei löytynyt sijainteja.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {locations.map((location) => (
                          <CommandItem
                            key={location}
                            onSelect={() => {
                              setSelectedLocations((prev) =>
                                prev.includes(location)
                                  ? prev.filter((item) => item !== location)
                                  : [...prev, location],
                              );
                            }}
                          >
                            <div
                              className={cn(
                                "border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                                selectedLocations.includes(location)
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50 [&_svg]:invisible",
                              )}
                            >
                              <Check className={cn("h-4 w-4")} />
                            </div>
                            {location}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Selected Filter Tags */}
            {hasActiveFilters && (
              <div className="-mx-1 flex flex-nowrap gap-1.5 overflow-x-auto px-1 pb-1">
                {/* Date Range Tag */}
                {(dateRange.from ?? dateRange.to) && (
                  <Badge
                    variant="secondary"
                    className="h-6 cursor-pointer px-2 text-xs whitespace-nowrap"
                    onClick={() =>
                      setDateRange({ from: undefined, to: undefined })
                    }
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "d.M.yyyy", { locale: fi })} -{" "}
                          {format(dateRange.to, "d.M.yyyy", { locale: fi })}
                        </>
                      ) : (
                        format(dateRange.from, "d.M.yyyy", { locale: fi })
                      )
                    ) : (
                      format(dateRange.to!, "d.M.yyyy", { locale: fi })
                    )}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                )}

                {/* Category Tags */}
                {selectedCategories.map((category) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="h-6 cursor-pointer px-2 text-xs whitespace-nowrap"
                    onClick={() => {
                      setSelectedCategories((prev) =>
                        prev.filter((item) => item !== category),
                      );
                    }}
                  >
                    <Tag className="mr-1 h-3 w-3" />
                    {category}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}

                {/* Organization Tags */}
                {selectedOrganizations.map((org) => (
                  <Badge
                    key={org}
                    variant="secondary"
                    className="h-6 cursor-pointer px-2 text-xs whitespace-nowrap"
                    onClick={() => {
                      setSelectedOrganizations((prev) =>
                        prev.filter((item) => item !== org),
                      );
                    }}
                  >
                    <Filter className="mr-1 h-3 w-3" />
                    {org}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}

                {/* Location Tags */}
                {selectedLocations.map((location) => (
                  <Badge
                    key={location}
                    variant="secondary"
                    className="h-6 cursor-pointer px-2 text-xs whitespace-nowrap"
                    onClick={() => {
                      setSelectedLocations((prev) =>
                        prev.filter((item) => item !== location),
                      );
                    }}
                  >
                    <MapPin className="mr-1 h-3 w-3" />
                    {location}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}

                {/* Favorites Tag */}
                {showFavoritesOnly && (
                  <Badge
                    variant="secondary"
                    className="h-6 cursor-pointer px-2 text-xs whitespace-nowrap"
                    onClick={() => setShowFavoritesOnly(false)}
                  >
                    <Star className="mr-1 h-3 w-3" />
                    Vain suosikit
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                )}

                {/* Status Tag */}
                {statusFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="h-6 cursor-pointer px-2 text-xs whitespace-nowrap"
                    onClick={() => setStatusFilter("all")}
                  >
                    <Clock className="mr-1 h-3 w-3" />
                    {statusFilter === "upcoming"
                      ? "Tulevat"
                      : statusFilter === "ongoing"
                        ? "Käynnissä"
                        : "Päättyneet"}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                )}

                {/* Clear All Button */}
                <Badge
                  variant="outline"
                  className="bg-muted/50 h-6 cursor-pointer px-2 text-xs whitespace-nowrap"
                  onClick={clearAllFilters}
                >
                  <X className="mr-1 h-3 w-3" />
                  Tyhjennä kaikki
                </Badge>
              </div>
            )}

            {/* Quick filters and actions */}
            <div className="flex flex-wrap items-center justify-between gap-y-2">
              <div className="flex flex-wrap gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTodayEvents}
                  className="h-7 border-blue-200 bg-blue-50 px-2 text-xs text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/50"
                >
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  Tänään
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleThisWeekend}
                  className="h-7 border-green-200 bg-green-50 px-2 text-xs text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-800/50"
                >
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  Viikonloppu
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextWeek}
                  className="h-7 border-purple-200 bg-purple-50 px-2 text-xs text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-800/50"
                >
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  Ensi viikko
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={cn(
                    "h-7 border-amber-200 px-2 text-xs hover:bg-amber-100 dark:border-amber-800 dark:hover:bg-amber-800/50",
                    showFavoritesOnly
                      ? "bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
                  )}
                >
                  <Star className="mr-1 h-3 w-3" />
                  Suosikit
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 border-gray-200 bg-gray-50 px-2 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/30 dark:text-gray-300 dark:hover:bg-gray-700/50"
                    >
                      <Clock className="mr-1 h-3 w-3" />
                      Tila
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[120px]">
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          statusFilter === "all" ? "opacity-100" : "opacity-0",
                        )}
                      />
                      Kaikki
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("upcoming")}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          statusFilter === "upcoming"
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      Tulevat
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("ongoing")}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          statusFilter === "ongoing"
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      Käynnissä
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("completed")}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          statusFilter === "completed"
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      Päättyneet
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex gap-1.5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setViewMode(viewMode === "table" ? "cards" : "table")
                        }
                        className="h-7 w-7 p-0"
                      >
                        {viewMode === "table" ? (
                          <LayoutGrid className="h-3.5 w-3.5" />
                        ) : (
                          <LayoutList className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {viewMode === "table" ? "Korttinäkymä" : "Taulukkonäkymä"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DropdownMenu>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Vie</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={exportToCSV}>
                      <Download className="mr-2 h-4 w-4" />
                      Lataa CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="mr-2 h-4 w-4" />
                      Jaa linkki
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Results */}
      {filteredCompetitions.length > 0 ? (
        viewMode === "table" ? (
          // Table View
          <Card className="overflow-hidden border-0 shadow-md">
            <CardContent className="">
              <Table>
                <TableCaption>viimeisimmät kilpailut</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Päivämäärä</TableHead>
                    <TableHead>Kilpailun nimi</TableHead>
                    <TableHead>Kategoria</TableHead>
                    <TableHead>Sijainti</TableHead>
                    <TableHead>Tila</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompetitions.map((comp) => (
                    <TableRow
                      key={comp.Id}
                      // className="border-b transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <TableCell>
                        {format(new Date(comp.Date), "d.M.yyyy", {
                          locale: fi,
                        })}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/events/${comp.Id}`}
                          className="text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                        >
                          {comp.Name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="">
                          {getVenueType(comp.Stadion.Type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{comp.Stadion.Name ?? "-"}</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "transition-colors",
                            getStatusBadgeColor(comp.Date),
                          )}
                        >
                          {getStatusLabel(comp.Date)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          // Card View
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCompetitions.map((comp) => (
              <Card
                key={comp.Id}
                className="overflow-hidden transition-shadow hover:shadow-lg"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <Badge className={cn(getStatusBadgeColor(comp.Date))}>
                      {getStatusLabel(comp.Date)}
                    </Badge>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="-mt-1 -mr-2 h-8 w-8 rounded-full"
                      // onClick={() => toggleFavorite(comp.Id)}
                    >
                      <Star
                        className={cn(
                          "h-5 w-5 transition-all",
                          // comp.isFavorite
                          //   ? "fill-amber-500 text-amber-500"
                          //   : "text-muted-foreground",
                        )}
                      />
                      {/* <span className="sr-only">
                              {comp.isFavorite
                                ? "Poista suosikeista"
                                : "Lisää suosikkeihin"}
                            </span> */}
                    </Button>
                  </div>
                  <CardTitle className="mt-2 text-lg">
                    <Link
                      href={`/events/${comp.Id}`}
                      className="text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                      {comp.Name}
                    </Link>
                  </CardTitle>
                  <CardDescription>{comp.OrganizationName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="text-muted-foreground mr-2 h-4 w-4" />
                      <span>
                        {format(new Date(comp.Date), "d.M.yyyy", {
                          locale: fi,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="text-muted-foreground mr-2 h-4 w-4" />
                      <span>{comp.Stadion.Name ?? "Ei sijaintia"}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Tag className="text-muted-foreground mr-2 h-4 w-4" />
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        {getVenueType(comp.Stadion.Type)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/events/${comp.Id}`}>Näytä tulokset</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )
      ) : (
        // Empty state
        <Card className="bg-muted/20 border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="bg-muted mb-4 rounded-full p-3">
              <Search className="text-muted-foreground h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-medium">Ei löytynyt kilpailuja</h3>
            <p className="text-muted-foreground mb-6 max-w-md text-center">
              Ei löytynyt kilpailuja annetuilla hakuehdoilla. Kokeile muuttaa
              hakuehtoja tai tyhjennä suodattimet.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" onClick={clearAllFilters}>
                Tyhjennä kaikki suodattimet
              </Button>
              <Button variant="outline" onClick={() => setStatusFilter("all")}>
                Näytä kaikki tilat
              </Button>
              <Button
                variant="outline"
                onClick={() => setDateRange({ from: undefined, to: undefined })}
              >
                Poista päivämäärärajaus
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
