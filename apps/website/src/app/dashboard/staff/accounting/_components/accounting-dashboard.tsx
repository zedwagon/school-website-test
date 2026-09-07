"use client";

import {
  editPaymentStatus,
  updatePaymentStatus,
} from "@school/api/accounting/action";
import { GRADE_LEVEL_LABELS } from "@school/api/constants";
import {
  Badge,
  Button,
  Card,
  Input,
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
  DollarSign,
  Eye,
  History,
  Loader2,
  Pencil,
  Receipt,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import useSWR from "swr";

import { StaffApprovalDialog } from "@/components/portal/staff-approval-dialog";
import { formatPH } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface PendingStudent {
  enrollmentFormId: number;
  firstName: string;
  gradeLevel: string;
  id: number;
  lastName: string;
  middleName: string | null;
  statusAccountingPaymentType: string;
  statusGuidanceFinishedAt: string | null;
  suffix: string | null;
}

interface ClearedStudent extends PendingStudent {
  approvedByFirstName: string | null;
  approvedByLastName: string | null;
  statusAccountingFinishedAt: string;
  statusAccountingNote: string | null;
  statusAccountingSiNumber: string | null;
}

interface AccountingDashboardProps {
  initialData?: PendingStudent[];
  initialTotalCount?: number;
}

export function AccountingDashboard({
  initialData,
  initialTotalCount,
}: AccountingDashboardProps) {
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
    `/api/accounting/pending-payments?search=${searchParam}&gradeLevel=${gradeLevelParam}`,
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
  const [paymentStatus, setPaymentStatus] = useState<
    "full_payment" | "down_payment" | "promissory_note"
  >("full_payment");
  const [notes, setNotes] = useState("");
  const [siNumber, setSiNumber] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [viewingHistory, setViewingHistory] = useState<ClearedStudent | null>(
    null,
  );

  const {
    data: clearedData,
    isLoading: isClearedLoading,
    mutate: mutateCleared,
  } = useSWR<{ data: ClearedStudent[]; totalCount: number }>(
    `/api/accounting/cleared-payments?search=${searchParam}&gradeLevel=${gradeLevelParam}`,
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
        __accountingSearchTimer: ReturnType<typeof setTimeout>;
      };
      clearTimeout(win.__accountingSearchTimer);
      win.__accountingSearchTimer = setTimeout(
        () => updateSearchParams(value, gradeLevelParam),
        300,
      );
    }
  };

  const handleGradeLevelChange = (value: string) => {
    updateSearchParams(search, value === "all" ? "" : value);
  };

  const handleUpdate = async () => {
    if (!selectedStudent) return;

    const targetId = selectedStudent.enrollmentFormId;
    const currentData = swrData;

    startTransition(async () => {
      try {
        await mutate(
          async () => {
            const result = await updatePaymentStatus(
              targetId,
              paymentStatus as
                | "full_payment"
                | "down_payment"
                | "promissory_note",
              notes || undefined,
              siNumber || undefined,
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

        toast.success("Payment status updated!");
        setSelectedStudent(null);
        setNotes("");
        setSiNumber("");
        setPaymentStatus("full_payment");
        mutateCleared();
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update payment",
        );
      }
    });
  };

  const handleSaveHistory = async () => {
    if (!selectedStudent) return;

    const targetId = selectedStudent.enrollmentFormId;

    startTransition(async () => {
      try {
        const result = await editPaymentStatus(
          targetId,
          paymentStatus as "full_payment" | "down_payment" | "promissory_note",
          notes || undefined,
          siNumber || undefined,
        );

        if (result.error) {
          throw new Error(result.error);
        }

        toast.success("Payment record updated!");
        setSelectedStudent(null);
        setNotes("");
        setSiNumber("");
        setPaymentStatus("full_payment");
        setIsEditingHistory(false);
        mutateCleared();
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update payment",
        );
      }
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-blue-600 p-8 text-white shadow-xl shadow-blue-200/50">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 transform">
          <DollarSign className="h-64 w-64 text-blue-500/20" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-2 backdrop-blur-md">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <h1 className="font-bold text-3xl tracking-tight">
              Accounting Dashboard
            </h1>
          </div>
          <p className="mt-2 max-w-xl text-blue-50 text-sm leading-relaxed">
            Track and confirm student tuition payments. Manage installment
            plans, verify official receipts, and ensure financial clearance for
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
                Search Payments
              </h3>
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Student name..."
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
                <SelectTrigger className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none">
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
            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm ring-1 ring-blue-100/50">
              <div className="absolute -top-4 -right-4">
                <Wallet className="h-16 w-16 text-blue-100/50" />
              </div>
              <p className="text-blue-700 text-xs font-bold uppercase tracking-wider">
                Pending Confirmation
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-4xl font-bold text-gray-900">
                  {totalPending}
                </p>
                <p className="text-gray-500 text-xs font-medium">Records</p>
              </div>
            </Card>

            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm ring-1 ring-emerald-100/50">
              <div className="absolute -top-4 -right-4">
                <Receipt className="h-16 w-16 text-emerald-100/50" />
              </div>
              <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider">
                Confirmed Today
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
            <TabsList className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-100/80 p-1 backdrop-blur-sm">
              <TabsTrigger
                className="rounded-lg px-6 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                value="pending"
              >
                Awaiting Payment
              </TabsTrigger>
              <TabsTrigger
                className="rounded-lg px-6 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                value="history"
              >
                Payment History
              </TabsTrigger>
            </TabsList>

            <TabsContent
              className="m-0 focus-visible:outline-none"
              value="pending"
            >
              <div
                className="grid grid-cols-1 gap-4"
                style={{
                  opacity: isPending || isLoading ? 0.6 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {isLoading && pendingStudents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white py-24 shadow-sm">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    <p className="mt-4 font-medium text-gray-500">
                      Syncing payments...
                    </p>
                  </div>
                ) : pendingStudents.length > 0 ? (
                  pendingStudents.map((student) => (
                    <Card
                      className="group overflow-hidden border-gray-100 bg-white p-0 shadow-sm transition-all hover:shadow-md hover:ring-1 hover:ring-blue-500/20"
                      key={student.id}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5">
                        <div className="flex items-start gap-4">
                          <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                            <Wallet className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                              {student.firstName}{" "}
                              {student.middleName
                                ? `${student.middleName.charAt(0)}. `
                                : ""}
                              {student.lastName}
                              {student.suffix ? ` ${student.suffix}` : ""}
                            </h3>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                              <Badge
                                className="bg-gray-100 text-gray-600 hover:bg-gray-200"
                                variant="secondary"
                              >
                                {GRADE_LEVEL_LABELS[
                                  student.gradeLevel as keyof typeof GRADE_LEVEL_LABELS
                                ] || student.gradeLevel}
                              </Badge>
                              <span className="h-1 w-1 rounded-full bg-gray-300" />
                              <Badge
                                className="bg-blue-50 text-blue-600 border-blue-100 font-bold uppercase text-[10px]"
                                variant="outline"
                              >
                                {student.statusAccountingPaymentType ===
                                "pending"
                                  ? "Payment Required"
                                  : student.statusAccountingPaymentType.replace(
                                      "_",
                                      " ",
                                    )}
                              </Badge>
                            </div>
                            <p className="mt-2 text-[10px] font-medium text-gray-400">
                              Guidance cleared:{" "}
                              {student.statusGuidanceFinishedAt
                                ? formatPH(student.statusGuidanceFinishedAt)
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex shrink-0 sm:mt-0">
                          <Button
                            className="w-full rounded-xl bg-blue-600 font-semibold shadow-lg shadow-blue-200/50 hover:bg-blue-700 hover:shadow-blue-300/50 sm:w-auto"
                            disabled={isPending}
                            onClick={() => setSelectedStudent(student)}
                          >
                            <Receipt className="mr-2 h-4 w-4" />
                            Update Status
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white py-24 text-center shadow-sm">
                    <div className="rounded-full bg-gray-50 p-4">
                      <DollarSign className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="mt-4 font-bold text-gray-900 text-lg">
                      No Pending Payments
                    </h3>
                    <p className="mt-1 max-w-xs text-gray-500 text-sm">
                      {searchParam
                        ? `No students found matching "${searchParam}" in current payments.`
                        : "Excellent! All submitted payments have been verified and confirmed."}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent
              className="m-0 focus-visible:outline-none"
              value="history"
            >
              <div
                className="grid grid-cols-1 gap-4"
                style={{
                  opacity: isClearedLoading ? 0.6 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {isClearedLoading && clearedStudents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white py-24 shadow-sm">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    <p className="mt-4 font-medium text-gray-500">
                      Loading payment logs...
                    </p>
                  </div>
                ) : clearedStudents.length > 0 ? (
                  clearedStudents.map((student) => (
                    <Card
                      className="group overflow-hidden border-gray-100 bg-white p-0 shadow-sm transition-all hover:shadow-md"
                      key={student.id}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5">
                        <div className="flex items-start gap-4">
                          <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-blue-600 group-hover:bg-blue-50">
                            <ShieldCheck className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {student.firstName}{" "}
                              {student.middleName
                                ? `${student.middleName.charAt(0)}. `
                                : ""}
                              {student.lastName}
                              {student.suffix ? ` ${student.suffix}` : ""}
                            </h3>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                              <Badge
                                className="bg-gray-50 text-gray-500"
                                variant="secondary"
                              >
                                {GRADE_LEVEL_LABELS[
                                  student.gradeLevel as keyof typeof GRADE_LEVEL_LABELS
                                ] || student.gradeLevel}
                              </Badge>
                              <span className="h-1 w-1 rounded-full bg-gray-300" />
                              <span className="flex items-center gap-1.5 text-blue-600 font-bold">
                                <Receipt className="h-3.5 w-3.5" />
                                Confirmed{" "}
                                {formatPH(student.statusAccountingFinishedAt)}
                              </span>
                            </div>
                            {student.approvedByFirstName && (
                              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                Staff: {student.approvedByFirstName}{" "}
                                {student.approvedByLastName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 flex shrink-0 sm:mt-0 gap-2">
                          <Button
                            className="w-full rounded-xl border-blue-100 text-blue-700 shadow-sm hover:bg-blue-50 sm:w-auto"
                            onClick={() => setViewingHistory(student)}
                            variant="outline"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Records
                          </Button>
                          <Button
                            className="w-full rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 sm:w-auto"
                            onClick={() => {
                              const pendingStudent: PendingStudent = {
                                id: student.id,
                                enrollmentFormId: student.enrollmentFormId,
                                firstName: student.firstName,
                                middleName: student.middleName,
                                lastName: student.lastName,
                                suffix: student.suffix,
                                gradeLevel: student.gradeLevel,
                                statusAccountingPaymentType:
                                  student.statusAccountingPaymentType,
                                statusGuidanceFinishedAt: null,
                              };
                              setSelectedStudent(pendingStudent);
                              setPaymentStatus(
                                student.statusAccountingPaymentType as
                                  | "full_payment"
                                  | "down_payment"
                                  | "promissory_note",
                              );
                              setNotes(student.statusAccountingNote || "");
                              setSiNumber(
                                student.statusAccountingSiNumber || "",
                              );
                              setIsEditingHistory(true);
                            }}
                            variant="outline"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white py-24 text-center shadow-sm">
                    <div className="rounded-full bg-gray-50 p-4">
                      <History className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="mt-4 font-bold text-gray-900 text-lg">
                      No Logs Found
                    </h3>
                    <p className="mt-1 max-w-xs text-gray-500 text-sm">
                      Your payment confirmation history will be displayed here.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Payment Update Dialog */}
      <StaffApprovalDialog
        confirmLabel={isEditingHistory ? "Save Changes" : "Update Status"}
        isLoading={isPending}
        isOpen={!!selectedStudent}
        onConfirm={isEditingHistory ? handleSaveHistory : handleUpdate}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedStudent(null);
            setIsEditingHistory(false);
            setNotes("");
            setSiNumber("");
            setPaymentStatus("full_payment");
          }
        }}
        student={selectedStudent}
        title={
          isEditingHistory ? "Edit Payment Status" : "Update Payment Status"
        }
        variant="blue"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="paymentStatus">Payment Status *</Label>
            <Select
              disabled={isPending}
              onValueChange={(value) =>
                setPaymentStatus(value as "full_payment" | "down_payment")
              }
              value={paymentStatus}
            >
              <SelectTrigger className="mt-1.5 grayscale-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_payment">
                  Full Payment Received
                </SelectItem>
                <SelectItem value="down_payment">
                  Down Payment Received
                </SelectItem>
                <SelectItem value="promissory_note">Promissory Note</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentStatus !== "promissory_note" && (
            <div>
              <Label htmlFor="siNumber">SI Number</Label>
              <Input
                className="mt-1.5"
                disabled={isPending}
                id="siNumber"
                onChange={(e) => setSiNumber(e.target.value)}
                placeholder="Ex: 12345"
                value={siNumber}
              />
            </div>
          )}

          <div>
            <Label htmlFor="notes">Payment Notes</Label>
            <Textarea
              className="mt-1.5"
              disabled={isPending}
              id="notes"
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter remarks here..."
              rows={3}
              value={notes}
            />
          </div>
        </div>
      </StaffApprovalDialog>

      {/* History View Dialog */}
      <StaffApprovalDialog
        isOpen={!!viewingHistory}
        onOpenChange={(open) => !open && setViewingHistory(null)}
        student={viewingHistory}
        title="Payment Confirmation Record"
        variant="blue"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border bg-blue-50/30 p-3">
              <h4 className="font-semibold text-blue-900 text-[10px] uppercase tracking-wider">
                Payment Type
              </h4>
              <p className="mt-1 font-medium text-blue-800 text-sm capitalize">
                {(viewingHistory?.statusAccountingPaymentType || "N/A").replace(
                  "_",
                  " ",
                )}
              </p>
            </div>
            <div className="rounded-lg border bg-blue-50/30 p-3">
              <h4 className="font-semibold text-blue-900 text-[10px] uppercase tracking-wider">
                SI Number
              </h4>
              <p className="mt-1 font-mono font-medium text-blue-800 text-sm">
                {viewingHistory?.statusAccountingSiNumber || "N/A"}
              </p>
            </div>
          </div>
          <div className="rounded-lg border bg-blue-50/30 p-4">
            <h4 className="font-semibold text-blue-900 text-sm">
              Accounting Remarks
            </h4>
            <p className="mt-1 text-blue-800 text-sm">
              {viewingHistory?.statusAccountingNote || (
                <span className="italic text-gray-400">No notes provided.</span>
              )}
            </p>
          </div>
        </div>
      </StaffApprovalDialog>
    </div>
  );
}
