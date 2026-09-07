"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Label, toast } from "@school/ui";
import { importStaffToEmployees } from "@school/api/accounting/payroll/action";
import { useRouter } from "next/navigation";

export function ImportStaffDialog({ open, onOpenChange, availableStaff }: { open: boolean, onOpenChange: (open: boolean) => void, availableStaff: any[] }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const staffId = formData.get("staffId") as string;
    
    if (!staffId) return;

    startTransition(async () => {
      try {
        await importStaffToEmployees(parseInt(staffId, 10));
        toast.success("Staff member imported successfully");
        router.refresh();
        onOpenChange(false);
      } catch (error: any) {
        toast.error(error.message || "Failed to import staff");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Staff Member</DialogTitle>
          <DialogDescription>
            Import a system user (like a teacher or admin) into Accounting to manage their payroll.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="staffId">Select Staff Member</Label>
            <select 
              name="staffId" 
              id="staffId"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
              defaultValue=""
            >
              <option value="" disabled>Select a staff member...</option>
              {availableStaff.map(staff => (
                <option key={staff.id} value={staff.id}>
                  {staff.lastName}, {staff.firstName} {staff.middleName || ""} - {staff.department}
                </option>
              ))}
            </select>
            {availableStaff.length === 0 && (
              <p className="text-sm text-red-500">All available staff members have already been imported.</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending || availableStaff.length === 0}>
              {isPending ? "Importing..." : "Import"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
