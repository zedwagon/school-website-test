"use client";

import { updateStudentEscNumber } from "@school/api/students/action";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@school/ui";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface EditEscDialogProps {
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  open: boolean;
  student: { id: number; name: string; escNumber: string | null } | null;
}

export function EditEscDialog({
  open,
  onOpenChange,
  student,
  onSuccess,
}: EditEscDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [escNumber, setEscNumber] = useState(student?.escNumber || "");

  const handleSubmit = async () => {
    if (!student) return;

    startTransition(async () => {
      const res = await updateStudentEscNumber(student.id, escNumber || null);
      if (res.success) {
        toast.success("ESC number updated successfully");
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(res.error || "Failed to update ESC number");
      }
    });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit ESC Number</DialogTitle>
          <DialogDescription>
            Update the ESC number for {student?.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="escNumber">ESC Number</Label>
            <Input
              id="escNumber"
              onChange={(e) => setEscNumber(e.target.value)}
              placeholder="Enter ESC ID number"
              value={escNumber}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={isPending} onClick={handleSubmit}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
