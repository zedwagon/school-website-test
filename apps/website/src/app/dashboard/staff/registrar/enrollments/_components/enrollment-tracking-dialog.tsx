"use client";

import { GRADE_LEVEL_LABELS } from "@school/api/constants";
import { approveEnrollment } from "@school/api/enrollment/action";
import { revokeRegistrarApproval } from "@school/api/enrollment/clearance";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@school/ui";
import {
  Banknote,
  BookOpenCheck,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface TrackingStudent {
  email: string;
  firstName: string | null;
  gradeLevel: string | null;
  id: number;
  isEnrolled: boolean;
  lastName: string | null;
  lrn: string | null;
  middleName: string | null;
  statusAccountingApprovedByName?: string | null;
  statusAccountingDone: boolean | null;
  statusAccountingNote?: string | null;
  statusClinicApprovedByName?: string | null;
  statusClinicDone: boolean | null;
  statusClinicNote?: string | null;
  statusGuidanceApprovedByName?: string | null;
  statusGuidanceDone: boolean | null;
  statusGuidanceNote?: string | null;
  statusNote: string | null;
  studentId: number;
  studentType: string | null;
}

interface EnrollmentTrackingDialogProps {
  currentUserDepartment?: string;
  currentUserRole?: string;
  mutate?: () => void;
  onClose: () => void;
  student: TrackingStudent | null;
}

const STEPS = [
  {
    key: "statusClinicDone",
    label: "Clinic",
    icon: Stethoscope,
    color: "blue",
    noteKey: "statusClinicNote",
    approverNameKey: "statusClinicApprovedByName",
  },
  {
    key: "statusGuidanceDone",
    label: "Guidance",
    icon: BookOpenCheck,
    color: "purple",
    noteKey: "statusGuidanceNote",
    approverNameKey: "statusGuidanceApprovedByName",
  },
  {
    key: "statusAccountingDone",
    label: "Accounting",
    icon: Banknote,
    color: "yellow",
    noteKey: "statusAccountingNote",
    approverNameKey: "statusAccountingApprovedByName",
  },
] as const;

export function EnrollmentTrackingDialog({
  student,
  onClose,
  mutate,
  currentUserDepartment,
  currentUserRole,
}: EnrollmentTrackingDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");

  if (!student) {
    return null;
  }

  const flags: Record<string, boolean> = {
    statusClinicDone: !!student.statusClinicDone,
    statusGuidanceDone: !!student.statusGuidanceDone,
    statusAccountingDone: !!student.statusAccountingDone,
  };

  const isEnrolled = student.isEnrolled;
  const isTerminal = !!student.statusNote;

  // All 4 clearance flags are done
  const allClearancesDone =
    flags.statusClinicDone &&
    flags.statusGuidanceDone &&
    flags.statusAccountingDone;

  function handleAction(action: "approve" | "revoke", stepKey: string) {
    if (!student) {
      return;
    }

    startTransition(async () => {
      let res: { success?: boolean; error?: string };

      if (action === "approve") {
        switch (stepKey) {
          case "registrar":
            if (!confirm("Finalize and approve this enrollment?")) {
              return;
            }
            res = await approveEnrollment(student.id, notes);
            break;
          default:
            return;
        }
      } else {
        // revoke
        switch (stepKey) {
          case "registrar":
            if (!confirm("Revoke enrollment approval?")) {
              return;
            }
            res = await revokeRegistrarApproval(student.studentId);
            break;
          default:
            return;
        }
      }

      if (res.error) {
        toast.error(res.error);
      } else {
        const stepLabel = stepKey === "registrar" ? "Enrollment" : stepKey;
        if (action === "approve") {
          if (stepKey === "registrar") {
            toast.success("Student is now officially enrolled!");
          } else {
            toast.success(`${stepLabel} approved!`);
          }
        } else {
          toast.success(`${stepLabel} revoked.`);
        }
        mutate?.();
      }
    });
  }

  return (
    <Dialog onOpenChange={() => onClose()} open={!!student}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Enrollment Tracking</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
          {/* Student Info */}
          <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
            <p className="font-semibold text-gray-900 text-sm">
              {student.firstName}{" "}
              {student.middleName ? `${student.middleName} ` : ""}
              {student.lastName}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              {student.gradeLevel && (
                <Badge className="h-5 text-[11px]" variant="outline">
                  {GRADE_LEVEL_LABELS[
                    student.gradeLevel as keyof typeof GRADE_LEVEL_LABELS
                  ] ?? student.gradeLevel}
                </Badge>
              )}
              {student.lrn && (
                <span className="font-mono text-[11px] text-gray-400">
                  LRN: {student.lrn}
                </span>
              )}
            </div>
          </div>

          {/* Pipeline Steps */}
          <div className="space-y-1.5">
            {STEPS.map((step, i) => {
              const done = flags[step.key];
              const Icon = step.icon;

              const currentStep = flags.statusClinicDone
                ? flags.statusGuidanceDone
                  ? flags.statusAccountingDone
                    ? null
                    : "statusAccountingDone"
                  : "statusGuidanceDone"
                : "statusClinicDone";

              const isCurrent = step.key === currentStep;
              const note = step.noteKey
                ? student[step.noteKey as keyof TrackingStudent]
                : null;
              const approverName = step.approverNameKey
                ? student[step.approverNameKey as keyof TrackingStudent]
                : null;

              return (
                <div
                  className={`rounded-md border transition-all ${
                    done
                      ? "border-green-200 bg-green-50/70"
                      : isCurrent
                        ? "border-indigo-300 bg-white shadow-sm"
                        : "border-gray-100 bg-gray-50/50"
                  }`}
                  key={step.key}
                >
                  <div className="flex items-center gap-2.5 px-2.5 py-2">
                    {/* Step indicator */}
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] ${
                        done
                          ? "bg-green-500 text-white"
                          : isCurrent
                            ? "bg-indigo-100 text-indigo-600"
                            : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <span className="font-bold">{i + 1}</span>
                      )}
                    </div>

                    {/* Label */}
                    <div className="flex min-w-0 flex-1 items-center gap-1.5">
                      <Icon
                        className={`h-3.5 w-3.5 shrink-0 ${done ? "text-green-600" : isCurrent ? "text-indigo-600" : "text-gray-400"}`}
                      />
                      <span
                        className={`truncate font-medium text-sm ${done ? "text-green-800" : isCurrent ? "text-gray-900" : "text-gray-400"}`}
                      >
                        {step.label}
                      </span>
                    </div>

                    {/* Status + Actions */}
                    <div className="flex shrink-0 items-center gap-1.5">
                      {done && (
                        <div className="flex flex-col items-end">
                          <span className="font-medium text-[11px] text-green-600">
                            Done
                          </span>
                          {approverName && String(approverName).trim() && (
                            <span className="text-[9px] text-gray-400">
                              by {String(approverName).trim()}
                            </span>
                          )}
                        </div>
                      )}
                      {isCurrent && !isTerminal && (
                        <Badge className="h-5 border-indigo-200 bg-indigo-100 px-1.5 text-[10px] text-indigo-700">
                          Current
                        </Badge>
                      )}

                      {isCurrent && !isTerminal && !done && (
                        <span className="text-[11px] text-gray-400 italic">
                          Awaiting
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Note */}
                  {note && (
                    <div className="mx-2.5 mb-2 rounded border border-gray-100 bg-white/80 px-2 py-1 text-[11px] text-gray-600">
                      <span className="font-semibold text-gray-500">Note:</span>{" "}
                      {String(note)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Terminal / Enrolled / Final Approval */}
          {isTerminal ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-2.5 text-center">
              <p className="font-medium text-red-700 text-xs">
                This enrollment has been marked as {student.statusNote}.
              </p>
            </div>
          ) : isEnrolled ? (
            <div className="rounded-md border border-green-200 bg-green-50 p-2.5 text-center">
              <p className="font-medium text-green-700 text-xs">
                ✓ This student is fully enrolled.
              </p>
            </div>
          ) : allClearancesDone &&
            (currentUserDepartment === "registrar" ||
              currentUserRole === "admin") ? (
            <div className="flex flex-col items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-center">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h4 className="font-semibold text-emerald-900 text-sm">
                  Ready for Final Enrollment
                </h4>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                All clearance steps are complete.{" "}
                <strong>This action cannot be reversed.</strong>
              </p>
              <div className="w-full text-left">
                <label
                  className="font-medium text-[11px] text-emerald-800"
                  htmlFor="notes"
                >
                  Registrar Notes (Optional)
                </label>
                <textarea
                  className="mt-1 w-full rounded-md border border-emerald-200 p-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                  id="notes"
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this enrollment..."
                  rows={2}
                  value={notes}
                />
              </div>
              <Button
                className="h-9 w-full bg-emerald-600 font-medium text-sm text-white hover:bg-emerald-700"
                disabled={isPending}
                onClick={() => handleAction("approve", "registrar")}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                )}
                Confirm & Enroll Student
              </Button>
            </div>
          ) : allClearancesDone ? (
            <div className="flex flex-col items-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-center">
              <p className="font-medium text-gray-500 text-xs">
                All clearances complete. Awaiting final enrollment from
                Registrar.
              </p>
            </div>
          ) : null}
        </div>

        {/* Close */}
        <div className="flex justify-end">
          <Button onClick={onClose} size="sm" variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
