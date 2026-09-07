"use client";

import { useState } from "react";
import { Button } from "@school/ui";
import { Download, Plus } from "lucide-react";
import { AddEmployeeDialog } from "./add-employee-dialog";

export function ContractsHeaderActions() {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={() => setIsAddOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm px-5">
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <AddEmployeeDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
    </>
  );
}
