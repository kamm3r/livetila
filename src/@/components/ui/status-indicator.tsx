import { Badge } from "~/@/components/ui/badge";
import { cn } from "~/@/lib/utils";

// Update the StatusType to include Finnish status labels
export type StatusType =
  | "upcoming"
  | "live"
  | "completed"
  | "cancelled"
  | "postponed"
  | "unofficial"
  | "official"
  | "pending"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "tuleva"
  | "käynnissä"
  | "päättynyt"
  | "eräjaot puuttuvat"
  | "eräjaot tehty"
  | "tuntematon";

interface StatusIndicatorProps {
  status: StatusType;
  variant?: "badge" | "dot" | "text";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusIndicator({
  status,
  variant = "badge",
  size = "md",
  className,
}: StatusIndicatorProps) {
  // Update the statusConfig to include mappings for Finnish status labels
  const statusConfig = {
    upcoming: {
      color: "bg-blue-500 hover:bg-blue-600 text-white",
      label: "Upcoming",
    },
    live: {
      color: "bg-green-500 hover:bg-green-600 text-white",
      label: "Live",
    },
    completed: {
      color: "bg-green-600 hover:bg-green-700 text-white",
      label: "Completed",
    },
    cancelled: {
      color: "bg-red-500 hover:bg-red-600 text-white",
      label: "Cancelled",
    },
    postponed: {
      color: "bg-amber-500 hover:bg-amber-600 text-white",
      label: "Postponed",
    },
    unofficial: {
      color: "bg-amber-500 hover:bg-amber-600 text-white",
      label: "Unofficial",
    },
    official: {
      color: "bg-green-600 hover:bg-green-700 text-white",
      label: "Official",
    },
    pending: {
      color: "bg-blue-500 hover:bg-blue-600 text-white",
      label: "Pending",
    },
    success: {
      color: "bg-green-500 hover:bg-green-600 text-white",
      label: "Success",
    },
    error: { color: "bg-red-500 hover:bg-red-600 text-white", label: "Error" },
    warning: {
      color: "bg-amber-500 hover:bg-amber-600 text-white",
      label: "Warning",
    },
    info: { color: "bg-blue-500 hover:bg-blue-600 text-white", label: "Info" },
    // Add Finnish status mappings
    tuleva: {
      color: "bg-blue-500 hover:bg-blue-600 text-white",
      label: "Tuleva",
    },
    käynnissä: {
      color: "bg-amber-500 hover:bg-amber-600 text-white animate-pulse",
      label: "Käynnissä",
    },
    päättynyt: {
      color: "bg-green-600 hover:bg-green-700 text-white",
      label: "Päättynyt",
    },
    // Add new round status mappings
    Unallocated: {
      color: "bg-red-500 hover:bg-red-600 text-white",
      label: "Eräjaot puuttuvat",
    },
    Allocated: {
      color: "bg-blue-500 hover:bg-blue-600 text-white",
      label: "Eräjaot tehty",
    },
    Progress: {
      color: "bg-amber-500 hover:bg-amber-600 text-green-700 animate-pulse",
      label: "Käynnissä",
    },
    Official: {
      color: "bg-green-600 hover:bg-green-700 text-white",
      label: "päättynyt",
    },
    tuntematon: {
      color: "bg-gray-500 hover:bg-gray-600 text-white",
      label: "Tuntematon",
    },
  };

  // Get the config for the current status, or use a default if not found
  const config = statusConfig[status] || {
    color: "bg-gray-500 hover:bg-gray-600 text-white",
    label: status as string,
  };

  if (variant === "dot") {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            config.color.split(" ")[0], // Only use the background color
            size === "sm"
              ? "h-1.5 w-1.5"
              : size === "lg"
                ? "h-2.5 w-2.5"
                : "h-2 w-2",
          )}
        />
        <span className="text-muted-foreground text-sm">{config.label}</span>
      </div>
    );
  }

  if (variant === "text") {
    return (
      <span
        className={cn(
          "text-sm font-medium",
          status === "completed" ||
            status === "official" ||
            status === "success" ||
            status === "päättynyt"
            ? "text-green-600 dark:text-green-400"
            : status === "cancelled" ||
                status === "error" ||
                status === "eräjaot puuttuvat"
              ? "text-red-600 dark:text-red-400"
              : status === "postponed" ||
                  status === "unofficial" ||
                  status === "warning" ||
                  status === "käynnissä"
                ? "text-amber-600 dark:text-amber-400"
                : "text-blue-600 dark:text-blue-400",
          className,
        )}
      >
        {config.label}
      </span>
    );
  }

  // Default badge variant
  return <Badge className={cn(config.color, className)}>{config.label}</Badge>;
}
