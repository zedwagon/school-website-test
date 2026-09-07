"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Input, Label, toast } from "@school/ui";
import { createEmployee } from "@school/api/accounting/payroll/action";
import { useRouter } from "next/navigation";

export function AddEmployeeDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const middleName = formData.get("middleName") as string;
    const type = formData.get("type") as any;
    
    startTransition(async () => {
      try {
        await createEmployee({ firstName, lastName, middleName, type });
        toast.success("Employee added successfully");
        router.refresh();
        onOpenChange(false);
      } catch (error: any) {
        toast.error(error.message || "Failed to add employee");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Create a standalone employee profile for payroll. This will NOT create a system login account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" name="firstName" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" name="lastName" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="middleName">Middle Name (Optional)</Label>
            <Input id="middleName" name="middleName" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Employee Type</Label>
            <select 
              name="type" 
              id="type"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
              defaultValue=""
            >
              <option value="" disabled>Select Employee Type</option>
              <option value="part_time_teaching">Part-Time Teaching</option>
              <option value="non_teaching">Non-Teaching</option>
              <option value="teaching">Teaching</option>
              <option value="administrators">Administrators</option>
            </select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Employee"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
