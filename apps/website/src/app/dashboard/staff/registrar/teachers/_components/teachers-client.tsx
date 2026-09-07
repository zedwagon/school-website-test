"use client";

import {
  archiveTeacher,
  restoreTeacher,
  updateTeacher,
} from "@school/api/faculty/action";
import { Badge, Button, Input, Label, Pagination } from "@school/ui";
import {
  Archive,
  Edit2,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  RotateCcw,
  X,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { PortalPageControls } from "@/components/portal/portal-page-controls";
import { CreateTeacherDialog } from "./create-teacher-dialog";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Teacher {
  archivedAt: string | null;
  createdAt: string;
  department: string | null;
  email: string;
  firstName: string | null;
  id: number;
  lastName: string | null;
  middleName: string | null;
  userId: number;
}

interface TeachersClientProps {
  initialActiveCount: number;
  initialArchivedCount: number;
  initialTeachers: Teacher[];
  initialTotalCount: number;
}

export default function TeachersClient({
  initialTeachers,
  initialTotalCount,
  initialActiveCount,
  initialArchivedCount,
}: TeachersClientProps) {
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
    `/api/registrar/teachers?search=${searchParam}&status=${statusParam}&page=${pageParam}`,
    fetcher,
    {
      fallbackData: {
        data: initialTeachers,
        totalCount: initialTotalCount,
        activeCount: initialActiveCount,
        archivedCount: initialArchivedCount,
      },
    },
  );

  const teachersList = swrData?.data || [];
  const totalCount = swrData?.totalCount || 0;
  const activeCount = swrData?.activeCount || 0;
  const archivedCount = swrData?.archivedCount || 0;

  const [isPending, startTransition] = useTransition();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState(searchParam);
  const [filterStatus, setFilterStatus] = useState<"active" | "archived">(
    statusParam,
  );
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form State for editing only
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // URL param update with debounce
  const updateSearchParams = useCallback(
    (query: string, status: string) => {
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
          .__teacherSearchTimer,
      );
      (
        window as unknown as Record<string, ReturnType<typeof setTimeout>>
      ).__teacherSearchTimer = setTimeout(() => {
        updateSearchParams(value, filterStatus);
      }, 300);
    }
  };

  const handleStatusChange = (status: "active" | "archived") => {
    setFilterStatus(status);
    updateSearchParams(search, status);
  };

  function handleUpdate() {
    if (!editingTeacher) {
      return;
    }
    startTransition(async () => {
      const res = await updateTeacher(editingTeacher.id, {
        firstName,
        middleName: middleName || undefined,
        lastName,
        email,
        password: password || undefined,
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Teacher updated");
        setIsCreateOpen(false);
        setEditingTeacher(null);
        resetForm();
        mutate();
      }
    });
  }

  function handleArchive(id: number) {
    startTransition(async () => {
      const res = await archiveTeacher(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Teacher archived");
        mutate();
      }
    });
  }

  function handleRestore(id: number) {
    startTransition(async () => {
      const res = await restoreTeacher(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Teacher restored");
        mutate();
      }
    });
  }

  function resetForm() {
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setEditingTeacher(null);
  }

  function handleEdit(teacher: Teacher) {
    setEditingTeacher(teacher);
    setFirstName(teacher.firstName || "");
    setMiddleName(teacher.middleName || "");
    setLastName(teacher.lastName || "");
    setEmail(teacher.email);
    setPassword("");
    setIsCreateOpen(true);
  }

  function generatePassword() {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  }

  function handleCreateOpen() {
    resetForm();
    setIsCreateOpen(true);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      handleUpdate();
    }
  };

  const isActive = (teacher: Teacher) => !teacher.archivedAt;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-bold text-2xl text-gray-800">Teacher Directory</h2>
        <p className="mt-1 text-gray-500 text-sm">
          Manage teaching staff members
        </p>
      </div>

      {/* Standardized Controls */}
      <PortalPageControls
        primaryAction={{
          label: "Add Teacher",
          onClick: handleCreateOpen,
          icon: Plus,
        }}
        search={{
          value: search,
          onChange: handleSearch,
          placeholder: "Search by name or email...",
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
                  Teacher
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right font-medium text-gray-500 text-xs uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {teachersList?.map((teacher: Teacher) => (
                <tr className="hover:bg-gray-50" key={teacher.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div
                        className={`mr-3 flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${isActive(teacher) ? "bg-indigo-600" : "bg-gray-400"}`}
                      >
                        {teacher.firstName?.[0] || "T"}
                      </div>
                      <div>
                        <div
                          className={`font-medium ${isActive(teacher) ? "text-gray-900" : "text-gray-400"}`}
                        >
                          {teacher.firstName}{" "}
                          {teacher.middleName ? `${teacher.middleName} ` : ""}
                          {teacher.lastName}
                        </div>
                        <div className="flex items-center text-gray-500 text-xs">
                          <Mail className="mr-1 h-3 w-3" /> {teacher.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {isActive(teacher) ? (
                      <Badge className="border-green-200 bg-green-100 text-green-800 hover:bg-green-100">
                        ACTIVE
                      </Badge>
                    ) : (
                      <Badge
                        className="border-red-200 bg-red-100 text-red-800 hover:bg-red-200"
                        variant="destructive"
                      >
                        ARCHIVED
                      </Badge>
                    )}
                  </td>
                  <td className="space-x-2 whitespace-nowrap px-6 py-4 text-right font-medium text-sm">
                    <Button
                      className="text-blue-600 hover:bg-blue-50 hover:text-blue-900"
                      onClick={() => handleEdit(teacher)}
                      size="sm"
                      variant="ghost"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {isActive(teacher) ? (
                      <Button
                        className="text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to archive this teacher?",
                            )
                          ) {
                            handleArchive(teacher.id);
                          }
                        }}
                        size="sm"
                        title="Archive Teacher"
                        variant="ghost"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        className="text-green-600 hover:bg-green-50 hover:text-green-900"
                        onClick={() => {
                          if (confirm("Restore this teacher?")) {
                            handleRestore(teacher.id);
                          }
                        }}
                        size="sm"
                        title="Restore Teacher"
                        variant="ghost"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {teachersList?.length === 0 && (
                <tr>
                  <td
                    className="px-6 py-8 text-center text-gray-500"
                    colSpan={3}
                  >
                    No teachers found.
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

      {/* Edit Teacher Modal */}
      {isCreateOpen && editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-6">
              <h3 className="font-semibold text-gray-900 text-lg">
                Edit Teacher
              </h3>
              <button onClick={() => setIsCreateOpen(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      value={firstName}
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      value={lastName}
                    />
                  </div>
                </div>

                <div>
                  <Label>Middle Name (Optional)</Label>
                  <Input
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="Optional"
                    value={middleName}
                  />
                </div>

                <div>
                  <Label>Email Address</Label>
                  <Input
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    type="email"
                    value={email}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Reset Password (Optional)</Label>
                  <div className="flex space-x-2">
                    <Input
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leave blank to keep current"
                      value={password}
                    />
                    <Button
                      onClick={generatePassword}
                      size="icon"
                      title="Generate Random"
                      type="button"
                      variant="outline"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
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
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Teacher Dialog */}
      <CreateTeacherDialog
        onOpenChange={setIsCreateOpen}
        onSuccess={() => mutate()}
        open={isCreateOpen && !editingTeacher}
      />
    </div>
  );
}
