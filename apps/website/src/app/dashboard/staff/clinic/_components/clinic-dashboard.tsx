"use client";

import { approvePhysical, updatePhysical } from "@school/api/clinic/action";
import { MEDICAL_HISTORY_QUESTIONS } from "@school/api/clinic/constants";
import { GRADE_LEVEL_LABELS } from "@school/api/constants";
import {
  Badge,
  Button,
  Card,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@school/ui";
import {
  AlertCircle,
  ClipboardList,
  Eye,
  History,
  Loader2,
  Pencil,
  Printer,
  Search,
  ShieldCheck,
  Stethoscope,
  UserCheck,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { StaffApprovalDialog } from "@/components/portal/staff-approval-dialog";
import { formatPH } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface PendingStudent {
  birthdate: string;
  enrollmentFormId: number;
  firstName: string;
  gender: string;
  gradeLevel: string;
  id: number;
  lastName: string;
  middleName: string | null;
  submittedAt: string | null;
  suffix: string | null;
}

interface ClearedStudent extends PendingStudent {
  approvedByFirstName: string | null;
  approvedByLastName: string | null;
  statusClinicFinishedAt: string;
  statusClinicMedicalHistory: Record<
    number,
    { value: "yes" | "no"; remarks: string }
  >;
  statusClinicNote: string | null;
}

interface ClinicDashboardProps {
  initialData?: PendingStudent[];
  initialTotalCount?: number;
}

export function ClinicDashboard({
  initialData,
  initialTotalCount,
}: ClinicDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchParam = searchParams.get("search") || "";
  const gradeLevelParam = searchParams.get("gradeLevel") || "";

  const {
    data: swrData,
    isLoading,
    mutate,
  } = useSWR<{ data: PendingStudent[]; totalCount: number }>(
    `/api/clinic/pending-physicals?search=${searchParam}&gradeLevel=${gradeLevelParam}`,
    fetcher,
    {
      fallbackData: initialData
        ? {
            data: initialData,
            totalCount: initialTotalCount ?? initialData.length,
          }
        : undefined,
    },
  );

  const pendingStudents: PendingStudent[] = swrData?.data || [];
  const totalPending = swrData?.totalCount || 0;

  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParam);
  const [selectedStudent, setSelectedStudent] = useState<PendingStudent | null>(
    null,
  );
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [notes, setNotes] = useState("");
  const [historyAnswers, setHistoryAnswers] = useState<
    Record<number, { value: "yes" | "no"; remarks: string }>
  >(
    MEDICAL_HISTORY_QUESTIONS.reduce(
      (acc, q) => ({
        ...acc,
        [q.id]: { value: "no", remarks: "" },
      }),
      {},
    ),
  );

  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [viewingHistory, setViewingHistory] = useState<ClearedStudent | null>(
    null,
  );

  const {
    data: clearedData,
    isLoading: isClearedLoading,
    mutate: mutateCleared,
  } = useSWR<{ data: ClearedStudent[]; totalCount: number }>(
    `/api/clinic/cleared-physicals?search=${searchParam}&gradeLevel=${gradeLevelParam}`,
    fetcher,
  );

  const clearedStudents: ClearedStudent[] = clearedData?.data || [];
  const totalCleared = clearedData?.totalCount || 0;

  const updateSearchParams = useCallback(
    (query: string, gradeLevel: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }
      if (gradeLevel) {
        params.set("gradeLevel", gradeLevel);
      } else {
        params.delete("gradeLevel");
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams],
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (typeof window !== "undefined") {
      const win = window as unknown as {
        __clinicSearchTimer: ReturnType<typeof setTimeout>;
      };
      clearTimeout(win.__clinicSearchTimer);
      win.__clinicSearchTimer = setTimeout(
        () => updateSearchParams(value, gradeLevelParam),
        300,
      );
    }
  };

  const handleGradeLevelChange = (value: string) => {
    updateSearchParams(search, value === "all" ? "" : value);
  };

  const handleApprove = async () => {
    if (!selectedStudent) return;

    const targetId = selectedStudent.enrollmentFormId;
    const currentData = swrData;

    startTransition(async () => {
      try {
        await mutate(
          async () => {
            const result = await approvePhysical(
              targetId,
              notes || undefined,
              historyAnswers,
            );

            if (result.error) {
              throw new Error(result.error);
            }

            return {
              ...currentData,
              data: pendingStudents.filter(
                (s) => s.enrollmentFormId !== targetId,
              ),
              totalCount: totalPending - 1,
            } as { data: PendingStudent[]; totalCount: number };
          },
          {
            optimisticData: {
              ...currentData,
              data: pendingStudents.filter(
                (s) => s.enrollmentFormId !== targetId,
              ),
              totalCount: totalPending - 1,
            } as { data: PendingStudent[]; totalCount: number },
            rollbackOnError: true,
            revalidate: true,
          },
        );

        toast.success("Medical clearance approved!");
        setSelectedStudent(null);
        setNotes("");
        mutateCleared();
        // Reset history answers
        setHistoryAnswers(
          MEDICAL_HISTORY_QUESTIONS.reduce(
            (acc, q) => ({
              ...acc,
              [q.id]: { value: "no", remarks: "" },
            }),
            {},
          ),
        );
      } catch (error: unknown) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to approve clearance",
        );
      }
    });
  };

  const handleAnswerChange = (
    id: number,
    field: "value" | "remarks",
    value: string,
  ) => {
    setHistoryAnswers((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSaveHistory = async () => {
    if (!selectedStudent) return;

    const targetId = selectedStudent.enrollmentFormId;

    startTransition(async () => {
      try {
        const result = await updatePhysical(
          targetId,
          notes || undefined,
          historyAnswers,
        );

        if (result.error) {
          throw new Error(result.error);
        }

        toast.success("Medical record updated!");
        setSelectedStudent(null);
        setNotes("");
        setIsEditingHistory(false);
        mutateCleared();
        // Reset history answers
        setHistoryAnswers(
          MEDICAL_HISTORY_QUESTIONS.reduce(
            (acc, q) => ({
              ...acc,
              [q.id]: { value: "no", remarks: "" },
            }),
            {},
          ),
        );
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update record",
        );
      }
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-emerald-600 p-8 text-white shadow-xl shadow-emerald-200/50">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 transform">
          <Stethoscope className="h-64 w-64 text-emerald-500/20" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-2 backdrop-blur-md">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <h1 className="font-bold text-3xl tracking-tight">
              Clinic Dashboard
            </h1>
          </div>
          <p className="mt-2 max-w-xl text-emerald-50 text-sm leading-relaxed">
            Manage medical clearances and physical exam records. Review student
            health history and ensure all medical requirements are met for
            enrollment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left Column: Controls & Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
            <div>
              <h3 className="mb-2 font-semibold text-gray-900 text-sm">
                Search Students
              </h3>
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Name or LRN..."
                  type="text"
                  value={search}
                />
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-gray-900 text-sm">
                Grade Level
              </h3>
              <Select
                onValueChange={handleGradeLevelChange}
                value={gradeLevelParam || "all"}
              >
                <SelectTrigger className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none">
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
            </div>
          </div>

          <div className="space-y-4">
            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm ring-1 ring-emerald-100/50">
              <div className="absolute -top-4 -right-4">
                <ClipboardList className="h-16 w-16 text-emerald-100/50" />
              </div>
              <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider">
                Pending Clearance
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-4xl font-bold text-gray-900">
                  {totalPending}
                </p>
                <p className="text-gray-500 text-xs font-medium">Students</p>
              </div>
            </Card>

            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm ring-1 ring-blue-100/50">
              <div className="absolute -top-4 -right-4">
                <ShieldCheck className="h-16 w-16 text-blue-100/50" />
              </div>
              <p className="text-blue-700 text-xs font-bold uppercase tracking-wider">
                Cleared Records
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-4xl font-bold text-gray-900">
                  {totalCleared}
                </p>
                <p className="text-gray-500 text-xs font-medium">History</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Main Content */}
        <div className="lg:col-span-3">
          <Tabs
            className="space-y-6"
            onValueChange={(v) => setActiveTab(v as "pending" | "history")}
            value={activeTab}
          >
            <TabsList className="grid w-full max-w-[400px] grid-cols-2">
              <TabsTrigger className="gap-2" value="pending">
                <AlertCircle className="h-4 w-4" />
                Pending ({pendingStudents.length})
              </TabsTrigger>
              <TabsTrigger className="gap-2" value="history">
                <History className="h-4 w-4" />
                History ({clearedStudents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent className="space-y-6" value="pending">
              <Card
                className="p-6"
                style={{
                  opacity: isPending || isLoading ? 0.6 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                <h2 className="mb-4 font-semibold text-xl">
                  Students Pending Medical Clearance
                </h2>

                {isLoading && pendingStudents.length === 0 ? (
                  <div className="flex flex-col items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    <p className="mt-2 text-gray-500">
                      Loading student list...
                    </p>
                  </div>
                ) : pendingStudents.length > 0 ? (
                  <div className="space-y-3">
                    {pendingStudents.map((student) => (
                      <div
                        className="rounded-lg border p-4 transition-colors hover:bg-gray-50"
                        key={student.id}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {student.firstName}{" "}
                              {student.middleName
                                ? `${student.middleName.charAt(0)}. `
                                : ""}
                              {student.lastName}
                              {student.suffix ? ` ${student.suffix}` : ""}
                            </h3>
                            <div className="mt-1 flex items-center gap-4 text-gray-600 text-sm">
                              <span>
                                Grade:{" "}
                                {GRADE_LEVEL_LABELS[
                                  student.gradeLevel as keyof typeof GRADE_LEVEL_LABELS
                                ] || student.gradeLevel}
                              </span>
                              <span>•</span>
                              <span>Gender: {student.gender}</span>
                              <span>•</span>
                              <span>
                                Birthdate:{" "}
                                {formatPH(student.birthdate, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <p className="mt-1 text-gray-500 text-xs">
                              Submitted:{" "}
                              {student.submittedAt
                                ? formatPH(student.submittedAt)
                                : "N/A"}
                            </p>
                          </div>
                          <Button
                            className="bg-emerald-600 hover:bg-emerald-700"
                            disabled={isPending}
                            onClick={() => setSelectedStudent(student)}
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">
                      {searchParam
                        ? `No students matching "${searchParam}"`
                        : "No students pending medical clearance"}
                    </p>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent className="space-y-6" value="history">
              <Card
                className="p-6"
                style={{
                  opacity: isClearedLoading ? 0.6 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                <h2 className="mb-4 font-semibold text-xl">Approval History</h2>

                {isClearedLoading && clearedStudents.length === 0 ? (
                  <div className="flex flex-col items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    <p className="mt-2 text-gray-500">Loading history...</p>
                  </div>
                ) : clearedStudents.length > 0 ? (
                  <div className="space-y-3">
                    {clearedStudents.map((student) => (
                      <div
                        className="rounded-lg border p-4 transition-colors hover:bg-gray-50"
                        key={student.id}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {student.firstName}{" "}
                              {student.middleName
                                ? `${student.middleName.charAt(0)}. `
                                : ""}
                              {student.lastName}
                              {student.suffix ? ` ${student.suffix}` : ""}
                            </h3>
                            <div className="mt-1 flex items-center gap-4 text-gray-600 text-sm">
                              <span>
                                Grade:{" "}
                                {GRADE_LEVEL_LABELS[
                                  student.gradeLevel as keyof typeof GRADE_LEVEL_LABELS
                                ] || student.gradeLevel}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                                <UserCheck className="h-3.5 w-3.5" />
                                Approved{" "}
                                {formatPH(student.statusClinicFinishedAt)}
                              </span>
                            </div>
                            {student.approvedByFirstName && (
                              <p className="mt-1 text-gray-500 text-xs">
                                Approved by: {student.approvedByFirstName}{" "}
                                {student.approvedByLastName}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                              onClick={() => setViewingHistory(student)}
                              variant="outline"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Answers
                            </Button>
                            <Button
                              className="border-gray-200 text-gray-700 hover:bg-gray-50"
                              onClick={() => {
                                const pendingStudent: PendingStudent = {
                                  id: student.id,
                                  enrollmentFormId: student.enrollmentFormId,
                                  firstName: student.firstName,
                                  middleName: student.middleName,
                                  lastName: student.lastName,
                                  suffix: student.suffix,
                                  gradeLevel: student.gradeLevel,
                                  gender: student.gender,
                                  birthdate: student.birthdate,
                                  submittedAt: student.submittedAt,
                                };
                                setSelectedStudent(pendingStudent);
                                setNotes(student.statusClinicNote || "");
                                setHistoryAnswers(
                                  student.statusClinicMedicalHistory || {},
                                );
                                setIsEditingHistory(true);
                              }}
                              variant="outline"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                              onClick={() =>
                                window.open(
                                  `/print/clinic/${student.enrollmentFormId}`,
                                  "_blank",
                                )
                              }
                              variant="outline"
                            >
                              <Printer className="mr-2 h-4 w-4" />
                              Print
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <History className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">No clearance history found.</p>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Approval Dialog */}
      <StaffApprovalDialog
        confirmLabel={isEditingHistory ? "Save Changes" : "Approve Clearance"}
        isLoading={isPending}
        isOpen={!!selectedStudent}
        maxWidth="max-w-4xl"
        onConfirm={isEditingHistory ? handleSaveHistory : handleApprove}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedStudent(null);
            setIsEditingHistory(false);
            setNotes("");
            // Reset history answers
            setHistoryAnswers(
              MEDICAL_HISTORY_QUESTIONS.reduce(
                (acc, q) => ({
                  ...acc,
                  [q.id]: { value: "no", remarks: "" },
                }),
                {},
              ),
            );
          }
        }}
        student={selectedStudent}
        title={
          isEditingHistory
            ? "Edit Medical Clearance"
            : "Approve Medical Clearance"
        }
        variant="emerald"
      >
        <div className="space-y-4">
          <div className="rounded-lg border bg-gray-50/50">
            <div className="grid grid-cols-12 border-b bg-gray-100/50 p-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <div className="col-span-7">Medical Question</div>
              <div className="col-span-1 text-center">Yes</div>
              <div className="col-span-1 text-center">No</div>
              <div className="col-span-3">Remarks</div>
            </div>
            <div className="divide-y divide-gray-100">
              {(() => {
                let lastCategory = "";
                return MEDICAL_HISTORY_QUESTIONS.map((q) => {
                  const showCategory = q.category !== lastCategory;
                  lastCategory = q.category;
                  return (
                    <div key={q.id}>
                      {showCategory && (
                        <div className="bg-gray-50/80 px-3 py-1.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                          {q.category}
                        </div>
                      )}
                      <div className="group grid grid-cols-12 items-center p-3 text-sm transition-colors hover:bg-emerald-50/30">
                        <div className="col-span-7 pr-4">
                          <div className="flex gap-2">
                            <span className="font-bold text-gray-300 tabular-nums">
                              {q.id}.
                            </span>
                            <span className="text-gray-700 leading-snug">
                              {q.text}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-emerald-100/50">
                            <input
                              checked={historyAnswers[q.id]?.value === "yes"}
                              className="h-4 w-4 accent-emerald-600"
                              name={`q-${q.id}`}
                              onChange={() =>
                                handleAnswerChange(q.id, "value", "yes")
                              }
                              type="radio"
                              value="yes"
                            />
                          </label>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-gray-100">
                            <input
                              checked={historyAnswers[q.id]?.value === "no"}
                              className="h-4 w-4 accent-emerald-600"
                              name={`q-${q.id}`}
                              onChange={() =>
                                handleAnswerChange(q.id, "value", "no")
                              }
                              type="radio"
                              value="no"
                            />
                          </label>
                        </div>
                        <div className="col-span-3 pl-2">
                          <input
                            className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-xs transition-all placeholder:text-gray-300 focus:border-emerald-200 focus:bg-white focus:outline-none"
                            onChange={(e) =>
                              handleAnswerChange(
                                q.id,
                                "remarks",
                                e.target.value,
                              )
                            }
                            placeholder="Add explanation..."
                            type="text"
                            value={historyAnswers[q.id]?.remarks || ""}
                          />
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Final Medical Notes (Optional)</Label>
            <Textarea
              className="mt-1.5"
              disabled={isPending}
              id="notes"
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any overall medical notes or observations..."
              rows={3}
              value={notes}
            />
          </div>
        </div>
      </StaffApprovalDialog>

      {/* History View Dialog */}
      <StaffApprovalDialog
        isOpen={!!viewingHistory}
        maxWidth="max-w-4xl"
        onOpenChange={(open) => !open && setViewingHistory(null)}
        student={viewingHistory}
        title="Medical History Record"
        variant="emerald"
      >
        <div className="space-y-4">
          <div className="rounded-lg border bg-gray-50/50">
            <div className="grid grid-cols-12 border-b bg-gray-100/50 p-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <div className="col-span-7">Medical Question</div>
              <div className="col-span-2 text-center">Answer</div>
              <div className="col-span-3">Remarks</div>
            </div>
            <div className="divide-y divide-gray-100">
              {MEDICAL_HISTORY_QUESTIONS.map((q) => {
                const answer =
                  viewingHistory?.statusClinicMedicalHistory?.[q.id];
                return (
                  <div
                    className="group grid grid-cols-12 items-center p-3 text-sm"
                    key={q.id}
                  >
                    <div className="col-span-7 pr-4">
                      <div className="flex gap-2">
                        <span className="font-bold text-gray-300 tabular-nums">
                          {q.id}.
                        </span>
                        <span className="text-gray-700 leading-snug">
                          {q.text}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <Badge
                        className="uppercase"
                        variant={
                          answer?.value === "yes" ? "destructive" : "secondary"
                        }
                      >
                        {answer?.value || "N/A"}
                      </Badge>
                    </div>
                    <div className="col-span-3 pl-2 text-gray-600 text-xs">
                      {answer?.remarks || "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {viewingHistory?.statusClinicNote && (
            <div className="rounded-lg border bg-amber-50/30 p-4">
              <h4 className="font-semibold text-amber-900 text-sm">
                Staff Remarks
              </h4>
              <p className="mt-1 text-amber-800 text-sm">
                {viewingHistory.statusClinicNote}
              </p>
            </div>
          )}
        </div>
      </StaffApprovalDialog>
    </div>
  );
}
