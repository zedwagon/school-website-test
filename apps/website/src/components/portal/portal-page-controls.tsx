"use client";

import { Button, Input } from "@school/ui";
import { type LucideIcon, Plus, Search, X } from "lucide-react";
import type { ReactNode } from "react";
import { SchoolYearSwitcher } from "@/components/school-year-switcher";

interface PortalPageControlsProps {
  children?: ReactNode; // For additional custom filters/buttons
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  schoolYear?: {
    data: { id: number; name: string; isActive: boolean }[];
    selectedId?: number;
  };
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  status?: {
    value: "active" | "archived";
    onChange: (value: "active" | "archived") => void;
    activeCount?: number;
    archivedCount?: number;
  };
}

export function PortalPageControls({
  search,
  status,
  schoolYear,
  primaryAction,
  children,
}: PortalPageControlsProps) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row">
        {search && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              className="border-gray-300 pr-10 pl-10"
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder || "Search..."}
              value={search.value}
            />
            {search.value && (
              <button
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => search.onChange("")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {status && (
          <div className="flex shrink-0 rounded-lg border border-gray-200/50 bg-gray-100/80 p-1 shadow-inner">
            <button
              className={`flex items-center gap-2 rounded-md px-4 py-1.5 font-medium text-sm transition-all ${
                status.value === "active"
                  ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                  : "text-gray-500 hover:bg-white/50 hover:text-gray-700"
              }`}
              onClick={() => status.onChange("active")}
            >
              Active
              {status.activeCount !== undefined && (
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.5 font-semibold text-[10px] tabular-nums ${
                    status.value === "active"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {status.activeCount}
                </span>
              )}
            </button>
            <button
              className={`flex items-center gap-2 rounded-md px-4 py-1.5 font-medium text-sm transition-all ${
                status.value === "archived"
                  ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                  : "text-gray-500 hover:bg-white/50 hover:text-gray-700"
              }`}
              onClick={() => status.onChange("archived")}
            >
              Archived
              {status.archivedCount !== undefined && (
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.5 font-semibold text-[10px] tabular-nums ${
                    status.value === "archived"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {status.archivedCount}
                </span>
              )}
            </button>
          </div>
        )}

        {children}
      </div>

      <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">
        {schoolYear && (
          <SchoolYearSwitcher
            schoolYears={schoolYear.data}
            selectedSyId={schoolYear.selectedId}
          />
        )}

        {primaryAction && (
          <Button
            className="shrink-0 bg-indigo-600 hover:bg-indigo-700"
            onClick={primaryAction.onClick}
          >
            {primaryAction.icon ? (
              <primaryAction.icon className="mr-2 h-4 w-4" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {primaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
