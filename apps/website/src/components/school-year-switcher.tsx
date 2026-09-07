"use client";

import {
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@school/ui";
import { Calendar } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface SchoolYear {
  id: number;
  isActive: boolean;
  name: string;
}

interface SchoolYearSwitcherProps {
  schoolYears: SchoolYear[];
  selectedSyId?: number;
}

export function SchoolYearSwitcher({
  schoolYears,
  selectedSyId,
}: SchoolYearSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selected =
    schoolYears.find((sy) => sy.id === selectedSyId) ??
    schoolYears.find((sy) => sy.isActive) ??
    schoolYears[0];

  const handleSelect = useCallback(
    (syIdStr: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sy", syIdStr);
      params.delete("page"); // Reset pagination when switching SY
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  if (!schoolYears.length) {
    return null;
  }

  return (
    <Select onValueChange={handleSelect} value={selected?.id?.toString()}>
      <SelectTrigger className="h-9 w-fit min-w-[160px] gap-2 bg-white">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0 text-gray-500" />
          <SelectValue placeholder="Select Year">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {selected?.name || "Select Year"}
              </span>
              {selected?.isActive && (
                <Badge className="h-4 border-green-200 bg-green-100 px-1.5 py-0 text-[10px] text-green-700 hover:bg-green-100">
                  Active
                </Badge>
              )}
            </div>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent align="end">
        {schoolYears.map((sy) => (
          <SelectItem
            className="cursor-pointer"
            key={sy.id}
            value={sy.id.toString()}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span>{sy.name}</span>
              {sy.isActive && (
                <Badge className="ml-2 h-4 border-green-200 bg-green-100 px-1.5 py-0 text-[10px] text-green-700 hover:bg-green-100">
                  Active
                </Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
