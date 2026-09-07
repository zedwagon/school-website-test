"use client";

import { updateRegistrarNote } from "@school/api/enrollment/action";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Textarea,
} from "@school/ui";
import { Loader2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

interface EditNoteDialogProps {
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  open: boolean;
  student: { id: number; name: string; note: string | null } | null;
}

export function EditNoteDialog({
  open,
  onOpenChange,
  student,
  onSuccess,
}: EditNoteDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState("");

  // Sync state with student prop when dialog opens/changes
  useEffect(() => {
    if (student) {
      setNote(student.note || "");
    }
  }, [student]);

  const handleSubmit = async () => {
    if (!student) return;

    startTransition(async () => {
      const res = await updateRegistrarNote(student.id, note.trim() || null);
      if ("success" in res && res.success) {
        toast.success("Registrar note updated successfully");
        onSuccess();
        onOpenChange(false);
      } else {
        const errorMsg = "error" in res ? res.error : "Failed to update note";
        toast.error(errorMsg);
      }
    });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Registrar Note</DialogTitle>
          <DialogDescription>
            Update the enrollment note for {student?.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="note">Registrar Note</Label>
            <Textarea
              id="note"
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. kulang pa birth cert, for validation, etc."
              rows={3}
              value={note}
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
