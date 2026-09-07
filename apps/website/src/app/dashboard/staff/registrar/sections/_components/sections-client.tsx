"use client";

import {
  archiveSection,
  createSection,
  restoreSection,
  updateSection,
} from "@school/api/sections/action";
import {
  Badge,
  Button,
  Input,
  Label,
  Pagination,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@school/ui";
import {
  Archive,
  Edit2,
  Eye,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { PortalPageControls } from "@/components/portal/portal-page-controls";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Section {
  adviserFirstName: string | null;
  adviserId: number | null;
  adviserName: string | null;
  gradeLevel: string;
  id: number;
  name: string;
  room: string | null;
  schoolYearId: number;
  schoolYearName: string | null;
  studentCount: number;
}

interface Staff {
  department: string | null;
  firstName: string;
  id: number;
  lastName: string;
}

interface SchoolYear {
  id: number;
  isActive: boolean;
  name: string;
}

interface SectionsClientProps {
  activeCount?: number;
  archivedCount?: number;
  initialActiveCount: number;
  initialArchivedCount: number;
  initialSections: Section[];
  initialTotalCount: number;
  schoolYears: SchoolYear[];
  staff: Staff[];
}

const GRADE_LEVELS = [
  { value: "nursery", label: "Nursery" },
  { value: "kinder_1", label: "Kindergarten 1" },
  { value: "kinder_2", label: "Kindergarten 2" },
  { value: "grade_1", label: "Grade 1" },
  { value: "grade_2", label: "Grade 2" },
  { value: "grade_3", label: "Grade 3" },
  { value: "grade_4", label: "Grade 4" },
  { value: "grade_5", label: "Grade 5" },
  { value: "grade_6", label: "Grade 6" },
  { value: "grade_7", label: "Grade 7" },
  { value: "grade_8", label: "Grade 8" },
  { value: "grade_9", label: "Grade 9" },
  { value: "grade_10", label: "Grade 10" },
  { value: "grade_11", label: "Grade 11" },
  { value: "grade_12", label: "Grade 12" },
];

export default function SectionsClient({
  initialSections,
  schoolYears,
  staff,
  initialTotalCount,
  initialActiveCount,
  initialArchivedCount,
}: SectionsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchParam = searchParams.get("search") || "";
  const statusParam =
    (searchParams.get("status") as "active" | "archived") || "active";
  const syParam = searchParams.get("sy") || "all";
  const pageParam = Number.parseInt(searchParams.get("page") || "1");

  const currentSyId =
    syParam !== "all"
      ? syParam
      : schoolYears.find((sy) => sy.isActive)?.id?.toString() ||
        schoolYears[0]?.id?.toString() ||
        "";

  const {
    data: swrData,
    isLoading,
    mutate,
  } = useSWR(
    `/api/registrar/sections?search=${searchParam}&status=${statusParam}&syId=${syParam === "all" ? "" : syParam}&page=${pageParam}`,
    fetcher,
    {
      fallbackData: {
        data: initialSections,
        totalCount: initialTotalCount,
        activeCount: initialActiveCount,
        archivedCount: initialArchivedCount,
      },
    },
  );

  const sectionsList = swrData?.data || [];
  const totalCount = swrData?.totalCount || 0;
  const activeCount = swrData?.activeCount || 0;
  const archivedCount = swrData?.archivedCount || 0;

  const [isPending, startTransition] = useTransition();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [search, setSearch] = useState(searchParam);
  const [filterStatus, setFilterStatus] = useState<"active" | "archived">(
    statusParam,
  );

  const updateSearchParams = useCallback(
    (query: string, status: string, syId: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (query) {
          params.set("search", query);
        } else {
          params.delete("search");
        }

        if (status === "archived") {
          params.set("status", "archived");
        } else {
          params.delete("status");
        }

        if (syId && syId !== "all") {
          params.set("sy", syId);
        } else {
          params.delete("sy");
        }

        params.delete("page"); // Reset to page 1

        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams],
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    if (typeof window !== "undefined") {
      clearTimeout(
        (window as unknown as Record<string, ReturnType<typeof setTimeout>>)
          .__sectionsSearchTimer,
      );
      (
        window as unknown as Record<string, ReturnType<typeof setTimeout>>
      ).__sectionsSearchTimer = setTimeout(() => {
        updateSearchParams(value, filterStatus, syParam);
      }, 300);
    }
  };

  const handleStatusChange = (status: "active" | "archived") => {
    setFilterStatus(status);
    updateSearchParams(search, status, syParam);
  };

  // Form State
  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [formSyId, setFormSyId] = useState("");
  const [adviserId, setAdviserId] = useState<string>("0");
  const [room, setRoom] = useState("");

  // Staff Picker State
  const [isStaffPickerOpen, setIsStaffPickerOpen] = useState(false);
  const [staffSearch, setStaffSearch] = useState("");
  const [showAllStaff, setShowAllStaff] = useState(false);

  const filteredStaff = staff.filter((s) => {
    const matchesSearch = `${s.firstName} ${s.lastName}`
      .toLowerCase()
      .includes(staffSearch.toLowerCase());
    const isFaculty = s.department === "faculty" || s.department === null;
    const matchesType = showAllStaff || isFaculty;
    return matchesSearch && matchesType;
  });

  const selectedAdviser = staff.find((s) => s.id.toString() === adviserId);

  function handleCreate() {
    startTransition(async () => {
      const res = await createSection({
        name,
        gradeLevel: gradeLevel as
          | "nursery"
          | "kinder_1"
          | "kinder_2"
          | "grade_1"
          | "grade_2"
          | "grade_3"
          | "grade_4"
          | "grade_5"
          | "grade_6"
          | "grade_7"
          | "grade_8"
          | "grade_9"
          | "grade_10"
          | "grade_11"
          | "grade_12",
        schoolYearId: Number.parseInt(formSyId, 10),
        adviserId:
          adviserId && adviserId !== "0"
            ? Number.parseInt(adviserId, 10)
            : undefined,
        room: room || undefined,
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Section created");
        setIsCreateOpen(false);
        resetForm();
        mutate();
      }
    });
  }

  function handleUpdate() {
    if (!editingSection) {
      return;
    }
    startTransition(async () => {
      const res = await updateSection(editingSection.id, {
        name,
        gradeLevel: gradeLevel as
          | "nursery"
          | "kinder_1"
          | "kinder_2"
          | "grade_1"
          | "grade_2"
          | "grade_3"
          | "grade_4"
          | "grade_5"
          | "grade_6"
          | "grade_7"
          | "grade_8"
          | "grade_9"
          | "grade_10"
          | "grade_11"
          | "grade_12",
        schoolYearId: Number.parseInt(formSyId, 10),
        adviserId:
          adviserId && adviserId !== "0"
            ? Number.parseInt(adviserId, 10)
            : undefined,
        room: room || undefined,
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Section updated");
        setIsCreateOpen(false);
        setEditingSection(null);
        resetForm();
        mutate();
      }
    });
  }

  function handleArchive(id: number) {
    startTransition(async () => {
      const res = await archiveSection(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Section archived");
        mutate();
      }
    });
  }

  function handleRestore(id: number) {
    startTransition(async () => {
      const res = await restoreSection(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Section restored");
        mutate();
      }
    });
  }

  function resetForm() {
    setName("");
    setGradeLevel("");
    setFormSyId(currentSyId);
    setAdviserId("0");
    setRoom("");
  }

  function handleEdit(section: Section) {
    setEditingSection(section);
    setName(section.name);
    setGradeLevel(section.gradeLevel);
    setFormSyId(section.schoolYearId.toString());
    setAdviserId(section.adviserId?.toString() || "0");
    setRoom(section.room || "");
    setIsCreateOpen(true);
  }

  function handleCreateOpen() {
    setEditingSection(null);
    resetForm();
    setIsCreateOpen(true);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSection) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-bold text-2xl text-gray-800">Class Builder</h2>
        <p className="mt-1 text-gray-500 text-sm">
          Manage class sections and assignments
        </p>
      </div>

      {/* Standardized Controls */}
      <PortalPageControls
        primaryAction={{
          label: "New Section",
          onClick: handleCreateOpen,
          icon: Plus,
        }}
        schoolYear={{
          data: schoolYears,
          selectedId:
            syParam !== "all" ? Number.parseInt(syParam, 10) : undefined,
        }}
        search={{
          value: search,
          onChange: handleSearch,
          placeholder: "Search by section name...",
        }}
        status={{
          value: filterStatus,
          onChange: handleStatusChange,
          activeCount,
          archivedCount,
        }}
      />

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
                  Section Info
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  Students Enrolled
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  Adviser
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  School Year
                </th>
                <th className="px-6 py-3 text-right font-medium text-gray-500 text-xs uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sectionsList?.map((section: Section) => (
                <tr className="hover:bg-gray-50" key={section.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {section.name}
                        </span>
                        {section.room && (
                          <Badge
                            className="border-blue-100 bg-blue-50 font-normal text-blue-700 text-xs hover:bg-blue-100"
                            variant="secondary"
                          >
                            Room {section.room}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex items-center space-x-2 text-gray-500 text-xs">
                        <Badge
                          className="h-5 bg-gray-50 py-0 text-xs"
                          variant="outline"
                        >
                          {GRADE_LEVELS.find(
                            (g) => g.value === section.gradeLevel,
                          )?.label || section.gradeLevel}
                        </Badge>
                      </div>
                    </div>
                  </td>
                  {/* Capacity Link */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link
                      className="flex items-center gap-1.5 text-indigo-600 transition-colors hover:text-indigo-800"
                      href={`/dashboard/staff/registrar/sections/${section.id}`}
                    >
                      <Users className="h-4 w-4" />
                      <span className="font-medium text-sm hover:underline">
                        {section.studentCount || 0} enrolled
                      </span>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {section.adviserId ? (
                      <div className="flex items-center">
                        <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 text-xs">
                          {section.adviserFirstName?.[0]}
                        </div>
                        <span className="text-gray-700 text-sm">
                          {section.adviserFirstName} {section.adviserName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm italic">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-500 text-sm">
                    {section.schoolYearName}
                  </td>
                  <td className="space-x-2 whitespace-nowrap px-6 py-4 text-right font-medium text-sm">
                    <Button
                      className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-900"
                      onClick={() =>
                        router.push(
                          `/dashboard/staff/registrar/sections/${section.id}`,
                        )
                      }
                      size="sm"
                      title="View Details"
                      variant="ghost"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      className="text-blue-600 hover:bg-blue-50 hover:text-blue-900"
                      onClick={() => handleEdit(section)}
                      size="sm"
                      title="Edit Section"
                      variant="ghost"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {filterStatus === "archived" ? (
                      <Button
                        className="text-green-600 hover:bg-green-50 hover:text-green-900"
                        disabled={isPending}
                        onClick={() => {
                          if (confirm("Restore this section?")) {
                            handleRestore(section.id);
                          }
                        }}
                        size="sm"
                        title="Restore Section"
                        variant="ghost"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        className="text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                        disabled={isPending}
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to archive this section?",
                            )
                          ) {
                            handleArchive(section.id);
                          }
                        }}
                        size="sm"
                        title="Archive Section"
                        variant="ghost"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {sectionsList?.length === 0 && (
                <tr>
                  <td
                    className="px-6 py-8 text-center text-gray-500"
                    colSpan={4}
                  >
                    No sections found. Try adjusting your search or filter.
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

      {/* Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-6">
              <h3 className="font-semibold text-gray-900 text-lg">
                {editingSection ? "Edit Section" : "New Section"}
              </h3>
              <button onClick={() => setIsCreateOpen(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <form className="space-y-4 p-6" onSubmit={handleSubmit}>
              <div>
                <Label>Section Name</Label>
                <Input
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apple (for Grade 1 - Apple)"
                  required
                  value={name}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Grade Level</Label>
                  <Select
                    onValueChange={setGradeLevel}
                    required
                    value={gradeLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_LEVELS.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>School Year</Label>
                  <div className="flex h-10 w-full cursor-not-allowed items-center rounded-md border border-input bg-gray-50 px-3 py-2 font-medium text-gray-900 text-sm">
                    {schoolYears.find((sy) => sy.id.toString() === formSyId)
                      ?.name || "N/A"}
                  </div>
                </div>
              </div>

              <div>
                <Label>Class Adviser</Label>
                <div
                  className="mt-1 flex w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors hover:bg-gray-50"
                  onClick={() => setIsStaffPickerOpen(true)}
                >
                  {selectedAdviser ? (
                    <div className="flex items-center">
                      <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 font-bold text-[10px] text-indigo-700">
                        {selectedAdviser.firstName[0]}
                      </div>
                      <span className="font-medium text-gray-900">
                        {selectedAdviser.firstName} {selectedAdviser.lastName}
                      </span>
                      <Badge
                        className="ml-2 h-4 bg-gray-50 py-0 text-[10px] capitalize"
                        variant="outline"
                      >
                        {selectedAdviser.department || "faculty"}
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-gray-500">
                      Assign Adviser (Optional)
                    </span>
                  )}
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                {adviserId !== "0" && (
                  <button
                    className="mt-1 px-0 font-medium text-[10px] text-red-500 underline hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAdviserId("0");
                    }}
                    type="button"
                  >
                    Clear assignment
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Room Number/Name</Label>
                  <Input
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. Room 101"
                    value={room}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  onClick={() => setIsCreateOpen(false)}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button disabled={isPending} type="submit">
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Picker Modal */}
      {isStaffPickerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="fade-in zoom-in w-full max-w-md animate-in overflow-hidden rounded-lg bg-white shadow-2xl duration-200">
            <div className="flex items-center justify-between border-b bg-gray-50 p-4">
              <h3 className="font-semibold text-gray-900">Select Adviser</h3>
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
                      className={`group flex w-full items-center p-3 text-left transition-colors hover:bg-indigo-50 ${adviserId === s.id.toString() ? "bg-indigo-50" : ""}`}
                      key={s.id}
                      onClick={() => {
                        setAdviserId(s.id.toString());
                        setIsStaffPickerOpen(false);
                      }}
                    >
                      <div
                        className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs transition-colors ${
                          adviserId === s.id.toString()
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
    </div>
  );
}
