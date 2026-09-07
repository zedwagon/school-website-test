"use client";

import { DAY_OF_WEEK_LABELS } from "@school/api/constants";
import { assignSubjectToSection } from "@school/api/sections/action";
import { Badge, Button, Input, Label } from "@school/ui";
import { Loader2, Search, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

interface AddSubjectDialogProps {
  availableSubjects: { id: number; name: string; code: string | null }[];
  availableTeachers: {
    id: number;
    firstName: string;
    lastName: string;
    department: string | null;
  }[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
  sectionId: number;
}

export default function AddSubjectDialog({
  open,
  onOpenChange,
  sectionId,
  availableSubjects,
  availableTeachers,
}: AddSubjectDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Staff Picker State
  const [isStaffPickerOpen, setIsStaffPickerOpen] = useState(false);
  const [staffSearch, setStaffSearch] = useState("");
  const [showAllStaff, setShowAllStaff] = useState(false);

  function resetForm() {
    setSubjectId("");
    setTeacherId("");
    setDayOfWeek("");
    setStartTime("");
    setEndTime("");
    setStaffSearch("");
    setShowAllStaff(false);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) {
      toast.error("Please select a subject");
      return;
    }

    startTransition(async () => {
      const res = await assignSubjectToSection({
        sectionId,
        subjectId: Number.parseInt(subjectId, 10),
        teacherId: teacherId ? Number.parseInt(teacherId, 10) : null,
        dayOfWeek: dayOfWeek
          ? (dayOfWeek as
              | "monday"
              | "tuesday"
              | "wednesday"
              | "thursday"
              | "friday")
          : null,
        startTime: startTime || null,
        endTime: endTime || null,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Subject added to section");
        // Trigger SWR re-validation for the schedule
        mutate(`/api/registrar/sections/${sectionId}/schedule`);
        resetForm();
        onOpenChange(false);
      }
    });
  };

  const filteredStaff = availableTeachers.filter((s) => {
    const matchesSearch = `${s.firstName} ${s.lastName}`
      .toLowerCase()
      .includes(staffSearch.toLowerCase());
    const isFaculty = s.department === "faculty" || s.department === null;
    const matchesType = showAllStaff || isFaculty;

    return matchesSearch && matchesType;
  });

  const selectedTeacher = availableTeachers.find(
    (t) => t.id.toString() === teacherId,
  );

  if (!open) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between border-b p-6">
            <h3 className="font-semibold text-gray-900 text-lg">
              Add Subject to Section
            </h3>
            <button onClick={() => !isPending && onOpenChange(false)}>
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <div className="overflow-y-auto p-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Subject Selection */}
              <div>
                <Label className="font-medium text-gray-700 text-sm">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
                  disabled={isPending}
                  onChange={(e) => setSubjectId(e.target.value)}
                  required
                  value={subjectId}
                >
                  <option value="">Select a subject...</option>
                  {availableSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} {subject.code ? `(${subject.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher Selection */}
              <div>
                <Label className="font-medium text-gray-700 text-sm">
                  Teacher (Optional)
                </Label>
                <div
                  className={`mt-1 flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ${isPending ? "cursor-not-allowed opacity-50" : "cursor-pointer transition-colors hover:bg-gray-50"}`}
                  onClick={() => !isPending && setIsStaffPickerOpen(true)}
                >
                  {selectedTeacher ? (
                    <div className="flex items-center">
                      <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 font-bold text-[10px] text-indigo-700">
                        {selectedTeacher.firstName[0]}
                      </div>
                      <span className="font-medium text-gray-900">
                        {selectedTeacher.firstName} {selectedTeacher.lastName}
                      </span>
                      <Badge
                        className="ml-2 h-4 bg-gray-50 py-0 text-[10px] capitalize"
                        variant="outline"
                      >
                        {selectedTeacher.department || "faculty"}
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-gray-500">
                      Assign Teacher (Optional)
                    </span>
                  )}
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                {teacherId && !isPending && (
                  <button
                    className="mt-1 px-0 font-medium text-[10px] text-red-500 underline hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTeacherId("");
                    }}
                    type="button"
                  >
                    Clear assignment
                  </button>
                )}
              </div>

              {/* Schedule Section */}
              <div className="border-t pt-5">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Schedule (Optional)
                  </h4>
                  <Button
                    className="h-auto px-2 py-1 text-red-600 text-xs hover:bg-red-50 hover:text-red-700"
                    disabled={isPending}
                    onClick={() => {
                      setDayOfWeek("");
                      setStartTime("");
                      setEndTime("");
                    }}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Reset to Defaults
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Day of Week */}
                  <div>
                    <Label className="font-medium text-gray-700 text-sm">
                      Day
                    </Label>
                    <select
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
                      disabled={isPending}
                      onChange={(e) => setDayOfWeek(e.target.value)}
                      value={dayOfWeek}
                    >
                      <option value="">Select day...</option>
                      {Object.entries(DAY_OF_WEEK_LABELS).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  {/* Start Time */}
                  <div>
                    <Label className="font-medium text-gray-700 text-sm">
                      Start Time
                    </Label>
                    <Input
                      className="mt-1"
                      disabled={isPending}
                      onChange={(e) => setStartTime(e.target.value)}
                      type="time"
                      value={startTime}
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <Label className="font-medium text-gray-700 text-sm">
                      End Time
                    </Label>
                    <Input
                      className="mt-1"
                      disabled={isPending}
                      onChange={(e) => setEndTime(e.target.value)}
                      type="time"
                      value={endTime}
                    />
                  </div>
                </div>

                <p className="mt-2 text-gray-500 text-xs">
                  Schedule can be set later when finalizing the class timetable
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 border-t pt-5">
                <Button
                  disabled={isPending}
                  onClick={() => onOpenChange(false)}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button disabled={isPending} type="submit">
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Subject"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Staff Picker Modal */}
      {isStaffPickerOpen && !isPending && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="fade-in zoom-in w-full max-w-md animate-in overflow-hidden rounded-lg bg-white shadow-2xl duration-200">
            <div className="flex items-center justify-between border-b bg-gray-50 p-4">
              <h3 className="font-semibold text-gray-900">Select Teacher</h3>
              <button
                className="text-gray-400 transition-colors hover:text-gray-600"
                onClick={() => setIsStaffPickerOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-4">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  autoFocus
                  className="pl-9"
                  onChange={(e) => setStaffSearch(e.target.value)}
                  placeholder="Search staff by name..."
                  value={staffSearch}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="ml-1 font-medium text-gray-500 text-xs">
                  Filter
                </span>
                <div className="flex gap-2">
                  <button
                    className={`rounded-md border px-3 py-1.5 font-medium text-xs transition-all ${
                      showAllStaff
                        ? "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        : "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                    }`}
                    onClick={() => setShowAllStaff(false)}
                  >
                    Faculty Only
                  </button>
                  <button
                    className={`rounded-md border px-3 py-1.5 font-medium text-xs transition-all ${
                      showAllStaff
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={() => setShowAllStaff(true)}
                  >
                    Show All
                  </button>
                </div>
              </div>
              <div className="max-h-64 divide-y overflow-y-auto rounded-md border">
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((s) => (
                    <button
                      className={`group flex w-full items-center p-3 text-left transition-colors hover:bg-indigo-50 ${teacherId === s.id.toString() ? "bg-indigo-50" : ""}`}
                      key={s.id}
                      onClick={() => {
                        setTeacherId(s.id.toString());
                        setIsStaffPickerOpen(false);
                      }}
                    >
                      <div
                        className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs transition-colors ${
                          teacherId === s.id.toString()
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-600 group-hover:bg-indigo-200 group-hover:text-indigo-700"
                        }`}
                      >
                        {s.firstName[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-gray-900 text-sm">
                          {s.firstName} {s.lastName}
                        </p>
                        <p className="font-medium text-[10px] text-gray-500 uppercase tracking-wider">
                          {s.department || "Faculty"}
                        </p>
                      </div>
                      <Badge
                        className={`ml-2 text-[9px] capitalize ${s.department === "faculty" || !s.department ? "border-green-100 text-green-600" : "border-blue-100 text-blue-600"}`}
                        variant="outline"
                      >
                        {s.department || "Academic"}
                      </Badge>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No staff found matching your criteria.
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end border-t bg-gray-50 p-3">
              <Button
                onClick={() => setIsStaffPickerOpen(false)}
                size="sm"
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
