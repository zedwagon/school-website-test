"use client";

import { DAY_OF_WEEK_LABELS, GRADE_LEVEL_LABELS } from "@school/api/constants";
import {
  removeSectionSubject,
  restoreSectionSubject,
  unassignStudentFromSection,
} from "@school/api/sections/action";
import { Badge, Button } from "@school/ui";
import {
  Archive,
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Edit2,
  MapPin,
  Plus,
  RefreshCw,
  RotateCcw,
  School,
  User,
  UserMinus,
  Users as UsersIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { formatPH } from "@/lib/utils";
import AddSubjectDialog from "./add-subject-dialog";
import EditSubjectDialog from "./edit-subject-dialog";

interface SectionDetailsClientProps {
  availableSubjects: { id: number; name: string; code: string | null }[];
  availableTeachers: {
    id: number;
    firstName: string;
    lastName: string;
    department: string | null;
  }[];
  schedule: {
    id: number;
    subjectName: string;
    subjectCode: string | null;
    teacherId: number | null;
    teacherFirstName: string | null;
    teacherLastName: string | null;
    dayOfWeek: string | null;
    startTime: string | null;
    endTime: string | null;
    archivedAt: string | null;
  }[];
  section: {
    id: number;
    name: string;
    gradeLevel: string;
    room: string | null;
    schoolYearId: number;
    schoolYearName: string | null;
    adviserId: number | null;
    adviserFirstName: string | null;
    adviserLastName: string | null;
    createdAt: string;
    studentCount: number;
  };
  students: {
    id: number;
    enrollmentId: number;
    firstName: string;
    middleName: string | null;
    lastName: string;
    suffix: string | null;
    lrn: string | null;
    gender: string | null;
    gradeLevel: string;
    assignedAt: string;
  }[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SectionDetailsClient({
  section,
  schedule,
  students,
  availableSubjects,
  availableTeachers: availableEmployees,
}: SectionDetailsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<
    SectionDetailsClientProps["schedule"][0] | null
  >(null);
  const [activeTab, setActiveTab] = useState<"schedule" | "students">(
    "schedule",
  );
  const [filterStatus, setFilterStatus] = useState<"active" | "archived">(
    "active",
  );

  // --- SWR Hooks ---
  const {
    data: swrSchedule,
    isLoading: isScheduleLoading,
    isValidating: isScheduleValidating,
    mutate: mutateSchedule,
  } = useSWR(`/api/registrar/sections/${section.id}/schedule`, fetcher, {
    fallbackData: schedule,
  });

  const {
    data: swrStudents,
    isLoading: isStudentsLoading,
    isValidating: isStudentsValidating,
    mutate: mutateStudents,
  } = useSWR(`/api/registrar/sections/${section.id}/students`, fetcher, {
    fallbackData: students,
  });

  const { data: swrSection, mutate: mutateSection } = useSWR(
    `/api/registrar/sections/${section.id}`,
    fetcher,
    {
      fallbackData: section,
    },
  );

  const currentSchedule = swrSchedule || schedule;
  const currentStudents = swrStudents || students;
  const currentSection = swrSection || section;

  // Filter the schedule based on the selected tab
  const filteredSchedule = currentSchedule.filter(
    (item: SectionDetailsClientProps["schedule"][0]) => {
      if (filterStatus === "active") {
        return !item.archivedAt;
      }
      return !!item.archivedAt;
    },
  );

  const handleRemove = (id: number, subjectName: string) => {
    if (confirm(`Archive ${subjectName} from this section?`)) {
      startTransition(async () => {
        const res = await removeSectionSubject(id);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Subject archived");
          mutateSchedule();
        }
      });
    }
  };

  const handleRestore = (id: number) => {
    if (confirm("Restore this subject to the active list?")) {
      startTransition(async () => {
        const res = await restoreSectionSubject(id);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Subject restored");
          mutateSchedule();
        }
      });
    }
  };

  const handleUnassign = (enrollmentId: number, name: string) => {
    if (confirm(`Unassign ${name} from this section?`)) {
      startTransition(async () => {
        const res = await unassignStudentFromSection(enrollmentId, section.id);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(`${name} unassigned successfully`);
          mutateStudents();
          // Refresh the section header for student count via SWR
          mutateSection();
        }
      });
    }
  };

  const adviserName =
    currentSection.adviserFirstName && currentSection.adviserLastName
      ? `${currentSection.adviserFirstName} ${currentSection.adviserLastName}`
      : "Not assigned";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          className="mb-4 -ml-2"
          onClick={() => router.push("/dashboard/staff/registrar/sections")}
          variant="ghost"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Class Builder
        </Button>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="relative overflow-hidden bg-linear-to-brs from-indigo-50/50 via-white to-white p-6 sm:p-8">
            <div className="pointer-events-none absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 transform p-8 opacity-[0.03]">
              <School className="h-64 w-64 text-indigo-900" />
            </div>

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
              <div className="shrink-0 rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
                <School className="h-10 w-10 text-indigo-600" />
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-bold text-2xl text-gray-900 tracking-tight sm:text-3xl">
                    {GRADE_LEVEL_LABELS[
                      currentSection.gradeLevel as keyof typeof GRADE_LEVEL_LABELS
                    ] || currentSection.gradeLevel}{" "}
                    - {currentSection.name}
                  </h1>
                  <Badge
                    className="border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    variant="secondary"
                  >
                    {currentSection.schoolYearName}
                  </Badge>
                </div>
                <p className="font-medium text-gray-500">
                  Class Section Details
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 divide-y border-gray-200 border-t bg-gray-50/40 md:grid-cols-3 md:divide-x md:divide-y-0">
            <div className="group flex items-center gap-4 p-4 transition-colors hover:bg-white sm:px-8 sm:py-6">
              <div className="shrink-0 rounded-xl border border-gray-200 bg-white p-2.5 text-purple-600 shadow-sm transition-colors group-hover:border-purple-200 group-hover:bg-purple-50">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="mb-0.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Class Adviser
                </p>
                <div className="font-semibold text-gray-900 text-sm md:text-base">
                  {adviserName}
                </div>
              </div>
            </div>

            <div className="group flex items-center gap-4 p-4 transition-colors hover:bg-white sm:px-8 sm:py-6">
              <div className="shrink-0 rounded-xl border border-gray-200 bg-white p-2.5 text-green-600 shadow-sm transition-colors group-hover:border-green-200 group-hover:bg-green-50">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="mb-0.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Room Assignment
                </p>
                <div className="font-semibold text-gray-900 text-sm md:text-base">
                  {currentSection.room || "Not assigned"}
                </div>
              </div>
            </div>

            <div className="group flex items-center gap-4 p-4 transition-colors hover:bg-white sm:px-8 sm:py-6">
              <div className="shrink-0 rounded-xl border border-gray-200 bg-white p-2.5 text-orange-600 shadow-sm transition-colors group-hover:border-orange-200 group-hover:bg-orange-50">
                <UsersIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="mb-0.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Enrolled
                </p>
                <div className="font-semibold text-gray-900 text-sm md:text-base">
                  {currentSection.studentCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-gray-200 border-b">
        <button
          className={`relative pb-4 font-semibold text-sm transition-colors ${
            activeTab === "schedule"
              ? "text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("schedule")}
        >
          Subjects & Schedule
          {activeTab === "schedule" && (
            <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-indigo-600" />
          )}
        </button>
        <button
          className={`relative pb-4 font-semibold text-sm transition-colors ${
            activeTab === "students"
              ? "text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("students")}
        >
          <div className="flex items-center gap-2">
            Enrolled Students ({currentStudents.length})
            {(isStudentsValidating || isStudentsLoading) && (
              <RefreshCw className="h-3 w-3 animate-spin text-indigo-400" />
            )}
          </div>
          {activeTab === "students" && (
            <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-indigo-600" />
          )}
        </button>
      </div>

      {activeTab === "schedule" ? (
        /* Subjects & Schedule */
        <div
          className="rounded-lg border border-gray-200 bg-white shadow-md transition-all duration-300"
          style={{
            opacity:
              isPending || isScheduleLoading || isScheduleValidating ? 0.7 : 1,
          }}
        >
          <div className="border-gray-200 border-b p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="flex items-center gap-2 font-bold text-gray-900 text-xl">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                  Subjects & Schedule
                </h2>
                <p className="mt-1 text-gray-500 text-sm">
                  {filteredSchedule.length}{" "}
                  {filterStatus === "active" ? "active" : "archived"} subject
                  {filteredSchedule.length !== 1 ? "s" : ""} listed
                  {(isScheduleValidating || isScheduleLoading) && (
                    <span className="ml-2 inline-flex items-center text-indigo-400 text-xs italic">
                      <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                      Syncing...
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex shrink-0 rounded-lg bg-gray-100 p-1">
                  <button
                    className={`rounded-md px-4 py-2 font-medium text-sm transition-all ${filterStatus === "active" ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setFilterStatus("active")}
                  >
                    Active
                  </button>
                  <button
                    className={`rounded-md px-4 py-2 font-medium text-sm transition-all ${filterStatus === "archived" ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setFilterStatus("archived")}
                  >
                    Archived
                  </button>
                </div>

                <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={filterStatus === "archived" || isPending}
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Subject
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredSchedule.length === 0 ? (
              <div className="py-12 text-center">
                <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 font-medium text-gray-900 text-lg">
                  {filterStatus === "active"
                    ? "No subjects assigned yet"
                    : "No archived subjects"}
                </h3>
                <p className="mb-4 text-gray-500">
                  {filterStatus === "active"
                    ? "Get started by adding subjects to this section"
                    : "Subjects you archive will appear here"}
                </p>
                {filterStatus === "active" && (
                  <Button
                    disabled={isPending}
                    onClick={() => setIsAddDialogOpen(true)}
                    variant="outline"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Subject
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSchedule.map(
                  (item: SectionDetailsClientProps["schedule"][0]) => (
                    <div
                      className={`rounded-lg border p-4 transition-all ${
                        item.archivedAt
                          ? "border-gray-200 bg-gray-50"
                          : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm"
                      }`}
                      key={item.id}
                    >
                      <div
                        className={`flex items-start gap-4 ${item.archivedAt ? "opacity-60" : ""}`}
                      >
                        {/* Icon */}
                        <div
                          className={`shrink-0 rounded-lg p-2 ${item.archivedAt ? "bg-gray-200" : "bg-orange-100"}`}
                        >
                          <BookOpen
                            className={`h-5 w-5 ${item.archivedAt ? "text-gray-500" : "text-orange-600"}`}
                          />
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="mb-1.5 flex flex-wrap items-baseline gap-2">
                            <h3 className="font-semibold text-gray-900 text-lg leading-none">
                              {item.subjectName}
                            </h3>
                            {item.subjectCode && (
                              <span className="rounded-md border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-medium text-gray-500 text-xs">
                                {item.subjectCode}
                              </span>
                            )}
                            {item.archivedAt && (
                              <Badge
                                className="border-gray-300 bg-gray-200 text-[10px] text-gray-600"
                                variant="secondary"
                              >
                                Archived
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-600 text-sm">
                            <div className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-gray-400" />
                              <span
                                className={
                                  item.teacherFirstName && item.teacherLastName
                                    ? ""
                                    : "text-gray-400 italic"
                                }
                              >
                                {item.teacherFirstName && item.teacherLastName
                                  ? `${item.teacherFirstName} ${item.teacherLastName}`
                                  : "No teacher assigned"}
                              </span>
                            </div>

                            {(item.dayOfWeek ||
                              (item.startTime && item.endTime)) && (
                              <div className="hidden h-3 w-px bg-gray-300 sm:block" />
                            )}

                            {item.dayOfWeek ||
                            (item.startTime && item.endTime) ? (
                              <div className="flex items-center gap-3">
                                {item.dayOfWeek && (
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                    <Badge
                                      className="border-gray-200 bg-gray-50 font-normal text-gray-700 text-xs hover:bg-gray-100"
                                      variant="secondary"
                                    >
                                      {DAY_OF_WEEK_LABELS[
                                        item.dayOfWeek as keyof typeof DAY_OF_WEEK_LABELS
                                      ] || item.dayOfWeek}
                                    </Badge>
                                  </div>
                                )}

                                {item.startTime && item.endTime && (
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                                    <span>
                                      {item.startTime} - {item.endTime}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <>
                                <div className="hidden h-3 w-px bg-gray-300 sm:block" />
                                <span className="text-gray-400 text-xs italic">
                                  Unscheduled
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex shrink-0 gap-1">
                          {item.archivedAt ? (
                            <Button
                              className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-900"
                              disabled={isPending}
                              onClick={() => handleRestore(item.id)}
                              size="sm"
                              title="Restore Subject"
                              variant="ghost"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          ) : (
                            <>
                              <Button
                                className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-900"
                                disabled={isPending}
                                onClick={() => setEditingSubject(item)}
                                size="sm"
                                variant="ghost"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                className="h-8 w-8 p-0 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                                disabled={isPending}
                                onClick={() =>
                                  handleRemove(item.id, item.subjectName)
                                }
                                size="sm"
                                title="Archive Subject"
                                variant="ghost"
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Students List */
        <div className="rounded-lg border border-gray-200 bg-white shadow-md">
          <div className="border-gray-200 border-b p-6">
            <h2 className="flex items-center gap-2 font-bold text-gray-900 text-xl">
              <UsersIcon className="h-6 w-6 text-indigo-600" />
              Enrolled Students
              {(isStudentsValidating || isStudentsLoading) && (
                <span className="ml-2 inline-flex items-center text-indigo-400 text-xs font-normal italic">
                  <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                  Syncing...
                </span>
              )}
            </h2>
          </div>
          <div className="overflow-x-auto p-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 font-semibold text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Student Name</th>
                  <th className="px-6 py-3 text-left">LRN</th>
                  <th className="px-6 py-3 text-left">Gender</th>
                  <th className="px-6 py-3 text-left">Assigned Date</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentStudents.length === 0 ? (
                  <tr>
                    <td
                      className="px-6 py-12 text-center text-gray-500"
                      colSpan={4}
                    >
                      No students assigned to this section yet.
                    </td>
                  </tr>
                ) : (
                  currentStudents.map(
                    (s: SectionDetailsClientProps["students"][0]) => (
                      <tr
                        className="transition-colors hover:bg-gray-50"
                        key={s.id}
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-600 text-xs">
                              {s.firstName[0]}
                              {s.lastName[0]}
                            </div>
                            <span className="font-medium text-gray-900">
                              {s.firstName}{" "}
                              {s.middleName ? `${s.middleName.charAt(0)}.` : ""}{" "}
                              {s.lastName} {s.suffix || ""}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 font-mono text-gray-600 text-sm">
                          {s.lrn || "N/A"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Badge
                            className={`capitalize ${s.gender === "male" ? "text-blue-600" : "text-pink-600"}`}
                            variant="outline"
                          >
                            {s.gender || "N/A"}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-gray-500 text-sm">
                          {s.assignedAt
                            ? formatPH(s.assignedAt, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "N/A"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <Button
                            className="text-gray-400 hover:bg-red-50 hover:text-red-600"
                            disabled={isPending}
                            onClick={() =>
                              handleUnassign(
                                s.enrollmentId,
                                `${s.firstName} ${s.lastName}`,
                              )
                            }
                            size="sm"
                            title="Unassign Student"
                            variant="ghost"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ),
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <AddSubjectDialog
        availableSubjects={availableSubjects}
        availableTeachers={availableEmployees}
        onOpenChange={setIsAddDialogOpen}
        open={isAddDialogOpen}
        sectionId={currentSection.id}
      />

      {editingSubject && (
        <EditSubjectDialog
          availableTeachers={availableEmployees}
          onOpenChange={(open) => !open && setEditingSubject(null)}
          open={!!editingSubject}
          sectionId={currentSection.id}
          sectionSubject={editingSubject}
        />
      )}
    </div>
  );
}
