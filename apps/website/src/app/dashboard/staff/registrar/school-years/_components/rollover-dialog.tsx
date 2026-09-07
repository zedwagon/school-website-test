"use client";

import { rolloverSchoolYear } from "@school/api/school-years/action";
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
  Switch,
} from "@school/ui";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface SchoolYear {
  id: number;
  name: string;
}

interface RolloverDialogProps {
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  open: boolean;
  schoolYears: SchoolYear[];
  targetSyId: number | null;
}

export default function RolloverDialog({
  open,
  onOpenChange,
  targetSyId,
  schoolYears,
  onSuccess,
}: RolloverDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [sourceSyId, setSourceSyId] = useState<string>("");

  // Options
  const [copySections, setCopySections] = useState(true);
  const [copySubjects, setCopySubjects] = useState(true);
  const [copyTeachers, setCopyTeachers] = useState(true);
  const [copySchedules, setCopySchedules] = useState(false);

  // Filter out the target SY from the source list
  const sourceOptions = schoolYears.filter((sy) => sy.id !== targetSyId);

  const handleRollover = () => {
    if (!sourceSyId) {
      toast.error("Please select a source school year");
      return;
    }
    startTransition(async () => {
      if (!(targetSyId && sourceSyId)) {
        return;
      }

      const res = await rolloverSchoolYear({
        sourceSyId: Number.parseInt(sourceSyId, 10),
        targetSyId,
        copySections,
        copySubjects,
        copyTeachers,
        copySchedules,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(
          `Rollover successful! ${res?.sectionsCount ?? 0} sections created.`,
        );
        onSuccess?.();
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Data (Rollover)</DialogTitle>
          <DialogDescription>
            Copy sections and settings from a previous school year to this one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Source School Year (Copy From)</Label>
            <Select onValueChange={setSourceSyId} value={sourceSyId}>
              <SelectTrigger>
                <SelectValue placeholder="Select previous school year" />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map((sy) => (
                  <SelectItem key={sy.id} value={sy.id.toString()}>
                    {sy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 rounded-md border p-4">
            <h4 className="font-medium text-gray-900 text-sm">What to copy?</h4>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Sections</Label>
                <p className="text-gray-500 text-xs">
                  Create new sections with same names
                </p>
              </div>
              <Switch
                checked={copySections}
                onCheckedChange={setCopySections}
              />
            </div>

            {copySections && (
              <>
                <div className="flex items-center justify-between border-gray-100 border-l-2 pl-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Subject Assignments</Label>
                    <p className="text-gray-500 text-xs">
                      Copy subjects to sections
                    </p>
                  </div>
                  <Switch
                    checked={copySubjects}
                    onCheckedChange={setCopySubjects}
                  />
                </div>

                {copySubjects && (
                  <>
                    <div className="flex items-center justify-between border-gray-100 border-l-2 pl-4">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Teachers</Label>
                        <p className="text-gray-500 text-xs">
                          Keep same teachers assigned
                        </p>
                      </div>
                      <Switch
                        checked={copyTeachers}
                        onCheckedChange={setCopyTeachers}
                      />
                    </div>

                    <div className="flex items-center justify-between border-gray-100 border-l-2 pl-4">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Schedules</Label>
                        <p className="text-gray-500 text-xs">
                          Keep same days and times
                        </p>
                      </div>
                      <Switch
                        checked={copySchedules}
                        onCheckedChange={setCopySchedules}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button disabled={!sourceSyId || isPending} onClick={handleRollover}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRightLeft className="mr-2 h-4 w-4" />
            )}
            Start Rollover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
