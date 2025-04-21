import { cn } from "~/@/lib/utils";
import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  actionsClassName?: string;
}

export function SectionHeader({
  title,
  subtitle,
  icon,
  actions,
  size = "md",
  className,
  titleClassName,
  subtitleClassName,
  actionsClassName,
}: SectionHeaderProps) {
  // Determine icon size based on the size prop
  const iconSize =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  // Determine icon container padding based on size
  const iconPadding = size === "sm" ? "p-1" : size === "lg" ? "p-2.5" : "p-2";

  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        size === "sm" ? "mb-3" : size === "lg" ? "mb-6" : "mb-4",
        className,
      )}
    >
      <div className="flex items-center">
        {icon && (
          <div
            className={cn(
              "mr-2 rounded-full bg-blue-100 dark:bg-blue-900/30",
              iconPadding,
            )}
          >
            {/* Render the icon without cloneElement */}
            <div className={cn("text-blue-600 dark:text-blue-400", iconSize)}>
              {icon}
            </div>
          </div>
        )}
        <div>
          <h2
            className={cn(
              "font-semibold",
              size === "sm"
                ? "text-lg"
                : size === "lg"
                  ? "text-2xl"
                  : "text-xl",
              titleClassName,
            )}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={cn(
                "text-muted-foreground",
                size === "sm"
                  ? "text-xs"
                  : size === "lg"
                    ? "text-base"
                    : "text-sm",
                subtitleClassName,
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className={cn("flex items-center gap-2", actionsClassName)}>
          {actions}
        </div>
      )}
    </div>
  );
}
