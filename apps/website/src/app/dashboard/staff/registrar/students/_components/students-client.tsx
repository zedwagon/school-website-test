"use client";

import { GRADE_LEVEL_LABELS } from "@school/api/constants";
import { archiveStudent, restoreStudent } from "@school/api/students/action";
import {
  Badge,
  Button,
  Pagination,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@school/ui";
import { Archive, Eye, RotateCcw, User, UserCog } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { PortalPageControls } from "@/components/portal/portal-page-controls";
import { StudentDetailsDialog } from "../../_components/student-details-dialog";
import { EditStudentDialog } from "./edit-student-dialog";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Student {
  archivedAt: string | null;
  birthdate: string | null;
  createdAt: string;
  email: string;
  enrollmentFormId: number | null;
  enrollmentSchoolYearId: number | null;
  firstName: string;
  gender: string | null;
  gradeLevel: string | null;
  id: number;
  isEnrolled: boolean | null;
  lastName: string;
  lrn: string | null;
  middleName: string | null;
  studentType: string | null;
  suffix: string | null;
  userId: number;
}

interface SchoolYear {
  id: number;
  isActive: boolean;
  name: string;
}

interface StudentsClientProps {
  currentSyId?: number;
  initialActiveCount?: number;
  initialArchivedCount?: number;
  initialStudents: Student[];
  initialTotalCount: number;
  schoolYears: SchoolYear[];
}

export default function StudentsClient({
  initialStudents,
  initialTotalCount,
  initialActiveCount,
  initialArchivedCount,
  schoolYears,
  currentSyId,
}: StudentsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchParam = searchParams.get("search") || "";
  const statusParam =
    (searchParams.get("status") as "active" | "archived") || "active";
  const pageParam = parseInt(searchParams.get("page") || "1");
  const syParam = searchParams.get("sy") || "";
  const gradeLevelParam = searchParams.get("gradeLevel") || "";

  const {
    data: swrData,
    isLoading,
    mutate,
  } = useSWR(
    `/api/registrar/students?search=${searchParam}&status=${statusParam}&page=${pageParam}&sy=${syParam}&gradeLevel=${gradeLevelParam}`,
    fetcher,
    {
      fallbackData: {
        data: initialStudents,
        totalCount: initialTotalCount,
        activeCount: initialActiveCount,
        archivedCount: initialArchivedCount,
      },
    },
  );

  const students = swrData?.data || [];
  const totalCount = swrData?.totalCount || 0;
  const activeCount = swrData?.activeCount || 0;
  const archivedCount = swrData?.archivedCount || 0;

  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParam);
  const [filterStatus, setFilterStatus] = useState<"active" | "archived">(
    statusParam,
  );

  // Dialog state
  const [viewDetailsId, setViewDetailsId] = useState<number | null>(null);
  const [editStudentId, setEditStudentId] = useState<number | null>(null);

  // URL search param update with debounce
  const updateSearchParam = useCallback(
    (value: string, status: string, gradeLevel: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }

      if (status === "archived") {
        params.set("status", "archived");
      } else {
        params.delete("status");
      }

      if (gradeLevel) {
        params.set("gradeLevel", gradeLevel);
      } else {
        params.delete("gradeLevel");
      }

      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    if (typeof window !== "undefined") {
      clearTimeout(
        (window as unknown as Record<string, ReturnType<typeof setTimeout>>)
          .__studentSearchTimer,
      );
      (
        window as unknown as Record<string, ReturnType<typeof setTimeout>>
      ).__studentSearchTimer = setTimeout(
        () => updateSearchParam(value, filterStatus, gradeLevelParam),
        300,
      );
    }
  };

  const handleStatusChange = (status: "active" | "archived") => {
    setFilterStatus(status);
    updateSearchParam(search, status, gradeLevelParam);
  };

  const handleGradeLevelChange = (value: string) => {
    updateSearchParam(search, filterStatus, value === "all" ? "" : value);
  };

  function handleArchive(id: number) {
    if (!confirm("Archive this student?")) {
      return;
    }
    startTransition(async () => {
      const res = await archiveStudent(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Student archived");
        mutate();
      }
    });
  }

  function handleRestore(id: number) {
    if (!confirm("Restore this student?")) {
      return;
    }
    startTransition(async () => {
      const res = await restoreStudent(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Student restored");
        mutate();
      }
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-bold text-2xl text-gray-800">Student Directory</h2>
        <p className="mt-1 text-gray-500 text-sm">
          Masterlist of all registered students
        </p>
      </div>

      {/* Standardized Controls */}
      <PortalPageControls
        schoolYear={{
          data: schoolYears,
          selectedId: currentSyId,
        }}
        search={{
          value: search,
          onChange: handleSearch,
          placeholder: "Search by name or LRN...",
        }}
        status={{
          value: filterStatus,
          onChange: handleStatusChange,
          activeCount,
          archivedCount,
        }}
      >
        <Select
          onValueChange={handleGradeLevelChange}
          value={gradeLevelParam || "all"}
        >
          <SelectTrigger className="w-[180px] bg-white border-gray-300">
            <SelectValue placeholder="All Grade Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grade Levels</SelectItem>
            {Object.entries(GRADE_LEVEL_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PortalPageControls>

      <div
        className="overflow-hidden rounded-md border border-gray-200 bg-white shadow"
        style={{
          opacity: isPending || isLoading ? 0.6 : 1,
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
                  Gender
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  Grade Level
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  LRN
                </th>
                <th className="px-6 py-3 text-right font-medium text-gray-500 text-xs uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {students?.map((student: Student) => (
                <tr
                  className={`transition-colors hover:bg-gray-50 ${student.archivedAt ? "opacity-60" : ""}`}
                  key={student.id}
                >
                  {/* Student Name */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          student.archivedAt
                            ? "bg-red-100 text-red-400"
                            : "bg-indigo-100 text-indigo-600"
                        }`}
                      >
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {student.firstName}{" "}
                          {student.middleName
                            ? `${student.middleName.charAt(0)}.`
                            : ""}{" "}
                          {student.lastName} {student.suffix || ""}
                          {student.archivedAt && (
                            <Badge className="ml-2 border-red-200 bg-red-100 py-0 text-[10px] text-red-700">
                              Archived
                            </Badge>
                          )}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Gender */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="text-gray-900 text-sm capitalize">
                      {student.gender || (
                        <span className="text-gray-300">—</span>
                      )}
                    </span>
                  </td>

                  {/* Grade Level */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="text-gray-900 text-sm">
                      {student.gradeLevel ? (
                        GRADE_LEVEL_LABELS[
                          student.gradeLevel as keyof typeof GRADE_LEVEL_LABELS
                        ] || student.gradeLevel
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </span>
                  </td>

                  {/* LRN */}
                  <td className="whitespace-nowrap px-6 py-4 font-mono text-gray-500 text-sm">
                    {student.lrn || <span className="text-gray-300">—</span>}
                  </td>

                  {/* Actions */}
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* View Profile */}
                      <Button
                        className="text-gray-500 hover:bg-indigo-50 hover:text-indigo-700"
                        onClick={() => setViewDetailsId(student.id)}
                        size="sm"
                        title="View Profile"
                        variant="ghost"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* Edit Profile */}
                      <Button
                        className="text-gray-500 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => setEditStudentId(student.id)}
                        size="sm"
                        title="Edit Student Details"
                        variant="ghost"
                      >
                        <UserCog className="h-4 w-4" />
                      </Button>

                      {/* Archive / Restore */}
                      {student.archivedAt ? (
                        <Button
                          className="text-green-600 hover:bg-green-50 hover:text-green-800"
                          disabled={isPending}
                          onClick={() => handleRestore(student.id)}
                          size="sm"
                          title="Restore Student"
                          variant="ghost"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          className="text-gray-500 hover:bg-red-50 hover:text-red-600"
                          disabled={isPending}
                          onClick={() => handleArchive(student.id)}
                          size="sm"
                          title="Archive Student"
                          variant="ghost"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {students?.length === 0 && (
                <tr>
                  <td
                    className="px-6 py-12 text-center text-gray-400"
                    colSpan={5}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <User className="h-8 w-8 text-gray-300" />
                      <p className="text-sm">No students found.</p>
                      {searchParam && (
                        <p className="text-xs">
                          Try clearing the search, or check the selected school
                          year.
                        </p>
                      )}
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

      <StudentDetailsDialog
        onClose={() => setViewDetailsId(null)}
        schoolYearId={syParam ? parseInt(syParam) : currentSyId}
        studentId={viewDetailsId}
      />

      <EditStudentDialog
        onClose={() => setEditStudentId(null)}
        onSuccess={mutate}
        schoolYearId={syParam ? parseInt(syParam) : currentSyId}
        studentId={editStudentId}
      />
    </div>
  );
}
