"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Input, Label, toast } from "@school/ui";
import { createPayrollPeriod } from "@school/api/accounting/payroll/action";
import { useRouter } from "next/navigation";

export function NewPeriodDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate) {
      toast.error("Please fill in all fields");
      return;
    }

    // Auto-generate name for proper sorting and display
    const name = `${formData.startDate} to ${formData.endDate}`;

    startTransition(async () => {
      try {
        const newPeriod = await createPayrollPeriod({ ...formData, name });
        toast.success("Payroll period created");
        const params = new URLSearchParams(window.location.search);
        params.set("periodId", newPeriod.id.toString());
        router.push(`?${params.toString()}`);
        onOpenChange(false);
      } catch (error: any) {
        toast.error(error.message || "Failed to create period");
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Payroll Period</DialogTitle>
          <DialogDescription>
            Create a new payroll cut-off period to generate payrolls for.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} max="2099-12-31" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} max="2099-12-31" required />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Creating..." : "Create Period"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
