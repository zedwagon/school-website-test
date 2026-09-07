"use client";

import { GRADE_LEVEL_LABELS } from "@school/api/constants";
import { assignStudentToSection } from "@school/api/sections/action";
import { getSections } from "@school/api/sections/query";
import { Button, Input } from "@school/ui";
import { CheckCircle2, Loader2, School, Search, Users, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

interface Section {
  adviserFirstName: string | null;
  adviserName: string | null;
  gradeLevel: string;
  id: number;
  name: string;
  room: string | null;
  studentCount: number;
}

interface AssignToClassDialogProps {
  activeSyId: number | null;
  enrollmentId: number | null;
  onAssignSuccess?: () => void;
  onClose: () => void;
  open: boolean;
  studentGradeLevel: string | null;
  studentName: string;
}

export function AssignToClassDialog({
  open,
  enrollmentId,
  studentName,
  studentGradeLevel,
  activeSyId,
  onClose,
  onAssignSuccess,
}: AssignToClassDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!(open && activeSyId)) {
      return;
    }
    setIsLoading(true);
    getSections(activeSyId ?? undefined, undefined, "active", 1, 100).then(
      (result) => {
        const all = (result.data ?? []) as Section[];
        // Filter to matching grade level only
        const filtered = studentGradeLevel
          ? all.filter((s) => s.gradeLevel === studentGradeLevel)
          : all;
        setSections(filtered);
        setIsLoading(false);
      },
    );
  }, [open, activeSyId, studentGradeLevel]);

  const filteredSections = sections.filter((section) => {
    const query = searchQuery.toLowerCase();
    return (
      section.name.toLowerCase().includes(query) ||
      section.adviserFirstName?.toLowerCase().includes(query) ||
      section.adviserName?.toLowerCase().includes(query)
    );
  });

  // Reset selection if the selected section is filtered out
  useEffect(() => {
    if (
      selectedSectionId &&
      !filteredSections.some((s) => s.id === selectedSectionId)
    ) {
      setSelectedSectionId(null);
    }
  }, [filteredSections, selectedSectionId]);

  function handleAssign() {
    if (!(enrollmentId && selectedSectionId)) {
      return;
    }
    startTransition(async () => {
      const res = await assignStudentToSection(enrollmentId, selectedSectionId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Student assigned to section!");
        onAssignSuccess?.();
        onClose();
      }
    });
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h3 className="font-semibold text-base text-gray-900">
              Assign to Class Section
            </h3>
            <p className="mt-0.5 text-gray-500 text-sm">
              {studentName}
              {studentGradeLevel && (
                <span className="ml-2 text-indigo-600">
                  ·{" "}
                  {GRADE_LEVEL_LABELS[
                    studentGradeLevel as keyof typeof GRADE_LEVEL_LABELS
                  ] ?? studentGradeLevel}
                </span>
              )}
            </p>
          </div>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="border-b bg-gray-50/50 px-6 py-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              className="h-9 bg-white pl-9 text-sm focus-visible:ring-indigo-500"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search section or adviser..."
              value={searchQuery}
            />
          </div>
        </div>

        {/* Section List */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading sections...</span>
            </div>
          )}

          {!isLoading && filteredSections.length === 0 && (
            <div className="py-8 text-center text-gray-400 text-sm">
              {searchQuery ? (
                <>
                  No sections matching &quot;
                  <span className="font-medium text-gray-600">
                    {searchQuery}
                  </span>
                  &quot;
                </>
              ) : (
                <>
                  No sections available for{" "}
                  {studentGradeLevel
                    ? (GRADE_LEVEL_LABELS[
                        studentGradeLevel as keyof typeof GRADE_LEVEL_LABELS
                      ] ?? studentGradeLevel)
                    : "this grade"}
                  .
                </>
              )}
            </div>
          )}

          <div className="space-y-2">
            {filteredSections.map((section) => {
              const enrolled = section.studentCount ?? 0;
              const isSelected = selectedSectionId === section.id;

              return (
                <button
                  className={`w-full rounded-lg border px-4 py-3 text-left transition-all ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-400"
                      : "cursor-pointer border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                  }`}
                  disabled={false}
                  key={section.id}
                  onClick={() => setSelectedSectionId(section.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          isSelected ? "bg-indigo-600" : "bg-gray-100"
                        }`}
                      >
                        <School
                          className={`h-4 w-4 ${isSelected ? "text-white" : "text-gray-500"}`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {section.name}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {section.adviserFirstName
                            ? `Adviser: ${section.adviserFirstName} ${section.adviserName ?? ""}`
                            : "No adviser assigned"}
                          {section.room && ` · Room ${section.room}`}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        <span className={"font-medium text-gray-700 text-sm"}>
                          {enrolled}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
          <Button disabled={isPending} onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            disabled={!selectedSectionId || isPending}
            onClick={handleAssign}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {isPending ? "Assigning..." : "Assign to Section"}
          </Button>
        </div>
      </div>
    </div>
  );
}
