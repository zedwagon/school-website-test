"use client";

import {
  archiveSchoolYear,
  createSchoolYear,
  restoreSchoolYear,
  toggleActiveSchoolYear,
  updateSchoolYear,
} from "@school/api/school-years/action";
import {
  Badge,
  Button,
  DatePicker,
  Input,
  Label,
  Pagination,
} from "@school/ui";
import {
  Archive,
  ArrowRightLeft,
  CheckCircle,
  Edit2,
  Loader2,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { PortalPageControls } from "@/components/portal/portal-page-controls";
import RolloverDialog from "./rollover-dialog";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface SchoolYear {
  createdAt: string;
  endDate: string | null;
  id: number;
  isActive: boolean;
  name: string;
  startDate: string | null;
}

interface SchoolYearClientProps {
  initialActiveCount: number;
  initialArchivedCount: number;
  initialSchoolYears: SchoolYear[];
  initialTotalCount: number;
}

export default function SchoolYearClient({
  initialSchoolYears,
  initialTotalCount,
  initialActiveCount,
  initialArchivedCount,
}: SchoolYearClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchParam = searchParams.get("search") || "";
  const statusParam =
    (searchParams.get("status") as "active" | "archived") || "active";
  const pageParam = parseInt(searchParams.get("page") || "1");

  const {
    data: swrData,
    isLoading,
    mutate,
  } = useSWR(
    `/api/registrar/school-years?search=${searchParam}&status=${statusParam}&page=${pageParam}`,
    fetcher,
    {
      fallbackData: {
        data: initialSchoolYears,
        totalCount: initialTotalCount,
        activeCount: initialActiveCount,
        archivedCount: initialArchivedCount,
      },
    },
  );

  const schoolYears = swrData?.data || [];
  const totalCount = swrData?.totalCount || 0;
  const activeCount = swrData?.activeCount || 0;
  const archivedCount = swrData?.archivedCount || 0;

  const [search, setSearch] = useState(searchParam);
  const [filterStatus, setFilterStatus] = useState<"active" | "archived">(
    statusParam,
  );
  const [isPending, startTransition] = useTransition();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<SchoolYear | null>(null);
  const [isRolloverOpen, setIsRolloverOpen] = useState(false);
  const [rolloverTargetSyId, setRolloverTargetSyId] = useState<number | null>(
    null,
  );

  // Form State
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  function handleCreate() {
    startTransition(async () => {
      const res = await createSchoolYear({ name, startDate, endDate });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("School year created");
        setIsCreateOpen(false);
        resetForm();
        mutate();
      }
    });
  }

  function handleUpdate() {
    if (!editingYear) {
      return;
    }
    startTransition(async () => {
      const res = await updateSchoolYear(editingYear.id, {
        name,
        startDate,
        endDate,
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("School year updated");
        setIsCreateOpen(false);
        setEditingYear(null);
        resetForm();
        mutate();
      }
    });
  }

  function handleArchive(id: number) {
    startTransition(async () => {
      const res = await archiveSchoolYear(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("School year archived");
        mutate();
      }
    });
  }

  function handleRestore(id: number) {
    startTransition(async () => {
      const res = await restoreSchoolYear(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("School year restored");
        mutate();
      }
    });
  }

  function handleToggleActive(id: number) {
    startTransition(async () => {
      const res = await toggleActiveSchoolYear(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Active school year updated");
        mutate();
      }
    });
  }
  const updateSearchParams = useCallback(
    (query: string, status: string) => {
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

      params.delete("page"); // Reset to page 1

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    if (typeof window !== "undefined") {
      clearTimeout(
        (window as unknown as Record<string, ReturnType<typeof setTimeout>>)
          .__sySearchTimer,
      );
      (
        window as unknown as Record<string, ReturnType<typeof setTimeout>>
      ).__sySearchTimer = setTimeout(() => {
        updateSearchParams(value, filterStatus);
      }, 300);
    }
  };

  const handleStatusChange = (status: "active" | "archived") => {
    setFilterStatus(status);
    updateSearchParams(search, status);
  };
  function resetForm() {
    setName("");
    setStartDate("");
    setEndDate("");
  }

  function handleEdit(year: SchoolYear) {
    setEditingYear(year);
    setName(year.name);
    setStartDate(year.startDate || "");
    setEndDate(year.endDate || "");
    setIsCreateOpen(true);
  }

  function handleCreateOpen() {
    setEditingYear(null);
    resetForm();
    setIsCreateOpen(true);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingYear) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-bold text-2xl text-gray-800">School Years</h2>
        <p className="mt-1 text-gray-500 text-sm">
          Manage academic terms and registration status
        </p>
      </div>

      {/* Standardized Controls */}
      <PortalPageControls
        primaryAction={{
          label: "New School Year",
          onClick: handleCreateOpen,
          icon: Plus,
        }}
        search={{
          value: search,
          onChange: handleSearch,
          placeholder: "Search school years...",
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
                  Status
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-right font-medium text-gray-500 text-xs uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {schoolYears?.map((year: SchoolYear) => (
                <tr className="hover:bg-gray-50" key={year.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    {year.isActive ? (
                      <Badge className="border-green-200 bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="text-gray-500" variant="outline">
                        Inactive
                      </Badge>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                    {year.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-500 text-sm">
                    {year.startDate || "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-500 text-sm">
                    {year.endDate || "-"}
                  </td>
                  <td className="space-x-2 whitespace-nowrap px-6 py-4 text-right font-medium text-sm">
                    {!year.isActive && (
                      <Button
                        className="text-green-600 hover:bg-green-50 hover:text-green-900"
                        disabled={isPending}
                        onClick={() => handleToggleActive(year.id)}
                        size="sm"
                        title="Set as Active"
                        variant="ghost"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      className="text-blue-600 hover:bg-blue-50 hover:text-blue-900"
                      onClick={() => handleEdit(year)}
                      size="sm"
                      variant="ghost"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      className="text-orange-600 hover:bg-orange-50 hover:text-orange-900"
                      onClick={() => {
                        setRolloverTargetSyId(year.id);
                        setIsRolloverOpen(true);
                      }}
                      size="sm"
                      title="Import Data / Rollover"
                      variant="ghost"
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                    </Button>
                    {filterStatus === "archived" ? (
                      <Button
                        className="text-green-600 hover:bg-green-50 hover:text-green-900"
                        disabled={isPending}
                        onClick={() => {
                          if (confirm("Restore this school year?")) {
                            handleRestore(year.id);
                          }
                        }}
                        size="sm"
                        title="Restore School Year"
                        variant="ghost"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        className="text-gray-600 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-50"
                        disabled={year.isActive || isPending}
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to archive this school year?",
                            )
                          ) {
                            handleArchive(year.id);
                          }
                        }}
                        size="sm"
                        title="Archive School Year"
                        variant="ghost"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {schoolYears?.length === 0 && (
                <tr>
                  <td
                    className="px-6 py-8 text-center text-gray-500"
                    colSpan={5}
                  >
                    No school years found. Create one to get started.
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
          <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-6">
              <h3 className="font-semibold text-gray-900 text-lg">
                {editingYear ? "Edit School Year" : "New School Year"}
              </h3>
              <button onClick={() => setIsCreateOpen(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <form className="space-y-4 p-6" onSubmit={handleSubmit}>
              <div>
                <Label>School Year Name</Label>
                <Input
                  maxLength={15}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SY 2025-2026"
                  required
                  value={name}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <DatePicker onChange={setStartDate} value={startDate} />
                </div>
                <div>
                  <Label>End Date</Label>
                  <DatePicker onChange={setEndDate} value={endDate} />
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
      <RolloverDialog
        onOpenChange={setIsRolloverOpen}
        onSuccess={mutate}
        open={isRolloverOpen}
        schoolYears={schoolYears || []}
        targetSyId={rolloverTargetSyId}
      />
    </div>
  );
}
