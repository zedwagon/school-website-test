"use client";

import { updateEnrollmentStatus } from "@school/api/enrollment/action";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@school/ui";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface StudentStatusDialogProps {
  currentStatus?: "enrolled" | "dropped" | "transferred";
  enrollmentId: number | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  open: boolean;
  studentName: string;
}

const PREDEFINED_REASONS = [
  "Financial difficulties",
  "Family relocation",
  "Transfer to another school",
  "Health reasons",
  "Personal reasons",
  "Academic difficulties",
];

export function StudentStatusDialog({
  open,
  onOpenChange,
  onSuccess,
  enrollmentId,
  studentName,
}: StudentStatusDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"dropped" | "transferred">("dropped");
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const handleSubmit = () => {
    if (!enrollmentId) {
      return;
    }

    const finalReason = reason === "custom" ? customReason : reason;
    if (!finalReason) {
      toast.error("Please provide a reason");
      return;
    }

    startTransition(async () => {
      const res = await updateEnrollmentStatus(
        enrollmentId,
        status,
        finalReason,
      );
      if ("error" in res && res.error) {
        toast.error(res.error);
      } else {
        toast.success("Student progress updated successfully");
        onOpenChange(false);
        onSuccess?.();
      }
    });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Enrollment Status</DialogTitle>
          <DialogDescription>
            Record why {studentName} is being marked as dropped or transferred.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>New Status</Label>
            <Select
              onValueChange={(v: "dropped" | "transferred") => setStatus(v)}
              value={status}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dropped">Dropped</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Reason</Label>
            <Select onValueChange={setReason} value={reason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {PREDEFINED_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom Reason...</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reason === "custom" && (
            <div className="space-y-2">
              <Label>Custom Reason</Label>
              <Textarea
                className="resize-none"
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Type the specific reason here..."
                value={customReason}
              />
            </div>
          )}

          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p>
              Marking a student as <strong>{status}</strong> will remove them
              from the active list for the current school year.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700"
            disabled={isPending}
            onClick={handleSubmit}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
