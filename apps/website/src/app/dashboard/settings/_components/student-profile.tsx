"use client";

import { Card } from "@school/ui";
import { AlertCircle, FileText, Loader2 } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface StudentData {
  address: string | null;
  birthdate: string | null;
  enrollmentYears: { id: number; name: string; isActive: boolean }[];
  escNumber: string | null;
  fatherName: string | null;
  firstName: string | null;
  gender: string | null;
  gradeLevel: string | null;
  guardianContact: string | null;
  guardianName: string | null;
  id: number;
  isEnrolled: boolean;
  isEsc: boolean | null;
  isSchoolYearActive: boolean;
  isShsVoucher: boolean | null;
  lastName: string | null;
  lastSchoolName: string | null;
  learnerType: string | null;
  lrn: string | null;
  middleName: string | null;
  motherMaidenName: string | null;
  schoolYearName: string;
  shsTrack: string | null;
  statusAccountingDone: boolean;
  statusClinicDone: boolean;
  statusGuidanceDone: boolean;
  studentType: string;
  suffix: string | null;
}

interface StudentProfileProps {
  initialData?: StudentData;
}

export function StudentProfile({ initialData }: StudentProfileProps) {
  const {
    data: swrResponse,
    isLoading,
    error,
  } = useSWR<{
    success: boolean;
    data: StudentData;
    error?: string;
  }>("/api/student/status", fetcher, {
    fallbackData: initialData
      ? { success: true, data: initialData }
      : undefined,
    refreshInterval: 30000,
  });

  const student = swrResponse?.data;
  const apiError =
    swrResponse?.error || (error ? "Failed to load profile" : null);

  // Loading State
  if (isLoading && !student) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Error / Not Found State
  if (apiError || !student) {
    return (
      <div className="p-8">
        <Card className="mx-auto max-w-4xl border-yellow-200 bg-yellow-50 p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-yellow-600" />
          <h2 className="mb-2 font-bold text-2xl text-yellow-900">
            Profile Not Found
          </h2>
          <p className="mx-auto max-w-md text-yellow-700">
            {apiError ||
              "We couldn't find your profile information. Please contact the Registrar."}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-6">
        {/* Personal Details Card */}
        <Card className="p-6 border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 border-gray-100 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-indigo-500" />
            Personal Details
          </h3>
          <dl className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-gray-500 font-medium">Full Name</dt>
              <dd className="col-span-2 text-gray-900 font-medium">
                {student.firstName}{" "}
                {student.middleName ? `${student.middleName} ` : ""}
                {student.lastName}
                {student.suffix ? ` ${student.suffix}` : ""}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-gray-500 font-medium">LRN</dt>
              <dd className="col-span-2 text-gray-900 font-mono text-xs mt-0.5 bg-gray-50 px-1 py-0.5 rounded w-fit border border-gray-100">
                {student.lrn || "Not Provided"}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-gray-500 font-medium">Gender</dt>
              <dd className="col-span-2 text-gray-900 capitalize">
                {student.gender || "Not Provided"}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-gray-500 font-medium">Birthdate</dt>
              <dd className="col-span-2 text-gray-900">
                {student.birthdate || "Not Provided"}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-gray-500 font-medium">Address</dt>
              <dd className="col-span-2 text-gray-900 leading-snug">
                {student.address || "Not Provided"}
              </dd>
            </div>
          </dl>
        </Card>

        {/* Family Information Card */}
        <Card className="p-6 border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 border-gray-100 flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-500" />
            Family & Contact Information
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <dt className="text-gray-500 font-medium mb-1">
                Guardian&apos;s Name
              </dt>
              <dd className="text-gray-900 font-medium bg-gray-50 p-2 rounded-md border border-gray-100 inline-block min-w-[200px]">
                {student.guardianName || "Not Provided"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 font-medium mb-1">Contact Number</dt>
              <dd className="text-gray-900 bg-gray-50 p-2 rounded-md border border-gray-100 inline-block min-w-[200px]">
                {student.guardianContact || "Not Provided"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 font-medium mb-1">
                Father&apos;s Name
              </dt>
              <dd className="text-gray-900 bg-gray-50 p-2 rounded-md border border-gray-100 inline-block min-w-[200px]">
                {student.fatherName || "Not Provided"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 font-medium mb-1">
                Mother&apos;s Maiden Name
              </dt>
              <dd className="text-gray-900 bg-gray-50 p-2 rounded-md border border-gray-100 inline-block min-w-[200px]">
                {student.motherMaidenName || "Not Provided"}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
