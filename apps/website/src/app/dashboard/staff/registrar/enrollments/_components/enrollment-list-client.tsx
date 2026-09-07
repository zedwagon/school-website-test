"use client";

import { GRADE_LEVEL_LABELS } from "@school/api/constants";
import { Badge, Button, Pagination } from "@school/ui";
import {
  ClipboardList,
  Clock,
  GraduationCap,
  Pencil,
  School,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import useSWR from "swr";
import { PortalPageControls } from "@/components/portal/portal-page-controls";
import { formatPH } from "@/lib/utils";
import { AssignToClassDialog } from "../../students/_components/assign-to-class-dialog";
import { EnrollmentWizard } from "../../students/_components/enrollment-wizard";
import { EditEscDialog } from "./edit-esc-dialog";
import { EditNoteDialog } from "./edit-note-dialog";
import { EnrollmentTrackingDialog } from "./enrollment-tracking-dialog";
import { StudentStatusDialog } from "./student-status-dialog";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface PendingEnrollment {
  assistedAt?: string | null;
  assistedByFirstName?: string | null;
  assistedByLastName?: string | null;
  email: string;
  firstName: string;
  gradeLevel: string | null;
  id: number;
  isAssigned: boolean;
  lastName: string;
  learnerType: string | null;
  lrn: string | null;
  middleName: string | null;
  sectionName: string | null;
  shsTrack: string | null;
  status: boolean;
  statusAccountingApprovedByName?: string | null;
  statusAccountingDone: boolean | null;
  statusAccountingNote: string | null;
  statusClinicApprovedByName?: string | null;
  statusClinicDone: boolean | null;
  statusClinicNote: string | null;
  statusGuidanceApprovedByName?: string | null;
  statusGuidanceDone: boolean | null;
  statusGuidanceNote: string | null;
  statusNote: string | null;
  studentId: number;
  studentType: string | null;
  submittedAt: string | null;
  suffix?: string | null;
}

interface EnrolledStudent {
  assistedAt?: string | null;
  assistedByFirstName?: string | null;
  assistedByLastName?: string | null;
  email: string;
  enrolledAt: string | null;
  escNumber: string | null;
  firstName: string;
  gradeLevel: string | null;
  id: number;
  isAssigned: boolean;
  isEsc: boolean | null;
  lastName: string;
  learnerType: string | null;
  lrn: string | null;
  middleName: string | null;
  sectionName: string | null;
  shsTrack: string | null;
  statusRegistrarNote?: string | null;
  studentId: number;
  studentType: string | null;
  suffix?: string | null;
}

interface DroppedStudent {
  email: string;
  exitAt: string | null;
  firstName: string;
  gradeLevel: string | null;
  id: number;
  lastName: string;
  lrn: string | null;
  middleName: string | null;
  statusNote: string | null;
  studentId: number;
  studentType: string | null;
  suffix?: string | null;
}

interface SchoolYear {
  id: number;
  isActive: boolean;
  name: string;
}

interface ActiveSY {
  id: number;
  name: string;
}

interface EnrollmentListClientProps {
  currentUserDepartment?: string;
  currentUserRole?: string;
  initialActiveSY: ActiveSY | null;
  initialDroppedCount?: number;
  initialDroppedStudents?: DroppedStudent[];
  initialEnrolledCount: number;
  initialEnrolledStudents: EnrolledStudent[];
  initialPendingEnrollments: PendingEnrollment[];
  initialSchoolYears: SchoolYear[];
}

const STATIONS = [
  { key: "statusClinicDone", label: "Clinic" },
  { key: "statusGuidanceDone", label: "Guidance" },
  { key: "statusAccountingDone", label: "Accounting" },
] as const;

function ClearanceGrid({
  student,
}: {
  student: Pick<
    PendingEnrollment,
    "statusClinicDone" | "statusGuidanceDone" | "statusAccountingDone"
  >;
}) {
  const flags = [
    student.statusClinicDone,
    student.statusGuidanceDone,
    student.statusAccountingDone,
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {STATIONS.map((station, i) => {
        const done = !!flags[i];
        return (
          <div
            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium text-xs ${
              done
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-gray-200 bg-gray-50 text-gray-400"
            }`}
            key={station.key}
            title={station.label}
          >
            <div
              className={`h-1.5 w-1.5 rounded-full ${done ? "bg-green-500" : "bg-gray-300"}`}
            />
            {station.label}
          </div>
        );
      })}
    </div>
  );
}

export default function EnrollmentListClient({
  initialPendingEnrollments,
  initialEnrolledStudents,
  initialEnrolledCount,
  initialDroppedStudents = [],
  initialDroppedCount = 0,
  initialSchoolYears,
  initialActiveSY,
  currentUserDepartment,
  currentUserRole,
}: EnrollmentListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchParam = searchParams.get("search") || "";
  const tabParam =
    (searchParams.get("tab") as "all" | "enrolled" | "dropped") || "all";
  const syParam = searchParams.get("sy") || initialActiveSY?.id.toString();
  const pageParam = parseInt(searchParams.get("page") || "1");

  // --- SWR Hooks ---
  const {
    data: pendingData,
    isLoading: isPendingLoading,
    mutate: mutatePending,
  } = useSWR(
    `/api/registrar/enrollments/pending?search=${searchParam}&syId=${syParam}&page=${pageParam}`,
    fetcher,
    {
      fallbackData: {
        data: initialPendingEnrollments,
        totalCount: initialPendingEnrollments.length,
      },
    },
  );

  const {
    data: enrolledData,
    isLoading: isEnrolledLoading,
    mutate: mutateEnrolled,
  } = useSWR(
    `/api/registrar/enrollments/enrolled?search=${searchParam}&syId=${syParam}&page=${pageParam}`,
    fetcher,
    {
      fallbackData: {
        data: initialEnrolledStudents,
        totalCount: initialEnrolledCount,
      },
    },
  );

  const {
    data: droppedData,
    isLoading: isDroppedLoading,
    mutate: mutateDropped,
  } = useSWR(
    syParam
      ? `/api/registrar/enrollments/dropped?search=${searchParam}&syId=${syParam}`
      : null,
    fetcher,
    {
      fallbackData: {
        data: initialDroppedStudents,
        count: initialDroppedCount,
      },
    },
  );

  const { data: syData } = useSWR("/api/registrar/school-years", fetcher, {
    fallbackData: { data: initialSchoolYears },
  });

  const mutateAll = () => {
    mutatePending();
    mutateEnrolled();
    mutateDropped();
  };

  const pendingEnrollments = pendingData?.data || [];
  const totalCount = pendingData?.totalCount || 0;

  const enrolledStudents = enrolledData?.data || [];
  const enrolledCount = enrolledData?.totalCount || 0;

  const droppedStudents = droppedData?.data || [];
  const droppedCount = droppedData?.count || 0;

  const schoolYears = syData?.data || [];
  const selectedSyId = syParam ? parseInt(syParam) : initialActiveSY?.id;

  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParam);
  const [activeTab, setActiveTab] = useState<"all" | "enrolled" | "dropped">(
    tabParam,
  );
  const [trackingStudentId, setTrackingStudentId] = useState<number | null>(
    null,
  );
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [assigningEnrollment, setAssigningEnrollment] = useState<{
    id: number;
    name: string;
    gradeLevel: string | null;
  } | null>(null);
  const [statusDialogData, setStatusDialogData] = useState<{
    id: number;
    name: string;
    status: "enrolled" | "dropped" | "transferred";
  } | null>(null);
  const [editingEsc, setEditingEsc] = useState<{
    id: number;
    name: string;
    escNumber: string | null;
  } | null>(null);
  const [editingNote, setEditingNote] = useState<{
    id: number;
    name: string;
    note: string | null;
  } | null>(null);

  const updateSearchParams = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }
      params.delete("page");
      if (activeTab !== "all") {
        params.set("tab", activeTab);
      } else {
        params.delete("tab");
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams, activeTab],
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    if (typeof window !== "undefined") {
      clearTimeout(
        (window as unknown as Record<string, ReturnType<typeof setTimeout>>)
          .__enrollSearchTimer,
      );
      (
        window as unknown as Record<string, ReturnType<typeof setTimeout>>
      ).__enrollSearchTimer = setTimeout(() => updateSearchParams(value), 300);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-bold text-2xl text-gray-800">Enrollment</h2>
        <p className="mt-1 text-gray-500 text-sm">
          Track enrollment steps and finalize student enrollments
        </p>
      </div>

      {/* Standardized Controls */}
      <PortalPageControls
        primaryAction={{
          label: "Enroll Student",
          onClick: () => setIsWizardOpen(true),
          icon: UserPlus,
        }}
        schoolYear={{
          data: schoolYears,
          selectedId: selectedSyId,
        }}
        search={{
          value: search,
          onChange: handleSearch,
          placeholder: "Search enrollments...",
        }}
      />

      {/* Tabs */}
      <div className="mb-5 flex gap-1 border-gray-200 border-b">
        <button
          className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 font-medium text-sm transition-colors ${
            activeTab === "all"
              ? "border-indigo-500 text-indigo-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => {
            setActiveTab("all");
            const params = new URLSearchParams(searchParams.toString());
            params.delete("tab");
            startTransition(() => {
              router.push(`${pathname}?${params.toString()}`);
            });
          }}
        >
          <Clock className="h-4 w-4" />
          All Pending
          <Badge className="ml-1 h-4 px-1.5 py-0 text-xs" variant="outline">
            {totalCount}
          </Badge>
        </button>
        {currentUserDepartment !== "faculty" && (
          <>
            <button
              className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 font-medium text-sm transition-colors ${
                activeTab === "enrolled"
                  ? "border-emerald-500 text-emerald-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => {
                setActiveTab("enrolled");
                const params = new URLSearchParams(searchParams.toString());
                params.set("tab", "enrolled");
                startTransition(() => {
                  router.push(`${pathname}?${params.toString()}`);
                });
              }}
            >
              <GraduationCap className="h-4 w-4" />
              Enrolled
              <Badge
                className="ml-1 h-4 border-emerald-200 px-1.5 py-0 text-emerald-600 text-xs"
                variant="outline"
              >
                {enrolledCount}
              </Badge>
            </button>
            <button
              className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 font-medium text-sm transition-colors ${
                activeTab === "dropped"
                  ? "border-red-500 text-red-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => {
                setActiveTab("dropped");
                const params = new URLSearchParams(searchParams.toString());
                params.set("tab", "dropped");
                startTransition(() => {
                  router.push(`${pathname}?${params.toString()}`);
                });
              }}
            >
              <UserMinus className="h-4 w-4" />
              Dropped / Transferred
              <Badge
                className="ml-1 h-4 border-red-200 px-1.5 py-0 text-red-600 text-xs"
                variant="outline"
              >
                {droppedCount}
              </Badge>
            </button>
          </>
        )}
      </div>

      {/* ── ALL PENDING TAB ── */}
      {activeTab === "all" && (
        <div>
          <div
            className="overflow-hidden rounded-md border border-gray-200 bg-white shadow"
            style={{
              opacity: isPending || isPendingLoading ? 0.6 : 1,
              transition: "opacity 0.2s",
            }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Applying For
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Assisted By
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Pipeline Status
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {pendingEnrollments?.map((item: PendingEnrollment) => (
                    <tr
                      className="transition-colors hover:bg-gray-50"
                      key={item.id}
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 text-sm">
                            {item.firstName}{" "}
                            {item.middleName
                              ? `${item.middleName.charAt(0)}.`
                              : ""}{" "}
                            {item.lastName} {item.suffix || ""}
                          </span>
                          {item.lrn && (
                            <span className="text-gray-400 text-xs">
                              LRN: {item.lrn}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge className="text-xs" variant="secondary">
                          {GRADE_LEVEL_LABELS[
                            item.gradeLevel as keyof typeof GRADE_LEVEL_LABELS
                          ] || item.gradeLevel}
                        </Badge>
                        {item.learnerType === "senior_high" && (
                          <div className="mt-1 flex gap-1">
                            {item.shsTrack && (
                              <Badge
                                className="border-amber-100 bg-amber-50 py-0 text-[10px] text-amber-700"
                                variant="outline"
                              >
                                {item.shsTrack.toUpperCase()}
                              </Badge>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {item.assistedByFirstName || item.assistedByLastName ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-indigo-600">
                              {item.assistedByFirstName}{" "}
                              {item.assistedByLastName}
                            </span>
                            {item.assistedAt && (
                              <span className="text-[10px] text-gray-400">
                                {formatPH(item.assistedAt)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300 italic">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <ClearanceGrid student={item} />
                      </td>
                      <td className="space-x-2 whitespace-nowrap px-6 py-4 text-right">
                        {currentUserDepartment !== "faculty" && item.status && (
                          <Button
                            className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800"
                            disabled={isPending || item.isAssigned}
                            onClick={() =>
                              setAssigningEnrollment({
                                id: item.id,
                                name: `${item.firstName} ${item.lastName}`,
                                gradeLevel: item.gradeLevel,
                              })
                            }
                            size="sm"
                            title="Assign to Class Section"
                            variant="ghost"
                          >
                            {item.isAssigned ? (
                              <Badge
                                className="border-emerald-100 bg-emerald-50 font-normal text-emerald-600"
                                variant="outline"
                              >
                                {item.sectionName}
                              </Badge>
                            ) : (
                              <School className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        {(() => {
                          const allDone =
                            item.statusClinicDone &&
                            item.statusGuidanceDone &&
                            item.statusAccountingDone;
                          return (
                            <Button
                              className={`gap-2 ${
                                allDone
                                  ? "border-indigo-600 bg-indigo-600 text-white hover:border-indigo-700 hover:bg-indigo-700"
                                  : "border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                              }`}
                              onClick={() =>
                                setTrackingStudentId(item.studentId)
                              }
                              size="sm"
                              variant="outline"
                            >
                              <ClipboardList className="h-4 w-4" />
                              {allDone ? "Approve" : "Track"}
                            </Button>
                          );
                        })()}
                        {currentUserDepartment !== "faculty" && (
                          <Button
                            className="text-gray-400 hover:bg-red-50 hover:text-red-600"
                            onClick={() =>
                              setStatusDialogData({
                                id: item.id,
                                name: `${item.firstName} ${item.lastName}`,
                                status: item.status ? "enrolled" : "dropped",
                              })
                            }
                            size="sm"
                            title="Update Status (Drop/Transfer)"
                            variant="ghost"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {pendingEnrollments?.length === 0 && (
                    <tr>
                      <td className="px-6 py-12" colSpan={5}>
                        <div className="flex flex-col items-center gap-2 text-center text-gray-400">
                          <Users className="h-10 w-10 text-gray-200" />
                          <p className="text-sm">
                            No pending enrollments found.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={pageParam}
            totalPages={Math.ceil(totalCount / 10)}
          />
        </div>
      )}

      {/* ── ENROLLED TAB ── */}
      {activeTab === "enrolled" && (
        <div>
          <div
            className="overflow-hidden rounded-md border border-gray-200 bg-white shadow"
            style={{
              opacity: isPending || isEnrolledLoading ? 0.6 : 1,
              transition: "opacity 0.2s",
            }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Grade Level
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                      LRN
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Assisted By
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {enrolledStudents.map((student: EnrolledStudent) => (
                    <tr
                      className="transition-colors hover:bg-gray-50"
                      key={student.id}
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                            <GraduationCap className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {student.firstName}{" "}
                              {student.middleName
                                ? `${student.middleName.charAt(0)}.`
                                : ""}{" "}
                              {student.lastName} {student.suffix || ""}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge className="text-xs" variant="outline">
                          {GRADE_LEVEL_LABELS[
                            student.gradeLevel as keyof typeof GRADE_LEVEL_LABELS
                          ] ??
                            student.gradeLevel ??
                            "—"}
                        </Badge>
                        {student.learnerType === "senior_high" && (
                          <div className="mt-1 flex gap-1">
                            {student.shsTrack && (
                              <Badge
                                className="border-amber-100 bg-amber-50 py-0 text-[10px] text-amber-700"
                                variant="outline"
                              >
                                {student.shsTrack.toUpperCase()}
                              </Badge>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-gray-500 text-sm">
                        {student.lrn || (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge className="border-green-200 bg-green-100 text-green-800 text-xs">
                          Enrolled
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {student.assistedByFirstName ||
                        student.assistedByLastName ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-indigo-600">
                              {student.assistedByFirstName}{" "}
                              {student.assistedByLastName}
                            </span>
                            {student.assistedAt && (
                              <span className="text-[10px] text-gray-400">
                                {formatPH(student.assistedAt)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        <div className="group flex items-center gap-1.5">
                          <span>
                            {student.statusRegistrarNote || (
                              <span className="text-gray-300 italic">
                                No notes
                              </span>
                            )}
                          </span>
                          {currentUserDepartment !== "faculty" && (
                            <Button
                              className="h-6 w-6 p-0 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                              onClick={() =>
                                setEditingNote({
                                  id: student.id,
                                  name: `${student.firstName} ${student.lastName}`,
                                  note: student.statusRegistrarNote || null,
                                })
                              }
                              size="sm"
                              title="Edit registrar note"
                              variant="ghost"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Button
                          className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800"
                          disabled={isPending || student.isAssigned}
                          onClick={() =>
                            setAssigningEnrollment({
                              id: student.id,
                              name: `${student.firstName} ${student.lastName}`,
                              gradeLevel: student.gradeLevel,
                            })
                          }
                          size="sm"
                          title="Assign to Class Section"
                          variant="ghost"
                        >
                          {student.isAssigned ? (
                            <div className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 font-medium text-[10px] text-emerald-600">
                              <School className="h-3 w-3" />
                              {student.sectionName}
                            </div>
                          ) : (
                            <School className="h-4 w-4" />
                          )}
                        </Button>
                        {student.isEsc && (
                          <Button
                            className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800"
                            onClick={() =>
                              setEditingEsc({
                                id: student.id,
                                name: `${student.firstName} ${student.lastName}`,
                                escNumber: student.escNumber,
                              })
                            }
                            size="sm"
                            title="Edit ESC Number"
                            variant="ghost"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          className="text-gray-400 hover:bg-red-50 hover:text-red-600"
                          onClick={() =>
                            setStatusDialogData({
                              id: student.id,
                              name: `${student.firstName} ${student.lastName}`,
                              status: "enrolled",
                            })
                          }
                          size="sm"
                          title="Update Status (Drop/Transfer)"
                          variant="ghost"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {enrolledStudents.length === 0 && (
                    <tr>
                      <td className="px-6 py-12" colSpan={6}>
                        <div className="flex flex-col items-center gap-2 text-center text-gray-400">
                          <GraduationCap className="h-10 w-10 text-gray-200" />
                          <p className="text-sm">
                            No enrolled students for this school year.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={pageParam}
            totalPages={Math.ceil(enrolledCount / 10)}
          />
        </div>
      )}

      {/* ── DROPPED / TRANSFERRED TAB ── */}
      {activeTab === "dropped" && (
        <div>
          <div
            className="overflow-hidden rounded-md border border-gray-200 bg-white shadow"
            style={{
              opacity: isPending || isDroppedLoading ? 0.6 : 1,
              transition: "opacity 0.2s",
            }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Grade Level
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                      LRN
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Note / Reason
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {droppedStudents.map((student: DroppedStudent) => (
                    <tr
                      className="transition-colors hover:bg-gray-50"
                      key={student.id}
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50">
                            <UserMinus className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {student.firstName}{" "}
                              {student.middleName
                                ? `${student.middleName.charAt(0)}.`
                                : ""}{" "}
                              {student.lastName} {student.suffix || ""}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge className="text-xs" variant="outline">
                          {GRADE_LEVEL_LABELS[
                            student.gradeLevel as keyof typeof GRADE_LEVEL_LABELS
                          ] ??
                            student.gradeLevel ??
                            "—"}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-gray-500 text-sm">
                        {student.lrn || (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <p className="text-gray-600 text-sm">
                          {student.statusNote || (
                            <span className="text-gray-400 italic">
                              No reason provided
                            </span>
                          )}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {student.exitAt ? formatPH(student.exitAt) : "—"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Badge
                          className="border-red-200 bg-red-50 text-red-700"
                          variant="secondary"
                        >
                          {student.statusNote
                            ?.toLowerCase()
                            .startsWith("transfer")
                            ? "Transferred"
                            : "Dropped"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {droppedStudents.length === 0 && (
                    <tr>
                      <td className="px-6 py-12" colSpan={6}>
                        <div className="flex flex-col items-center gap-2 text-center text-gray-400">
                          <UserMinus className="h-10 w-10 text-gray-200" />
                          <p className="text-sm">
                            No dropped or transferred students for this school
                            year.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={pageParam}
            totalPages={Math.ceil((droppedCount || 0) / 10)}
          />
        </div>
      )}

      {/* Enrollment Wizard */}
      <EnrollmentWizard
        activeSY={
          schoolYears.find((sy: SchoolYear) => sy.id === selectedSyId) ||
          initialActiveSY
        }
        onOpenChange={(open) => {
          setIsWizardOpen(open);
          if (!open) mutateAll();
        }}
        open={isWizardOpen}
      />

      {/* Enrollment Tracking Dialog */}
      {(() => {
        // Find the tracked student from the LIVE props so it auto-updates on revalidation
        const tracked = trackingStudentId
          ? (pendingEnrollments?.find(
              (e: PendingEnrollment) => e.studentId === trackingStudentId,
            ) ?? null)
          : null;
        return (
          <EnrollmentTrackingDialog
            currentUserDepartment={currentUserDepartment}
            currentUserRole={currentUserRole}
            mutate={mutateAll}
            onClose={() => setTrackingStudentId(null)}
            student={
              tracked
                ? {
                    id: tracked.id,
                    firstName: tracked.firstName,
                    middleName: tracked.middleName ?? null,
                    lastName: tracked.lastName,
                    lrn: tracked.lrn,
                    email: tracked.email,
                    gradeLevel: tracked.gradeLevel,
                    studentType: tracked.studentType,
                    isEnrolled: !!tracked.status,
                    statusNote: tracked.statusNote ?? null,
                    statusClinicDone: tracked.statusClinicDone,
                    statusGuidanceDone: tracked.statusGuidanceDone,
                    statusAccountingDone: tracked.statusAccountingDone,
                    statusClinicNote: tracked.statusClinicNote,
                    statusGuidanceNote: tracked.statusGuidanceNote,
                    statusAccountingNote: tracked.statusAccountingNote,
                    statusClinicApprovedByName:
                      tracked.statusClinicApprovedByName,
                    statusGuidanceApprovedByName:
                      tracked.statusGuidanceApprovedByName,
                    statusAccountingApprovedByName:
                      tracked.statusAccountingApprovedByName,
                    studentId: tracked.studentId,
                  }
                : null
            }
          />
        );
      })()}

      {/* Assign to Class Dialog */}
      <AssignToClassDialog
        activeSyId={selectedSyId || initialActiveSY?.id || null}
        enrollmentId={assigningEnrollment?.id || null}
        onAssignSuccess={mutateAll}
        onClose={() => setAssigningEnrollment(null)}
        open={!!assigningEnrollment}
        studentGradeLevel={assigningEnrollment?.gradeLevel || null}
        studentName={assigningEnrollment?.name || ""}
      />

      {editingEsc && (
        <EditEscDialog
          onOpenChange={(open) => !open && setEditingEsc(null)}
          onSuccess={mutateAll}
          open={!!editingEsc}
          student={editingEsc}
        />
      )}

      {statusDialogData && (
        <StudentStatusDialog
          currentStatus={statusDialogData.status}
          enrollmentId={statusDialogData.id}
          onOpenChange={(open) => !open && setStatusDialogData(null)}
          onSuccess={mutateAll}
          open={!!statusDialogData}
          studentName={statusDialogData.name}
        />
      )}

      {editingNote && (
        <EditNoteDialog
          onOpenChange={(open) => !open && setEditingNote(null)}
          onSuccess={mutateAll}
          open={!!editingNote}
          student={editingNote}
        />
      )}
    </div>
  );
}
