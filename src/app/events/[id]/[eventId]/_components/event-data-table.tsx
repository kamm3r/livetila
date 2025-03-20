"use client";

import { cn } from "~/@/lib/utils";
import type React from "react";
import { Card, CardContent } from "~/@/components/ui/card";

interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: ((item: T, index: number) => React.ReactNode) | React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface EventDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor?: (item: T, index: number) => string | number;
  onRowClick?: (item: T, index: number) => void;
  selectedItem?: T;
  isSelectable?: boolean;
  isStriped?: boolean;
  isHoverable?: boolean;
  isCompact?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  rowClassName?: (item: T, index: number, isSelected: boolean) => string;
  wrapWithCard?: boolean;
  cardClassName?: string;
}

export function EventDataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  selectedItem,
  isSelectable = false,
  isStriped = true,
  isHoverable = true,
  isCompact = false,
  emptyState,
  className,
  headerClassName,
  rowClassName,
  wrapWithCard = true,
  cardClassName,
}: EventDataTableProps<T>) {
  // Default keyExtractor function if none is provided
  const getKey =
    keyExtractor ||
    ((item: any, index: number) => {
      // Try to use common ID properties if they exist
      if (item.id) return item.id;
      if (item.ID) return item.ID;
      if (item.Id) return item.Id;
      // Fall back to index if no ID property exists
      return index;
    });

  const table = (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full">
        <thead>
          <tr className={cn("bg-muted/50 dark:bg-muted/20", headerClassName)}>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "text-muted-foreground text-left font-medium",
                  isCompact ? "px-3 py-2" : "px-4 py-3",
                  column.headerClassName,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => {
              const key = getKey(item, index);
              const isSelected = selectedItem === item;

              return (
                <tr
                  key={key}
                  className={cn(
                    "border-b dark:border-gray-800",
                    isHoverable &&
                      "hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors",
                    isStriped && index % 2 === 0
                      ? "bg-white dark:bg-transparent"
                      : "bg-muted/10 dark:bg-muted/5",
                    isSelectable && "cursor-pointer",
                    isSelected && "bg-blue-50 dark:bg-blue-900/20",
                    rowClassName && rowClassName(item, index, isSelected),
                  )}
                  onClick={
                    onRowClick ? () => onRowClick(item, index) : undefined
                  }
                >
                  {columns.map((column) => (
                    <td
                      key={`${key}-${column.key}`}
                      className={cn(
                        isCompact ? "px-3 py-2" : "px-4 py-3",
                        column.className,
                      )}
                    >
                      {typeof column.cell === "function"
                        ? column.cell(item, index)
                        : column.cell}
                    </td>
                  ))}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center">
                {emptyState || (
                  <div className="text-muted-foreground">No data available</div>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  if (wrapWithCard) {
    return (
      <Card
        className={cn(
          "w-full overflow-hidden border-0 shadow-md",
          cardClassName,
        )}
      >
        <CardContent className="p-0">{table}</CardContent>
      </Card>
    );
  }

  return table;
}
