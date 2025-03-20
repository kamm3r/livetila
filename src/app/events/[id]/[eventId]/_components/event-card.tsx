import type React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/@/components/ui/card";
import {
  StatusIndicator,
  type StatusType,
} from "~/@/components/ui/status-indicator";
import { cn } from "~/@/lib/utils";
import { Clock } from "lucide-react";

export interface EventCardProps {
  title: string;
  subtitle?: string;
  status?: StatusType;
  time?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "default" | "compact" | "detailed";
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}

export function EventCard({
  title,
  subtitle,
  status,
  time,
  headerActions,
  children,
  footer,
  variant = "default",
  className,
  headerClassName,
  contentClassName,
  footerClassName,
}: EventCardProps) {
  const isCompact = variant === "compact";

  return (
    <Card className={cn("w-full", className, "overflow-hidden")}>
      {/* <CardHeader
        className={cn(
          isCompact ? "px-4 py-3" : "px-6 py-4",
          "bg-muted/20",
          headerClassName,
        )}
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className={cn(isCompact ? "text-lg" : "text-xl")}>
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {time && (
              <div className="text-muted-foreground flex items-center text-sm">
                <Clock className="mr-1.5 h-4 w-4" />
                {time}
              </div>
            )}
            {status && <StatusIndicator status={status} />}
            {headerActions}
          </div>
        </div>
      </CardHeader> */}

      <CardContent>{children}</CardContent>

      {footer && (
        <CardFooter
          className={cn(isCompact ? "p-3" : "p-6", "pt-0", footerClassName)}
        >
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
