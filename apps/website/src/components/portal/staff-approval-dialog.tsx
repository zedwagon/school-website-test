"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@school/ui";
import { CheckCircle2, Loader2, LucideIcon, User } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StudentInfo {
  firstName?: string | null;
  gender?: string | null;
  gradeLevel?: string;
  lastName?: string | null;
  middleName?: string | null;
  suffix?: string | null;
}

interface StaffApprovalDialogProps {
  children?: ReactNode; // Extra fields like Select or extra notes
  confirmIcon?: LucideIcon;
  confirmLabel?: string;
  isLoading?: boolean;
  isOpen: boolean;
  maxWidth?: string;
  onConfirm?: () => void;
  onOpenChange: (open: boolean) => void;
  student: StudentInfo | null;
  title: string;
  variant?: "blue" | "emerald" | "indigo" | "violet";
}

const VARIANTS = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-100",
    button: "bg-blue-600 hover:bg-blue-700",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
    button: "bg-emerald-600 hover:bg-emerald-700",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-100",
    button: "bg-indigo-600 hover:bg-indigo-700",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-100",
    button: "bg-violet-600 hover:bg-violet-700",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
};

export function StaffApprovalDialog({
  isOpen,
  onOpenChange,
  title,
  student,
  isLoading,
  onConfirm,
  confirmLabel = "Approve",
  confirmIcon: ConfirmIcon = CheckCircle2,
  variant = "blue",
  children,
  maxWidth,
}: StaffApprovalDialogProps) {
  const styles = VARIANTS[variant];

  return (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <DialogContent
        className={cn(
          "flex max-h-[95vh] flex-col overflow-hidden p-0 sm:rounded-2xl",
          maxWidth || "max-w-md",
        )}
      >
        <DialogHeader className={cn("shrink-0 p-6 pb-4", styles.bg)}>
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5",
                styles.iconBg,
              )}
            >
              <ConfirmIcon className={cn("h-6 w-6", styles.iconColor)} />
            </div>
            <div>
              <DialogTitle className="text-xl tracking-tight">
                {title}
              </DialogTitle>
              <p className={cn("text-xs opacity-80 font-medium", styles.text)}>
                Enrollment Verification Step
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="space-y-6">
            {/* Student Profile Card */}
            {student && (
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-2.5 shadow-sm",
                  styles.border,
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900 text-sm">
                    {student.firstName}{" "}
                    {student.middleName
                      ? `${student.middleName.charAt(0)}. `
                      : ""}
                    {student.lastName}
                    {student.suffix ? ` ${student.suffix}` : ""}
                  </p>
                  <div className="flex items-center gap-2 text-gray-500 text-[10px]">
                    <span>Grade: {student.gradeLevel || "—"}</span>
                    {student.gender && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{student.gender}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Form Fields / Notes */}
            <div className="space-y-4">{children}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="shrink-0 border-t bg-gray-50/50 p-4">
          <div className="flex gap-3">
            <Button
              className="flex-1"
              disabled={isLoading}
              onClick={() => onOpenChange(false)}
              variant="outline"
            >
              Cancel
            </Button>
            {onConfirm && (
              <Button
                className={cn(
                  "flex-1 text-white shadow-lg shadow-black/5",
                  styles.button,
                )}
                disabled={isLoading}
                onClick={onConfirm}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ConfirmIcon className="mr-2 h-4 w-4" />
                    {confirmLabel}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
