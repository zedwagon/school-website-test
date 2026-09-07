"use client";

import { GRADE_LEVEL_LABELS } from "@school/api/constants";
import { getStudentEnrollmentDetails } from "@school/api/enrollment/query";
import { approveGuidance, updateGuidance } from "@school/api/guidance/action";
import {
  CIVIL_STATUS_OPTIONS,
  EDUCATIONAL_ATTAINMENT_OPTIONS,
  INCOME_BRACKET_OPTIONS,
  OCCUPATION_TYPE_OPTIONS,
  SPECIAL_NEEDS_CATEGORIES,
} from "@school/api/guidance/constants";
import {
  Badge,
  Button,
  Card,
  Checkbox,
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
  BookOpen,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  History,
  Home,
  Loader2,
  Pencil,
  Plus,
  Printer,
  Search,
  ShieldAlert,
  Trash2,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { StaffApprovalDialog } from "@/components/portal/staff-approval-dialog";
import { formatPH } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface ProfileState {
  birthOrder: string;
  birthplace: string;
  civilStatus: string;
  currentAddress: string;
  diagnosisNote: string;
  familyIncome: string;
  father: {
    lastName: string;
    firstName: string;
    middleName: string;
    birthday: string;
    religion: string;
    contact: string;
    education: string;
    occupationType: string;
    companyName: string;
    companyAddress: string;
    companyContact: string;
    ofwLocation?: string;
  };
  guardian: {
    lastName: string;
    firstName: string;
    middleName: string;
    birthday: string;
    religion: string;
    contact: string;
    education: string;
    occupationType: string;
    companyName: string;
    companyAddress: string;
    companyContact: string;
    ofwLocation?: string;
  };
  guardianRelationship?: string;
  householdMembers: { name: string; relationship: string }[];
  mother: {
    lastName: string;
    firstName: string;
    middleName: string;
    birthday: string;
    religion: string;
    contact: string;
    education: string;
    occupationType: string;
    companyName: string;
    companyAddress: string;
    companyContact: string;
    ofwLocation?: string;
  };
  nationality: string;
  others_behavioralSpecify?: string;
  others_controlSpecify?: string;
  others_delaySpecify?: string;
  others_learningSpecify?: string;
  others_specialistSpecify?: string;
  parentsCivilStatus: string;
  permanentAddress: string;
  personalContact: string;
  religion: string;
  sameAddress: boolean;
  siblings: { name: string; schoolWork: string }[];
}

const initialProfileState = (): ProfileState => ({
  civilStatus: "",
  nationality: "Filipino",
  birthplace: "",
  birthOrder: "",
  religion: "",
  personalContact: "",
  currentAddress: "",
  permanentAddress: "",
  sameAddress: false,
  householdMembers: [],
  parentsCivilStatus: "",
  guardianRelationship: "",
  father: {
    lastName: "",
    firstName: "",
    middleName: "",
    birthday: "",
    religion: "",
    contact: "",
    education: "",
    occupationType: "",
    companyName: "",
    companyAddress: "",
    companyContact: "",
    ofwLocation: "",
  },
  mother: {
    lastName: "",
    firstName: "",
    middleName: "",
    birthday: "",
    religion: "",
    contact: "",
    education: "",
    occupationType: "",
    companyName: "",
    companyAddress: "",
    companyContact: "",
    ofwLocation: "",
  },
  guardian: {
    lastName: "",
    firstName: "",
    middleName: "",
    birthday: "",
    religion: "",
    contact: "",
    education: "",
    occupationType: "",
    companyName: "",
    companyAddress: "",
    companyContact: "",
    ofwLocation: "",
  },
  familyIncome: "",
  siblings: [],
  diagnosisNote: "",
  others_learningSpecify: "",
  others_delaySpecify: "",
  others_controlSpecify: "",
  others_behavioralSpecify: "",
  others_specialistSpecify: "",
});

const mergeProfile = (
  loaded: Partial<ProfileState> & Record<string, unknown>,
): ProfileState => {
  const defaults = initialProfileState();
  if (!loaded) return defaults;
  return {
    ...defaults,
    ...loaded,
    guardianRelationship: loaded.guardianRelationship || "",
    familyIncome: (loaded.familyIncome as string) || "",
    father: {
      ...defaults.father,
      ...(loaded.father || {}),
      lastName: loaded.father?.lastName || "",
      firstName: loaded.father?.firstName || "",
      middleName: loaded.father?.middleName || "",
      ofwLocation: loaded.father?.ofwLocation || "",
    },
    mother: {
      ...defaults.mother,
      ...(loaded.mother || {}),
      lastName: loaded.mother?.lastName || "",
      firstName: loaded.mother?.firstName || "",
      middleName: loaded.mother?.middleName || "",
      ofwLocation: loaded.mother?.ofwLocation || "",
    },
    guardian: {
      ...defaults.guardian,
      ...(loaded.guardian || {}),
      lastName: loaded.guardian?.lastName || "",
      firstName: loaded.guardian?.firstName || "",
      middleName: loaded.guardian?.middleName || "",
      ofwLocation: loaded.guardian?.ofwLocation || "",
    },
    householdMembers: loaded.householdMembers || [],
    siblings: loaded.siblings || [],
  };
};

interface PendingStudent {
  enrollmentFormId: number;
  firstName: string | null;
  gender: string | null;
  gradeLevel: string;
  id: number;
  lastName: string | null;
  middleName: string | null;
  statusClinicFinishedAt: string | null;
  suffix: string | null;
}

interface ClearedStudent extends PendingStudent {
  approvedByFirstName: string | null;
  approvedByLastName: string | null;
  fatherName?: string | null;
  guardianName?: string | null;
  guardianRelationship?: string | null;
  motherMaidenName?: string | null;
  statusGuidanceFinishedAt: string;
  statusGuidanceHasDiagnosis: boolean;
  statusGuidanceNeeds: Record<string, boolean | string[]>;
  statusGuidanceNote: string | null;
  statusGuidanceProfile: Partial<ProfileState> & Record<string, unknown>;
}

interface GuidanceDashboardProps {
  initialData?: PendingStudent[];
  initialTotalCount?: number;
}

export function GuidanceDashboard({
  initialData,
  initialTotalCount,
}: GuidanceDashboardProps) {
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
    `/api/guidance/pending-students?search=${searchParam}&gradeLevel=${gradeLevelParam}`,
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
  const [isReadOnlyView, setIsReadOnlyView] = useState(false);
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  // Guidance Profile & Needs States
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileState>(initialProfileState());
  const [needs, setNeeds] = useState<Record<string, string[]>>({});
  const [guardianRelationship, setGuardianRelationship] = useState<
    "other" | "father" | "mother"
  >("other");

  useEffect(() => {
    if (!selectedStudent) {
      setProfile(initialProfileState());
      setNeeds({});
      setGuardianRelationship("other");
      return;
    }

    setDetailsLoading(true);
    getStudentEnrollmentDetails(selectedStudent.id)
      .then((result) => {
        if (result?.data) {
          const d = result.data;
          const loadedProfile = mergeProfile(d.statusGuidanceProfile);
          const savedRel = loadedProfile.guardianRelationship?.toLowerCase();
          const formRel = d.guardianRelationship?.toLowerCase();

          let rel = "other";
          if (savedRel) {
            rel = savedRel;
          } else {
            const gName = (
              loadedProfile.guardian?.lastName ||
              (loadedProfile.guardian as Record<string, unknown>)?.name ||
              d.guardianName ||
              ""
            )
              .trim()
              .toLowerCase();
            const fName = (
              loadedProfile.father?.lastName ||
              (loadedProfile.father as Record<string, unknown>)?.name ||
              d.fatherName ||
              ""
            )
              .trim()
              .toLowerCase();
            const mName = (
              loadedProfile.mother?.lastName ||
              (loadedProfile.mother as Record<string, unknown>)?.name ||
              d.motherMaidenName ||
              ""
            )
              .trim()
              .toLowerCase();

            if (formRel === "father" && (!gName || gName === fName)) {
              rel = "father";
            } else if (formRel === "mother" && (!gName || gName === mName)) {
              rel = "mother";
            } else {
              rel = "other";
            }
          }

          if (rel === "father") {
            setGuardianRelationship("father");
          } else if (rel === "mother") {
            setGuardianRelationship("mother");
          } else {
            setGuardianRelationship("other");
          }
          setProfile({
            ...loadedProfile,
            currentAddress: loadedProfile.currentAddress || d.address || "",
            father: {
              ...loadedProfile.father,
              contact: loadedProfile.father.contact || d.fatherContact || "",
            },
            mother: {
              ...loadedProfile.mother,
              contact: loadedProfile.mother.contact || d.motherContact || "",
            },
            guardian: {
              ...loadedProfile.guardian,
              contact:
                loadedProfile.guardian.contact ||
                d.guardianContact ||
                d.parentContact ||
                "",
            },
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load student details:", err);
      })
      .finally(() => setDetailsLoading(false));
  }, [selectedStudent]);

  const {
    data: clearedData,
    isLoading: isClearedLoading,
    mutate: mutateCleared,
  } = useSWR<{ data: ClearedStudent[]; totalCount: number }>(
    `/api/guidance/cleared-students?search=${searchParam}&gradeLevel=${gradeLevelParam}`,
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
        __guidanceSearchTimer: ReturnType<typeof setTimeout>;
      };
      clearTimeout(win.__guidanceSearchTimer);
      win.__guidanceSearchTimer = setTimeout(
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
            const finalProfile = {
              ...profile,
              guardianRelationship,
              guardian:
                guardianRelationship === "father"
                  ? { ...profile.father }
                  : guardianRelationship === "mother"
                    ? { ...profile.mother }
                    : { ...profile.guardian },
            };

            const result = await approveGuidance(
              targetId,
              notes || undefined,
              finalProfile,
              needs,
              !!profile.diagnosisNote && profile.diagnosisNote.trim() !== "",
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
            };
          },
          {
            optimisticData: {
              ...currentData,
              data: pendingStudents.filter(
                (s) => s.enrollmentFormId !== targetId,
              ),
              totalCount: totalPending - 1,
            },
            rollbackOnError: true,
            revalidate: true,
          },
        );

        toast.success("Guidance clearance issued.");
        setSelectedStudent(null);
        setNotes("");
        mutateCleared();
      } catch (error: unknown) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to approve guidance clearance",
        );
      }
    });
  };

  const handleSaveHistory = async () => {
    if (!selectedStudent) return;

    const targetId = selectedStudent.enrollmentFormId;

    startTransition(async () => {
      try {
        const finalProfile = {
          ...profile,
          guardianRelationship,
          guardian:
            guardianRelationship === "father"
              ? { ...profile.father }
              : guardianRelationship === "mother"
                ? { ...profile.mother }
                : { ...profile.guardian },
        };

        const result = await updateGuidance(
          targetId,
          notes || undefined,
          finalProfile,
          needs,
          !!profile.diagnosisNote && profile.diagnosisNote.trim() !== "",
        );

        if (result.error) {
          throw new Error(result.error);
        }

        toast.success("Guidance clearance record updated.");
        setSelectedStudent(null);
        setNotes("");
        setIsEditingHistory(false);
        mutateCleared();
      } catch (error: unknown) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update guidance record",
        );
      }
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-200/50">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 transform">
          <BookOpen className="h-64 w-64 text-indigo-500/20" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-2 backdrop-blur-md">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="font-bold text-3xl tracking-tight">
              Guidance Dashboard
            </h1>
          </div>
          <p className="mt-2 max-w-xl text-indigo-50 text-sm leading-relaxed">
            Review student guidance records and issue clearances. Support
            student development by ensuring all behavioral and academic
            requirements are met.
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
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-sm transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
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
                <SelectTrigger className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none">
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
            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm ring-1 ring-indigo-100/50">
              <div className="absolute -top-4 -right-4">
                <ShieldAlert className="h-16 w-16 text-indigo-100/50" />
              </div>
              <p className="text-indigo-700 text-xs font-bold uppercase tracking-wider">
                Awaiting Clearance
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-4xl font-bold text-gray-900">
                  {totalPending}
                </p>
                <p className="text-gray-500 text-xs font-medium">Students</p>
              </div>
            </Card>

            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm ring-1 ring-emerald-100/50">
              <div className="absolute -top-4 -right-4">
                <ClipboardCheck className="h-16 w-16 text-emerald-100/50" />
              </div>
              <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider">
                Issued Clearances
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
                className="rounded-lg px-6 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
                value="pending"
              >
                Awaiting Clearance
              </TabsTrigger>
              <TabsTrigger
                className="rounded-lg px-6 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
                value="history"
              >
                Clearance History
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
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                    <p className="mt-4 font-medium text-gray-500">
                      Searching records...
                    </p>
                  </div>
                ) : pendingStudents.length > 0 ? (
                  pendingStudents.map((student) => (
                    <Card
                      className="group overflow-hidden border-gray-100 bg-white p-0 shadow-sm transition-all hover:shadow-md hover:ring-1 hover:ring-indigo-500/20"
                      key={student.id}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5">
                        <div className="flex items-start gap-4">
                          <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                            <BookOpen className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
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
                              {student.statusClinicFinishedAt && (
                                <>
                                  <span className="h-1 w-1 rounded-full bg-gray-300" />
                                  <span className="flex items-center gap-1.5 text-emerald-600 font-medium italic">
                                    <CheckCircle2 className="h-3.5 w-3.5" />{" "}
                                    Clinic Cleared{" "}
                                    {formatPH(student.statusClinicFinishedAt, {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex shrink-0 sm:mt-0">
                          <Button
                            className="w-full rounded-xl bg-indigo-600 font-semibold shadow-lg shadow-indigo-200/50 hover:bg-indigo-700 hover:shadow-indigo-300/50 sm:w-auto"
                            disabled={isPending}
                            onClick={() => setSelectedStudent(student)}
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Issue Clearance
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white py-24 text-center shadow-sm">
                    <div className="rounded-full bg-gray-50 p-4">
                      <BookOpen className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="mt-4 font-bold text-gray-900 text-lg">
                      Queue is Empty
                    </h3>
                    <p className="mt-1 max-w-xs text-gray-500 text-sm">
                      {searchParam
                        ? `No results for "${searchParam}" in the current queue.`
                        : "Everything is processed! New students will appear once they clear the Clinic."}
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
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                    <p className="mt-4 font-medium text-gray-500">
                      Loading history...
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
                          <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-indigo-600 group-hover:bg-indigo-50">
                            <ClipboardCheck className="h-6 w-6" />
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
                              <span className="flex items-center gap-1.5 text-indigo-600 font-bold">
                                <ShieldAlert className="h-3.5 w-3.5" />
                                Cleared{" "}
                                {formatPH(student.statusGuidanceFinishedAt)}
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
                            className="w-full rounded-xl border-indigo-100 text-indigo-700 shadow-sm hover:bg-indigo-50 sm:w-auto"
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
                                statusClinicFinishedAt:
                                  student.statusClinicFinishedAt,
                              };
                              setSelectedStudent(pendingStudent);
                              setNotes(student.statusGuidanceNote || "");
                              setProfile(
                                mergeProfile(student.statusGuidanceProfile),
                              );
                              setNeeds(
                                (student.statusGuidanceNeeds || {}) as Record<
                                  string,
                                  string[]
                                >,
                              );
                              setIsReadOnlyView(true);
                              setIsEditingHistory(false);
                            }}
                            variant="outline"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Record
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
                                gender: student.gender,
                                statusClinicFinishedAt:
                                  student.statusClinicFinishedAt,
                              };
                              setSelectedStudent(pendingStudent);
                              setNotes(student.statusGuidanceNote || "");
                              setProfile(
                                mergeProfile(student.statusGuidanceProfile),
                              );
                              setNeeds(
                                (student.statusGuidanceNeeds || {}) as Record<
                                  string,
                                  string[]
                                >,
                              );
                              setIsEditingHistory(true);
                            }}
                            variant="outline"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            className="w-full rounded-xl border-indigo-100 text-indigo-700 shadow-sm hover:bg-indigo-50 sm:w-auto"
                            onClick={() =>
                              window.open(
                                `/print/guidance/${student.enrollmentFormId}`,
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
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white py-24 text-center shadow-sm">
                    <div className="rounded-full bg-gray-50 p-4">
                      <History className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="mt-4 font-bold text-gray-900 text-lg">
                      No Issued Clearances
                    </h3>
                    <p className="mt-1 max-w-xs text-gray-500 text-sm">
                      History of issued guidance clearances will appear here.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Clearance Dialog */}
      <StaffApprovalDialog
        confirmIcon={BookOpen}
        confirmLabel={isEditingHistory ? "Save Changes" : "Issue Clearance"}
        isLoading={isPending}
        isOpen={!!selectedStudent}
        maxWidth="max-w-4xl"
        onConfirm={
          isReadOnlyView
            ? undefined
            : isEditingHistory
              ? handleSaveHistory
              : handleApprove
        }
        onOpenChange={(open) => {
          if (!open) {
            setSelectedStudent(null);
            setIsEditingHistory(false);
            setIsReadOnlyView(false);
            setNotes("");
            setProfile(initialProfileState());
            setNeeds({});
            setGuardianRelationship("other");
          }
        }}
        student={selectedStudent}
        title={
          isReadOnlyView
            ? "Guidance Clearance Record"
            : isEditingHistory
              ? "Edit Guidance Clearance"
              : "Issue Guidance Clearance"
        }
        variant="indigo"
      >
        {detailsLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium text-gray-500">
              Loading student enrollment details...
            </p>
          </div>
        ) : (
          <Tabs className="w-full space-y-4" defaultValue="profile">
            <TabsList className="grid w-full grid-cols-2 h-10 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger
                className="flex items-center justify-center gap-1.5 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600"
                value="profile"
              >
                <User className="h-4 w-4" /> Profile & Family
              </TabsTrigger>
              <TabsTrigger
                className="flex items-center justify-center gap-1.5 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600"
                value="needs"
              >
                <Brain className="h-4 w-4" /> Special Needs & Assessment
              </TabsTrigger>
            </TabsList>

            <TabsContent className="focus-visible:outline-none" value="profile">
              <fieldset className="space-y-6" disabled={isReadOnlyView}>
                {/* Section: Additional Personal Details */}
                <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <h4 className="flex items-center gap-2 font-bold text-gray-800 text-sm border-b border-gray-200 pb-2">
                    <User className="h-4 w-4 text-indigo-500" />
                    Student Personal Details
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {/* Nationality */}
                    <div className="space-y-1.5">
                      <Label
                        className="text-xs font-semibold text-gray-600"
                        htmlFor="nationality"
                      >
                        Nationality
                      </Label>
                      <Input
                        className="bg-white text-xs h-9"
                        id="nationality"
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            nationality: e.target.value,
                          }))
                        }
                        placeholder="e.g. Filipino"
                        value={profile.nationality}
                      />
                    </div>

                    {/* Religion */}
                    <div className="space-y-1.5">
                      <Label
                        className="text-xs font-semibold text-gray-600"
                        htmlFor="religion"
                      >
                        Religion
                      </Label>
                      <Input
                        className="w-full bg-white text-xs h-9"
                        id="religion"
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            religion: e.target.value,
                          }))
                        }
                        placeholder="Religion"
                        value={profile.religion}
                      />
                    </div>

                    {/* Birthplace */}
                    <div className="space-y-1.5">
                      <Label
                        className="text-xs font-semibold text-gray-600"
                        htmlFor="birthplace"
                      >
                        Birthplace
                      </Label>
                      <Input
                        className="bg-white text-xs h-9"
                        id="birthplace"
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            birthplace: e.target.value,
                          }))
                        }
                        placeholder="City/Municipality, Province"
                        value={profile.birthplace}
                      />
                    </div>

                    {/* Birth Order */}
                    <div className="space-y-1.5">
                      <Label
                        className="text-xs font-semibold text-gray-600"
                        htmlFor="birth-order"
                      >
                        Birth Order
                      </Label>
                      <Input
                        className="bg-white text-xs h-9"
                        id="birth-order"
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            birthOrder: e.target.value,
                          }))
                        }
                        placeholder="e.g. 1st child"
                        value={profile.birthOrder}
                      />
                    </div>

                    {/* Personal Contact */}
                    <div className="space-y-1.5">
                      <Label
                        className="text-xs font-semibold text-gray-600"
                        htmlFor="personal-contact"
                      >
                        Personal Contact No.
                      </Label>
                      <Input
                        className="bg-white text-xs h-9"
                        id="personal-contact"
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            personalContact: e.target.value,
                          }))
                        }
                        placeholder="e.g. 0917XXXXXXX"
                        value={profile.personalContact}
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <h4 className="flex items-center gap-2 font-bold text-gray-800 text-sm border-b border-gray-200 pb-2">
                    <Home className="h-4 w-4 text-indigo-500" />
                    Address Information
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label
                        className="text-xs font-semibold text-gray-600"
                        htmlFor="current-address"
                      >
                        Current Address
                      </Label>
                      <Input
                        className="bg-white text-xs h-9"
                        id="current-address"
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            currentAddress: e.target.value,
                          }))
                        }
                        placeholder="Full current address"
                        value={profile.currentAddress}
                      />
                    </div>

                    <div className="flex items-center gap-2 py-1">
                      <Checkbox
                        checked={profile.sameAddress}
                        className="h-5 w-5 border-gray-400 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 data-[state=checked]:text-white shadow-sm shrink-0"
                        id="same-address"
                        onCheckedChange={(checked) => {
                          setProfile((p) => {
                            const same = !!checked;
                            return {
                              ...p,
                              sameAddress: same,
                              permanentAddress: same
                                ? p.currentAddress
                                : p.permanentAddress,
                            };
                          });
                        }}
                      />
                      <Label
                        className="cursor-pointer text-xs font-medium text-gray-600"
                        htmlFor="same-address"
                      >
                        Permanent Address is the same as Current Address
                      </Label>
                    </div>

                    {!profile.sameAddress && (
                      <div className="space-y-1.5">
                        <Label
                          className="text-xs font-semibold text-gray-600"
                          htmlFor="permanent-address"
                        >
                          Permanent Address
                        </Label>
                        <Input
                          className="bg-white text-xs h-9"
                          id="permanent-address"
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              permanentAddress: e.target.value,
                            }))
                          }
                          placeholder="Full permanent address"
                          value={profile.permanentAddress}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Household & Siblings Grid */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Household Members */}
                  <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 flex flex-col">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <h4 className="flex items-center gap-2 font-bold text-gray-800 text-sm">
                        <Users className="h-4 w-4 text-indigo-500" />
                        Other Household/Family Members
                      </h4>
                      <Button
                        className="h-7 text-xs px-2"
                        onClick={() => {
                          setProfile((p) => ({
                            ...p,
                            householdMembers: [
                              ...p.householdMembers,
                              { name: "", relationship: "" },
                            ],
                          }));
                        }}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" /> Add
                      </Button>
                    </div>

                    <div className="space-y-2 flex-1 mt-3">
                      {profile.householdMembers.length === 0 ? (
                        <p className="text-center text-xs text-gray-400 italic py-4">
                          No other household members listed.
                        </p>
                      ) : (
                        profile.householdMembers.map((member, idx) => (
                          <div className="flex gap-2 items-center" key={idx}>
                            <Input
                              className="bg-white text-xs h-8 flex-1"
                              onChange={(e) => {
                                const newList = profile.householdMembers.map(
                                  (m, i) =>
                                    i === idx
                                      ? { ...m, name: e.target.value }
                                      : m,
                                );
                                setProfile((p) => ({
                                  ...p,
                                  householdMembers: newList,
                                }));
                              }}
                              placeholder="Full Name"
                              value={member.name}
                            />
                            <Input
                              className="bg-white text-xs h-8 w-1/3"
                              onChange={(e) => {
                                const newList = profile.householdMembers.map(
                                  (m, i) =>
                                    i === idx
                                      ? { ...m, relationship: e.target.value }
                                      : m,
                                );
                                setProfile((p) => ({
                                  ...p,
                                  householdMembers: newList,
                                }));
                              }}
                              placeholder="Relationship"
                              value={member.relationship}
                            />
                            <Button
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 shrink-0"
                              onClick={() => {
                                setProfile((p) => ({
                                  ...p,
                                  householdMembers: p.householdMembers.filter(
                                    (_, i) => i !== idx,
                                  ),
                                }));
                              }}
                              type="button"
                              variant="ghost"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Siblings */}
                  <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 flex flex-col">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <h4 className="flex items-center gap-2 font-bold text-gray-800 text-sm">
                        <Users className="h-4 w-4 text-indigo-500" />
                        Siblings Information
                      </h4>
                      <Button
                        className="h-7 text-xs px-2"
                        onClick={() => {
                          setProfile((p) => ({
                            ...p,
                            siblings: [
                              ...p.siblings,
                              { name: "", schoolWork: "" },
                            ],
                          }));
                        }}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" /> Add
                      </Button>
                    </div>

                    <div className="space-y-2 flex-1 mt-3">
                      {profile.siblings.length === 0 ? (
                        <p className="text-center text-xs text-gray-400 italic py-4">
                          No siblings listed.
                        </p>
                      ) : (
                        profile.siblings.map((sibling, idx) => (
                          <div className="flex gap-2 items-center" key={idx}>
                            <Input
                              className="bg-white text-xs h-8 flex-1"
                              onChange={(e) => {
                                const newList = profile.siblings.map((s, i) =>
                                  i === idx
                                    ? { ...s, name: e.target.value }
                                    : s,
                                );
                                setProfile((p) => ({
                                  ...p,
                                  siblings: newList,
                                }));
                              }}
                              placeholder="Sibling Name"
                              value={sibling.name}
                            />
                            <Input
                              className="bg-white text-xs h-8 w-1/3"
                              onChange={(e) => {
                                const newList = profile.siblings.map((s, i) =>
                                  i === idx
                                    ? { ...s, schoolWork: e.target.value }
                                    : s,
                                );
                                setProfile((p) => ({
                                  ...p,
                                  siblings: newList,
                                }));
                              }}
                              placeholder="School/Work"
                              value={sibling.schoolWork}
                            />
                            <Button
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 shrink-0"
                              onClick={() => {
                                setProfile((p) => ({
                                  ...p,
                                  siblings: p.siblings.filter(
                                    (_, i) => i !== idx,
                                  ),
                                }));
                              }}
                              type="button"
                              variant="ghost"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Parents General Details */}
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-4">
                  <h4 className="flex items-center gap-2 font-bold text-gray-800 text-sm border-b border-gray-200 pb-2">
                    <Users className="h-4 w-4 text-indigo-500" />
                    Parents&apos; Household Information
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <Label
                        className="text-xs font-semibold text-gray-600"
                        htmlFor="parents-civil-status"
                      >
                        Parents&apos; Civil Status
                      </Label>
                      <Select
                        onValueChange={(val) =>
                          setProfile((p) => ({ ...p, parentsCivilStatus: val }))
                        }
                        value={profile.parentsCivilStatus}
                      >
                        <SelectTrigger className="w-full bg-white text-xs h-9">
                          <SelectValue placeholder="Select Civil Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {CIVIL_STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        className="text-xs font-semibold text-gray-600"
                        htmlFor="family-income"
                      >
                        Parent&apos;s Annual Income
                      </Label>
                      <Select
                        onValueChange={(val) =>
                          setProfile((p) => ({ ...p, familyIncome: val }))
                        }
                        value={profile.familyIncome}
                      >
                        <SelectTrigger className="w-full bg-white text-xs h-9">
                          <SelectValue placeholder="Select Income Bracket" />
                        </SelectTrigger>
                        <SelectContent>
                          {INCOME_BRACKET_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Parents / Guardian Specific details */}
                <div className="space-y-4">
                  {/* Father details */}
                  <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                    <h5 className="font-bold text-gray-800 text-xs flex items-center gap-1.5 border-b border-gray-200 pb-1.5">
                      <User className="h-3.5 w-3.5 text-indigo-500" />
                      Father&apos;s Details
                    </h5>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                            Surname
                          </Label>
                          <Input
                            className="bg-white text-xs h-8"
                            onChange={(e) =>
                              setProfile((p) => ({
                                ...p,
                                father: {
                                  ...p.father,
                                  lastName: e.target.value,
                                },
                              }))
                            }
                            placeholder="Surname"
                            value={profile.father.lastName || ""}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                            Given Name
                          </Label>
                          <Input
                            className="bg-white text-xs h-8"
                            onChange={(e) =>
                              setProfile((p) => ({
                                ...p,
                                father: {
                                  ...p.father,
                                  firstName: e.target.value,
                                },
                              }))
                            }
                            placeholder="Given Name"
                            value={profile.father.firstName || ""}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                            Middle Name
                          </Label>
                          <Input
                            className="bg-white text-xs h-8"
                            onChange={(e) =>
                              setProfile((p) => ({
                                ...p,
                                father: {
                                  ...p.father,
                                  middleName: e.target.value,
                                },
                              }))
                            }
                            placeholder="Middle Name"
                            value={profile.father.middleName || ""}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                          Birthday
                        </Label>
                        <Input
                          className="bg-white text-xs h-8"
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              father: { ...p.father, birthday: e.target.value },
                            }))
                          }
                          type="date"
                          value={profile.father.birthday}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                          Religion
                        </Label>
                        <Input
                          className="w-full bg-white text-xs h-8"
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              father: { ...p.father, religion: e.target.value },
                            }))
                          }
                          placeholder="Religion"
                          value={profile.father.religion}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                          Contact No.
                        </Label>
                        <Input
                          className="bg-white text-xs h-8"
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              father: { ...p.father, contact: e.target.value },
                            }))
                          }
                          placeholder="Contact Number"
                          value={profile.father.contact}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                          Education
                        </Label>
                        <Select
                          onValueChange={(val) =>
                            setProfile((p) => ({
                              ...p,
                              father: { ...p.father, education: val },
                            }))
                          }
                          value={profile.father.education}
                        >
                          <SelectTrigger className="w-full bg-white text-xs h-8">
                            <SelectValue placeholder="Education" />
                          </SelectTrigger>
                          <SelectContent>
                            {EDUCATIONAL_ATTAINMENT_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                          Occupation Type
                        </Label>
                        <Select
                          onValueChange={(val) =>
                            setProfile((p) => ({
                              ...p,
                              father: { ...p.father, occupationType: val },
                            }))
                          }
                          value={profile.father.occupationType}
                        >
                          <SelectTrigger className="w-full bg-white text-xs h-8">
                            <SelectValue placeholder="Occupation" />
                          </SelectTrigger>
                          <SelectContent>
                            {OCCUPATION_TYPE_OPTIONS.filter(
                              (opt) => opt.value !== "housewife",
                            ).map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {profile.father.occupationType === "ofw" && (
                          <div className="space-y-1 mt-2">
                            <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                              OFW Country / Location (&quot;OFW at&quot;)
                            </Label>
                            <Input
                              className="w-full bg-white text-xs h-8"
                              onChange={(e) =>
                                setProfile((p) => ({
                                  ...p,
                                  father: {
                                    ...p.father,
                                    ofwLocation: e.target.value,
                                  },
                                }))
                              }
                              placeholder="e.g. Dubai, UAE / Qatar"
                              value={profile.father.ofwLocation || ""}
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                          Company Name
                        </Label>
                        <Input
                          className="bg-white text-xs h-8"
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              father: {
                                ...p.father,
                                companyName: e.target.value,
                              },
                            }))
                          }
                          placeholder="Company Name"
                          value={profile.father.companyName}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                          Company Address
                        </Label>
                        <Input
                          className="bg-white text-xs h-8"
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              father: {
                                ...p.father,
                                companyAddress: e.target.value,
                              },
                            }))
                          }
                          placeholder="Company Address"
                          value={profile.father.companyAddress}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                          Company Contact No.
                        </Label>
                        <Input
                          className="bg-white text-xs h-8"
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              father: {
                                ...p.father,
                                companyContact: e.target.value,
                              },
                            }))
                          }
                          placeholder="Company Contact Number"
                          value={profile.father.companyContact}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mother details */}
                  <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                    <h5 className="font-bold text-gray-800 text-xs flex items-center gap-1.5 border-b border-gray-200 pb-1.5">
                      <User className="h-3.5 w-3.5 text-indigo-500" />
                      Mother&apos;s Maiden Details
                    </h5>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                            Maiden Surname
                          </Label>
                          <Input
                            className="bg-white text-xs h-8"
                            onChange={(e) =>
                              setProfile((p) => ({
                                ...p,
                                mother: {
                                  ...p.mother,
                                  lastName: e.target.value,
                                },
                              }))
                            }
                            placeholder="Maiden Surname"
                            value={profile.mother.lastName || ""}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                            Given Name
                          </Label>
                          <Input
                            className="bg-white text-xs h-8"
                            onChange={(e) =>
                              setProfile((p) => ({
                                ...p,
                                mother: {
                                  ...p.mother,
                                  firstName: e.target.value,
                                },
                              }))
                            }
                            placeholder="Given Name"
                            value={profile.mother.firstName || ""}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                            Middle Name
                          </Label>
                          <Input
                            className="bg-white text-xs h-8"
                            onChange={(e) =>
                              setProfile((p) => ({
                                ...p,
                                mother: {
                                  ...p.mother,
                                  middleName: e.target.value,
                                },
                              }))
                            }
                            placeholder="Middle Name"
                            value={profile.mother.middleName || ""}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                          Birthday
                        </Label>
                        <Input
                          className="bg-white text-xs h-8"
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              mother: { ...p.mother, birthday: e.target.value },
                            }))
                          }
                          type="date"
                          value={profile.mother.birthday}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                          Religion
                        </Label>
                        <Input
                          className="w-full bg-white text-xs h-8"
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              mother: { ...p.mother, religion: e.target.value },
                            }))
                          }
                          placeholder="Religion"
                          value={profile.mother.religion}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                          Contact No.
                        </Label>
                        <Input
                          className="bg-white text-xs h-8"
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              mother: { ...p.mother, contact: e.target.value },
                            }))
                          }
                          placeholder="Contact Number"
                          value={profile.mother.contact}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                          Education
                        </Label>
                        <Select
                          onValueChange={(val) =>
                            setProfile((p) => ({
                              ...p,
                              mother: { ...p.mother, education: val },
                            }))
                          }
                          value={profile.mother.education}
                        >
                          <SelectTrigger className="w-full bg-white text-xs h-8">
                            <SelectValue placeholder="Education" />
                          </SelectTrigger>
                          <SelectContent>
                            {EDUCATIONAL_ATTAINMENT_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                          Occupation Type
                        </Label>
                        <Select
                          onValueChange={(val) =>
                            setProfile((p) => ({
                              ...p,
                              mother: { ...p.mother, occupationType: val },
                            }))
                          }
                          value={profile.mother.occupationType}
                        >
                          <SelectTrigger className="w-full bg-white text-xs h-8">
                            <SelectValue placeholder="Occupation" />
                          </SelectTrigger>
                          <SelectContent>
                            {OCCUPATION_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {profile.mother.occupationType === "ofw" && (
                          <div className="space-y-1 mt-2">
                            <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                              OFW Country / Location (&quot;OFW at&quot;)
                            </Label>
                            <Input
                              className="w-full bg-white text-xs h-8"
                              onChange={(e) =>
                                setProfile((p) => ({
                                  ...p,
                                  mother: {
                                    ...p.mother,
                                    ofwLocation: e.target.value,
                                  },
                                }))
                              }
                              placeholder="e.g. Dubai, UAE / Qatar"
                              value={profile.mother.ofwLocation || ""}
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                          Company Name
                        </Label>
                        <Input
                          className="bg-white text-xs h-8"
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              mother: {
                                ...p.mother,
                                companyName: e.target.value,
                              },
                            }))
                          }
                          placeholder="Company Name"
                          value={profile.mother.companyName}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                          Company Address
                        </Label>
                        <Input
                          className="bg-white text-xs h-8"
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              mother: {
                                ...p.mother,
                                companyAddress: e.target.value,
                              },
                            }))
                          }
                          placeholder="Company Address"
                          value={profile.mother.companyAddress}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                          Company Contact No.
                        </Label>
                        <Input
                          className="bg-white text-xs h-8"
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              mother: {
                                ...p.mother,
                                companyContact: e.target.value,
                              },
                            }))
                          }
                          placeholder="Company Contact Number"
                          value={profile.mother.companyContact}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Guardian details */}
                  <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                    <h5 className="font-bold text-gray-800 text-xs flex items-center gap-1.5 border-b border-gray-200 pb-1.5">
                      <User className="h-3.5 w-3.5 text-indigo-500" />
                      Guardian&apos;s Details (If applicable)
                    </h5>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-indigo-950 uppercase tracking-wider block">
                          Guardian is the Student&apos;s:
                        </Label>
                        <Select
                          onValueChange={(val: string) => {
                            setGuardianRelationship(
                              val as "father" | "mother" | "other",
                            );
                            setProfile((p) => ({
                              ...p,
                              guardianRelationship: val,
                            }));
                          }}
                          value={guardianRelationship}
                        >
                          <SelectTrigger className="w-full bg-white text-xs h-9 font-semibold border-indigo-100">
                            <SelectValue placeholder="Select Guardian Relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="father">
                              Father (Same as Father&apos;s Details)
                            </SelectItem>
                            <SelectItem value="mother">
                              Mother (Same as Mother&apos;s Details)
                            </SelectItem>
                            <SelectItem value="other">
                              Other / Specify Details Below
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {guardianRelationship === "other" && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                                Surname
                              </Label>
                              <Input
                                className="bg-white text-xs h-8"
                                disabled={isPending}
                                onChange={(e) =>
                                  setProfile((p) => ({
                                    ...p,
                                    guardian: {
                                      ...p.guardian,
                                      lastName: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="Surname"
                                value={profile.guardian.lastName || ""}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                                Given Name
                              </Label>
                              <Input
                                className="bg-white text-xs h-8"
                                disabled={isPending}
                                onChange={(e) =>
                                  setProfile((p) => ({
                                    ...p,
                                    guardian: {
                                      ...p.guardian,
                                      firstName: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="Given Name"
                                value={profile.guardian.firstName || ""}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                                Middle Name
                              </Label>
                              <Input
                                className="bg-white text-xs h-8"
                                disabled={isPending}
                                onChange={(e) =>
                                  setProfile((p) => ({
                                    ...p,
                                    guardian: {
                                      ...p.guardian,
                                      middleName: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="Middle Name"
                                value={profile.guardian.middleName || ""}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                              Birthday
                            </Label>
                            <Input
                              className="bg-white text-xs h-8"
                              disabled={isPending}
                              onChange={(e) =>
                                setProfile((p) => ({
                                  ...p,
                                  guardian: {
                                    ...p.guardian,
                                    birthday: e.target.value,
                                  },
                                }))
                              }
                              type="date"
                              value={profile.guardian.birthday}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                              Religion
                            </Label>
                            <Input
                              className="w-full bg-white text-xs h-8"
                              disabled={isPending}
                              onChange={(e) =>
                                setProfile((p) => ({
                                  ...p,
                                  guardian: {
                                    ...p.guardian,
                                    religion: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Religion"
                              value={profile.guardian.religion}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                              Contact No.
                            </Label>
                            <Input
                              className="bg-white text-xs h-8"
                              disabled={isPending}
                              onChange={(e) =>
                                setProfile((p) => ({
                                  ...p,
                                  guardian: {
                                    ...p.guardian,
                                    contact: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Contact Number"
                              value={profile.guardian.contact}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                              Education
                            </Label>
                            <Select
                              disabled={isPending}
                              onValueChange={(val) =>
                                setProfile((p) => ({
                                  ...p,
                                  guardian: { ...p.guardian, education: val },
                                }))
                              }
                              value={profile.guardian.education}
                            >
                              <SelectTrigger className="w-full bg-white text-xs h-8">
                                <SelectValue placeholder="Education" />
                              </SelectTrigger>
                              <SelectContent>
                                {EDUCATIONAL_ATTAINMENT_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                              Occupation Type
                            </Label>
                            <Select
                              disabled={isPending}
                              onValueChange={(val) =>
                                setProfile((p) => ({
                                  ...p,
                                  guardian: {
                                    ...p.guardian,
                                    occupationType: val,
                                  },
                                }))
                              }
                              value={profile.guardian.occupationType}
                            >
                              <SelectTrigger className="w-full bg-white text-xs h-8">
                                <SelectValue placeholder="Occupation" />
                              </SelectTrigger>
                              <SelectContent>
                                {OCCUPATION_TYPE_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                              Company Name
                            </Label>
                            <Input
                              className="bg-white text-xs h-8"
                              disabled={isPending}
                              onChange={(e) =>
                                setProfile((p) => ({
                                  ...p,
                                  guardian: {
                                    ...p.guardian,
                                    companyName: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Company Name"
                              value={profile.guardian.companyName}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                              Company Address
                            </Label>
                            <Input
                              className="bg-white text-xs h-8"
                              disabled={isPending}
                              onChange={(e) =>
                                setProfile((p) => ({
                                  ...p,
                                  guardian: {
                                    ...p.guardian,
                                    companyAddress: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Company Address"
                              value={profile.guardian.companyAddress}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-gray-500 uppercase">
                              Company Contact No.
                            </Label>
                            <Input
                              className="bg-white text-xs h-8"
                              disabled={isPending}
                              onChange={(e) =>
                                setProfile((p) => ({
                                  ...p,
                                  guardian: {
                                    ...p.guardian,
                                    companyContact: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Company Contact Number"
                              value={profile.guardian.companyContact}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </fieldset>
            </TabsContent>

            <TabsContent className="focus-visible:outline-none" value="needs">
              <fieldset className="space-y-6" disabled={isReadOnlyView}>
                <div className="grid grid-cols-1 gap-6">
                  {SPECIAL_NEEDS_CATEGORIES.map((category) => (
                    <div
                      className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3"
                      key={category.id}
                    >
                      <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5 border-b border-gray-200 pb-2">
                        <Brain className="h-4 w-4 text-indigo-500" />
                        {category.title}
                      </h4>
                      <div className="space-y-2">
                        {category.items.map((item) => {
                          const isChecked = (needs[category.id] || []).includes(
                            item.id,
                          );
                          return (
                            <div className="space-y-1.5" key={item.id}>
                              <div className="flex items-start gap-2.5">
                                <Checkbox
                                  checked={isChecked}
                                  className="h-5 w-5 border-gray-400 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 data-[state=checked]:text-white shadow-sm shrink-0 mt-0.5"
                                  id={`need-${category.id}-${item.id}`}
                                  onCheckedChange={(checked) => {
                                    setNeeds((prev) => {
                                      const list = prev[category.id] || [];
                                      const newList = checked
                                        ? [...list, item.id]
                                        : list.filter((id) => id !== item.id);
                                      return {
                                        ...prev,
                                        [category.id]: newList,
                                      };
                                    });
                                  }}
                                />
                                <Label
                                  className="text-xs font-medium leading-relaxed text-gray-600 cursor-pointer select-none"
                                  htmlFor={`need-${category.id}-${item.id}`}
                                >
                                  {item.label}
                                </Label>
                              </div>
                              {isChecked && item.id.startsWith("others") && (
                                <div className="pl-7 animate-in fade-in-50 duration-200">
                                  <Input
                                    className="bg-white text-xs h-8 placeholder:text-gray-400 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 max-w-md"
                                    disabled={isPending}
                                    onChange={(e) => {
                                      setProfile((p) => ({
                                        ...p,
                                        [`${item.id}Specify`]: e.target.value,
                                      }));
                                    }}
                                    placeholder="Please specify details..."
                                    value={
                                      (profile[
                                        `${item.id}Specify` as keyof ProfileState
                                      ] as string) || ""
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* General remarks */}
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-1.5">
                  <Label
                    className="text-xs font-semibold text-gray-700"
                    htmlFor="guidance-notes"
                  >
                    Counseling Remarks & Observations (Optional)
                  </Label>
                  <Textarea
                    className="bg-white text-xs"
                    disabled={isPending}
                    id="guidance-notes"
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Document general guidance notes, counselor observations, behavioral records, or clearance remarks..."
                    rows={3}
                    value={notes}
                  />
                </div>
              </fieldset>
            </TabsContent>
          </Tabs>
        )}
      </StaffApprovalDialog>
    </div>
  );
}
