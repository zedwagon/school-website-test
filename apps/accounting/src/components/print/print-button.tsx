"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2"
    >
      <Printer className="h-4 w-4" />
      Print All
    </button>
  );
}
