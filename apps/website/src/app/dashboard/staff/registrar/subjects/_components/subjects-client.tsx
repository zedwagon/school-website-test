"use client";

import {
  archiveSubject,
  createSubject,
  restoreSubject,
  updateSubject,
} from "@school/api/subjects/action";
import { Badge, Button, Input, Label, Pagination, Textarea } from "@school/ui";
import {
  Archive,
  BookOpen,
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Subject {
  code: string | null;
  createdAt: string;
  description: string | null;
  id: number;
  name: string;
}

interface SubjectsClientProps {
  activeCount?: number;
  archivedCount?: number;
  initialActiveCount: number;
  initialArchivedCount: number;
  initialSubjects: Subject[];
  initialTotalCount: number;
}

export default function SubjectsClient({
  initialSubjects,
  initialTotalCount,
  initialActiveCount,
  initialArchivedCount,
}: SubjectsClientProps) {
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
    `/api/registrar/subjects?search=${searchParam}&status=${statusParam}&page=${pageParam}`,
    fetcher,
    {
      fallbackData: {
        data: initialSubjects,
        totalCount: initialTotalCount,
        activeCount: initialActiveCount,
        archivedCount: initialArchivedCount,
      },
    },
  );

  const subjectsList = swrData?.data || [];
  const totalCount = swrData?.totalCount || 0;
  const activeCount = swrData?.activeCount || 0;
  const archivedCount = swrData?.archivedCount || 0;

  const [isPending, startTransition] = useTransition();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [search, setSearch] = useState(searchParam);
  const [filterStatus, setFilterStatus] = useState<"active" | "archived">(
    statusParam,
  );

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  // URL param update with debounce
  const updateSearchParam = useCallback(
    (value: string, status: string) => {
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
          .__subjectSearchTimer,
      );
      (
        window as unknown as Record<string, ReturnType<typeof setTimeout>>
      ).__subjectSearchTimer = setTimeout(() => {
        updateSearchParam(value, filterStatus);
      }, 300);
    }
  };

  const handleStatusChange = (status: "active" | "archived") => {
    setFilterStatus(status);
    updateSearchParam(search, status);
  };

  function handleCreate() {
    startTransition(async () => {
      const res = await createSubject({ name, code, description });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Subject created");
        setIsCreateOpen(false);
        resetForm();
        mutate();
      }
    });
  }

  function handleUpdate() {
    if (!editingSubject) {
      return;
    }
    startTransition(async () => {
      const res = await updateSubject(editingSubject.id, {
        name,
        code,
        description,
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Subject updated");
        setIsCreateOpen(false);
        setEditingSubject(null);
        resetForm();
        mutate();
      }
    });
  }

  function handleArchive(id: number) {
    startTransition(async () => {
      const res = await archiveSubject(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Subject archived");
        mutate();
      }
    });
  }

  function handleRestore(id: number) {
    startTransition(async () => {
      const res = await restoreSubject(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Subject restored");
        mutate();
      }
    });
  }

  function resetForm() {
    setName("");
    setCode("");
    setDescription("");
  }

  function handleEdit(subject: Subject) {
    setEditingSubject(subject);
    setName(subject.name);
    setCode(subject.code || "");
    setDescription(subject.description || "");
    setIsCreateOpen(true);
  }

  function handleCreateOpen() {
    setEditingSubject(null);
    resetForm();
    setIsCreateOpen(true);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-bold text-2xl text-gray-800">Subjects</h2>
        <p className="mt-1 text-gray-500 text-sm">
          Manage academic subject catalog
        </p>
      </div>

      {/* Standardized Controls */}
      <PortalPageControls
        primaryAction={{
          label: "Add Subject",
          onClick: handleCreateOpen,
          icon: Plus,
        }}
        search={{
          value: search,
          onChange: handleSearch,
          placeholder: "Search subjects...",
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
                  Code
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right font-medium text-gray-500 text-xs uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {subjectsList?.map((subject: Subject) => (
                <tr className="hover:bg-gray-50" key={subject.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    {subject.code ? (
                      <Badge
                        className="font-mono text-gray-700"
                        variant="outline"
                      >
                        {subject.code}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-xs italic">
                        No Code
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center font-medium text-gray-900">
                      <BookOpen className="mr-2 h-4 w-4 flex-shrink-0 text-indigo-500" />
                      {subject.name}
                    </div>
                  </td>
                  <td className="max-w-xs truncate whitespace-nowrap px-6 py-4 text-gray-500 text-sm">
                    {subject.description || "-"}
                  </td>
                  <td className="space-x-2 whitespace-nowrap px-6 py-4 text-right font-medium text-sm">
                    <Button
                      className="text-blue-600 hover:bg-blue-50 hover:text-blue-900"
                      onClick={() => handleEdit(subject)}
                      size="sm"
                      variant="ghost"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {filterStatus === "archived" ? (
                      <Button
                        className="text-green-600 hover:bg-green-50 hover:text-green-900"
                        onClick={() => {
                          if (confirm("Restore this subject?")) {
                            handleRestore(subject.id);
                          }
                        }}
                        size="sm"
                        title="Restore Subject"
                        variant="ghost"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        className="text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to archive this subject?",
                            )
                          ) {
                            handleArchive(subject.id);
                          }
                        }}
                        size="sm"
                        title="Archive Subject"
                        variant="ghost"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {subjectsList?.length === 0 && (
                <tr>
                  <td
                    className="px-6 py-8 text-center text-gray-500"
                    colSpan={4}
                  >
                    No subjects found.
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
                {editingSubject ? "Edit Subject" : "New Subject"}
              </h3>
              <button onClick={() => setIsCreateOpen(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <form className="space-y-4 p-6" onSubmit={handleSubmit}>
              <div>
                <Label>Subject Name</Label>
                <Input
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mathematics 101"
                  required
                  value={name}
                />
              </div>
              <div>
                <Label>Subject Code (Optional)</Label>
                <Input
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. MATH101"
                  value={code}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the subject..."
                  value={description}
                />
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
    </div>
  );
}
