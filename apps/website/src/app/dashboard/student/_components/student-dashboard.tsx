"use client";

import { Button, Card } from "@school/ui";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface StudentData {
  enrollmentYears: { id: number; name: string; isActive: boolean }[];
  escNumber: string | null;
  firstName: string | null;
  gradeLevel: string | null;
  id: number;
  isEnrolled: boolean;
  isEsc: boolean | null;
  isSchoolYearActive: boolean;
  isShsVoucher: boolean | null;
  lastName: string | null;
  learnerType: string | null;
  lrn: string | null;
  middleName: string | null;
  schoolYearName: string;
  shsTrack: string | null;
  statusAccountingDone: boolean;
  statusAccountingNote: string | null;
  statusAccountingPaymentType: string;
  statusClinicDone: boolean;
  statusGuidanceDone: boolean;
  studentType: string;
  suffix: string | null;
}

interface StudentDashboardProps {
  initialData?: StudentData;
}

export function StudentDashboard({ initialData }: StudentDashboardProps) {
  const searchParams = useSearchParams();
  const syParam = searchParams.get("syId");

  const {
    data: swrResponse,
    isLoading,
    error,
  } = useSWR<{
    success: boolean;
    data: StudentData;
    error?: string;
  }>(`/api/student/status${syParam ? `?syId=${syParam}` : ""}`, fetcher, {
    fallbackData: initialData
      ? { success: true, data: initialData }
      : undefined,
    refreshInterval: 30000,
  });

  const student = swrResponse?.data;
  const apiError =
    swrResponse?.error || (error ? "Failed to load dashboard" : null);

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
      <div className="mx-auto max-w-4xl py-12">
        <Card className="border-yellow-200 bg-yellow-50 p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-yellow-600" />
          <h2 className="mb-2 font-bold text-2xl text-yellow-900">
            Account Setup Incomplete
          </h2>
          <p className="mx-auto max-w-md text-yellow-700">
            {apiError ||
              "Your student profile is being set up. Please contact the Registrar if this message persists."}
          </p>
        </Card>
      </div>
    );
  }

  const statusSteps = [
    {
      key: "clinic",
      title: "Medical Clearance",
      description: "Clinic staff review",
      icon: AlertCircle,
      completed: student.statusClinicDone,
    },
    {
      key: "guidance",
      title: "Guidance Clearance",
      description: "Guidance office review",
      icon: FileText,
      completed: student.statusGuidanceDone,
    },
    {
      key: "payment",
      title: "Payment Confirmation",
      description: "Accounting verification",
      icon: DollarSign,
      completed: student.statusAccountingDone,
    },
    {
      key: "approval",
      title: "Final Approval",
      description: "Registrar confirmation",
      icon: CheckCircle,
      completed: student.isEnrolled,
    },
    {
      key: "enrolled",
      title: "Enrolled",
      description: "Welcome to MPPSI!",
      icon: CheckCircle,
      completed: student.isEnrolled,
    },
  ];

  // Current step = first incomplete step
  const currentStepIndex = statusSteps.findIndex((s) => !s.completed);

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="font-bold text-3xl text-gray-900 tracking-tight">
          Welcome, {student.firstName}{" "}
          {student.middleName ? `${student.middleName} ` : ""}
          {student.lastName}
          {student.suffix ? ` ${student.suffix}` : ""}!
        </h1>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        {/* Left Column: Enrollment Journey */}
        <Card className="overflow-hidden gap-0 border-gray-100 shadow-sm lg:col-span-1">
          <div className="border-gray-50 border-b bg-gray-50/50 p-6">
            <h2 className="font-bold text-gray-900 text-lg">
              Enrollment Journey
            </h2>
            <p className="mt-0.5 text-gray-500 text-xs">
              Track your admission status
            </p>
          </div>

          <div className="space-y-6 p-6">
            {statusSteps.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = idx === currentStepIndex;

              return (
                <div className="group flex items-start" key={step.key}>
                  <div className="relative mr-4 flex flex-col items-center">
                    <div
                      className={`z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                        step.completed
                          ? "bg-green-500 text-white shadow-md shadow-green-100"
                          : isActive
                            ? "bg-indigo-600 text-white shadow-indigo-200 shadow-lg ring-4 ring-indigo-50"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>
                    {idx < statusSteps.length - 1 && (
                      <div
                        className={`absolute top-10 h-10 w-0.5 ${
                          step.completed ? "bg-green-500" : "bg-gray-100"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex flex-col">
                      <h3
                        className={`font-bold text-sm ${isActive ? "text-indigo-900" : "text-gray-700"}`}
                      >
                        {step.title}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-gray-500 leading-tight">
                        {step.description}
                      </p>

                      {isActive && (
                        <div className="mt-2 inline-flex w-fit items-center rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-0.5 font-medium text-[10px] text-indigo-700">
                          <Clock className="mr-1 h-3 w-3 animate-spin-slow" />
                          Processing
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right Column: Dynamic Content Area */}
        <div className="space-y-6 lg:col-span-2">
          {student.isEnrolled ? (
            <Card className="relative overflow-hidden flex min-h-[480px] flex-col items-center justify-center border-none bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-12 text-center text-white shadow-2xl shadow-indigo-100">
              {/* Decorative Background Elements */}
              <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="mb-8 rounded-3xl bg-white/20 p-6 backdrop-blur-xl ring-1 ring-white/30 shadow-inner">
                  <CheckCircle className="h-14 w-14 text-white" />
                </div>
                <h3 className="mb-4 font-bold text-5xl tracking-tight">
                  Enrollment Verified!
                </h3>
                <p className="mx-auto mb-10 max-w-md text-indigo-50 text-lg opacity-90 leading-relaxed">
                  Welcome back! Your academic portal is fully active for the{" "}
                  <span className="font-bold text-white">
                    {student.schoolYearName}
                  </span>{" "}
                  school year.
                </p>

                <Button
                  asChild
                  className="rounded-2xl bg-white px-8 py-7 text-lg font-bold text-indigo-600 shadow-xl transition-all hover:-translate-y-1 hover:bg-indigo-50 hover:shadow-2xl active:scale-95"
                  size="lg"
                >
                  <Link
                    className="flex items-center gap-2"
                    href="/dashboard/student/profile"
                  >
                    View My Profile & Info
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="flex min-h-[500px] flex-col items-center justify-center border-2 border-dashed border-gray-200 bg-gray-50/30 p-12 text-center shadow-inner">
              <div className="relative mb-8">
                <div className="absolute inset-0 animate-ping rounded-full bg-indigo-100" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-gray-100">
                  <Clock className="h-10 w-10 text-indigo-600" />
                </div>
              </div>
              <h2 className="mb-3 font-bold text-2xl text-gray-900 tracking-tight">
                Academic Portal Locked
              </h2>
              <p className="mx-auto max-w-md text-gray-600 leading-relaxed">
                Your portal access is currently restricted as we finalize your
                enrollment. Please complete all steps in your{" "}
                <span className="font-semibold text-indigo-600">
                  Enrollment Journey
                </span>{" "}
                to unlock your digital dashboard.
              </p>
              <div className="mt-8 flex items-center gap-2 text-indigo-500 text-sm font-medium">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Awaiting staff verification
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
