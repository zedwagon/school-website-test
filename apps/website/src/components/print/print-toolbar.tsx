"use client";

import React from "react";

/**
 * A toolbar rendered above the print preview, hidden during printing.
 * Provides "Close Tab" and "Print" buttons.
 */
export function PrintToolbar() {
  return (
    <div className="no-print fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
      <p className="text-sm font-medium text-gray-600">Print Preview</p>
      <div className="flex items-center gap-3">
        <button
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          onClick={() => window.close()}
          type="button"
        >
          ✕ Close Tab
        </button>
        <button
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          onClick={() => window.print()}
          type="button"
        >
          🖨 Print
        </button>
      </div>
    </div>
  );
}
