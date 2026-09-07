"use client";

import { Button } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        params.delete("page");
      } else {
        params.set("page", page.toString());
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  if (totalPages === 0) {
    return null;
  }

  // Build page numbers to show
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (currentPage > 3) {
      pages.push("...");
    }
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) {
      pages.push("...");
    }
    pages.push(totalPages);
  }

  return (
    <div className="mt-6 flex items-center justify-between px-2">
      <p className="text-gray-500 text-sm">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <Button
          className="h-8 w-8 p-0"
          disabled={currentPage <= 1}
          onClick={() => goToPage(currentPage - 1)}
          size="sm"
          variant="outline"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((page, idx) =>
          page === "..." ? (
            <span className="px-2 text-gray-400 text-sm" key={`dots-${idx}`}>
              …
            </span>
          ) : (
            <Button
              className={`h-8 w-8 p-0 text-sm ${page === currentPage ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
              key={page}
              onClick={() => goToPage(page)}
              size="sm"
              variant={page === currentPage ? "default" : "outline"}
            >
              {page}
            </Button>
          )
        )}

        <Button
          className="h-8 w-8 p-0"
          disabled={currentPage >= totalPages}
          onClick={() => goToPage(currentPage + 1)}
          size="sm"
          variant="outline"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
