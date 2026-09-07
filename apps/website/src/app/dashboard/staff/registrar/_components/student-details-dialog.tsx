"use client";

import { getStudentEnrollmentDetails } from "@school/api/enrollment/query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@school/ui";
import { Calendar, Loader2, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { formatPH } from "@/lib/utils";

interface StudentDetailsDialogProps {
  onClose: () => void;
  schoolYearId?: number;
  studentId: number | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StudentDetails = any;

export function StudentDetailsDialog({
  studentId,
  onClose,
  schoolYearId,
}: StudentDetailsDialogProps) {
  const [details, setDetails] = useState<StudentDetails>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!studentId) {
      setDetails(null);
      return;
    }
    setIsLoading(true);
    getStudentEnrollmentDetails(studentId, schoolYearId)
      .then((result) => {
        if (result.error) {
          setDetails(null);
        } else {
          setDetails(result.data);
        }
      })
      .finally(() => setIsLoading(false));
  }, [studentId, schoolYearId]);

  return (
    <Dialog onOpenChange={() => onClose()} open={!!studentId}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : details ? (
          (() => {
            const rel = details.guardianRelationship?.toLowerCase();
            const resolvedGuardianName =
              details.guardianName ||
              details.parentName ||
              (rel === "father"
                ? details.fatherName
                : rel === "mother"
                  ? details.motherMaidenName
                  : "—") ||
              "—";

            const profile = details.statusGuidanceProfile || {};
            const fallbackContact =
              rel === "father"
                ? profile.father?.contact
                : rel === "mother"
                  ? profile.mother?.contact
                  : profile.guardian?.contact;

            const resolvedGuardianContact =
              details.guardianContact ||
              details.parentContact ||
              fallbackContact ||
              "—";

            return (
              <div className="space-y-5 py-2">
                {/* Personal Information */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-500 text-sm uppercase tracking-wider">
                    <User className="h-4 w-4" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="col-span-2">
                      <p className="text-gray-500 text-xs">Full Name</p>
                      <p className="font-medium text-gray-900">
                        {details.firstName}{" "}
                        {details.middleName ? `${details.middleName} ` : ""}
                        {details.lastName}
                        {details.suffix ? ` ${details.suffix}` : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Gender</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {details.gender || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Birthdate</p>
                      <p className="flex items-center gap-1 font-medium text-gray-900">
                        <Calendar className="h-3.5 w-3.5" />
                        {details.birthdate
                          ? formatPH(details.birthdate, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">LRN</p>
                      <p className="font-medium font-mono text-gray-900">
                        {details.lrn || "—"}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Parent/Guardian Information */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-500 text-sm uppercase tracking-wider">
                    <Phone className="h-4 w-4" />
                    Parent / Guardian
                  </h3>
                  <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div>
                      <p className="text-gray-500 text-xs">Name</p>
                      <p className="font-medium text-gray-900">
                        {resolvedGuardianName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Contact Number</p>
                      <p className="flex items-center gap-1 font-medium text-gray-900">
                        <Phone className="h-3.5 w-3.5" />
                        {resolvedGuardianContact}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">
                        Father&apos;s Name
                      </p>
                      <p className="font-medium text-gray-900 capitalize">
                        {details.fatherName || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">
                        Mother&apos;s Maiden Name
                      </p>
                      <p className="font-medium text-gray-900 capitalize">
                        {details.motherMaidenName || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          <p className="py-8 text-center text-gray-500">
            No student details found
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
