"use client";

import {
  GRADE_LEVEL_LABELS,
  GRADE_LEVELS_BY_LEARNER_TYPE,
  LEARNER_TYPE_LABELS,
  SHS_TRACK_LABELS,
  STUDENT_TYPE_LABELS,
} from "@school/api/constants";
import {
  checkStudentIdentity,
  enrollStudentForSY,
  searchStudentByLRN,
} from "@school/api/enrollment/action";
import {
  Badge,
  Button,
  DatePicker,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@school/ui";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Loader2,
  Search,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { formatPH } from "@/lib/utils";

interface ActiveSY {
  id: number;
  name: string;
}

interface FoundStudent {
  address: string | null;
  archivedAt: string | null;
  birthdate: string | null;
  email: string;
  fatherName: string | null;
  firstName: string | null;
  gender: string | null;
  guardianContact: string | null;
  guardianName: string | null;
  id: number;
  lastName: string | null;
  lrn: string | null;
  middleName: string | null;
  motherMaidenName: string | null;
  psaBirthCertNo: string | null;
  suffix: string | null;
  zipCode: string | null;
}

interface EnrollmentWizardProps {
  activeSY: ActiveSY | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

type Step = 1 | 2 | 3 | 4 | 5;

const RELATIONSHIP_OPTIONS = [
  "Mother",
  "Father",
  "Grandmother",
  "Grandfather",
  "Aunt",
  "Uncle",
  "Legal Guardian",
  "Other",
];

export function EnrollmentWizard({
  open,
  onOpenChange,
  activeSY,
}: EnrollmentWizardProps) {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>(1);

  // Step 1: Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoundStudent[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<FoundStudent | null>(
    null,
  );
  const [isNewStudent, setIsNewStudent] = useState(false);

  // Step 2: Bio-data
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [lrn, setLrn] = useState("");
  const [psaBirthCertNo, setPsaBirthCertNo] = useState("");
  const [email, setEmail] = useState("");

  // Step 3: Address & Family
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianContact, setGuardianContact] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState("");
  const [isCustomRelationship, setIsCustomRelationship] = useState(false);
  const [fatherName, setFatherName] = useState("");
  const [motherMaidenName, setMotherMaidenName] = useState("");

  // Step 4: Enrollment Details
  const [gradeLevel, setGradeLevel] = useState("");
  const [studentType, setStudentType] = useState<
    "new" | "transferee" | "returning" | "old"
  >("new");
  const [learnerType, setLearnerType] = useState<
    "elementary" | "junior_high" | "senior_high"
  >("elementary");
  const [shsTrack, setShsTrack] = useState<string>("");
  const [lastGradeLevelCompleted, setLastGradeLevelCompleted] = useState("");
  const [lastSchoolYearCompleted, setLastSchoolYearCompleted] = useState("");
  const [lastSchoolName, setLastSchoolName] = useState("");
  const [lastSchoolId, setLastSchoolId] = useState("");
  const [lastSchoolAddress, setLastSchoolAddress] = useState("");

  const [isEsc, setIsEsc] = useState(false);
  const [isShsVoucher, setIsShsVoucher] = useState(false);

  // Success state
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  function reset() {
    setStep(1);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedStudent(null);
    setIsNewStudent(false);
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setSuffix("");
    setBirthdate("");
    setGender("");
    setLrn("");
    setPsaBirthCertNo("");
    setEmail("");
    setAddress("");
    setZipCode("");
    setGuardianName("");
    setGuardianContact("");
    setGuardianRelationship("");
    setIsCustomRelationship(false);
    setFatherName("");
    setMotherMaidenName("");
    setGradeLevel("");
    setStudentType("new");
    setLearnerType("elementary");
    setShsTrack("");
    setLastGradeLevelCompleted("");
    setLastSchoolYearCompleted("");
    setLastSchoolName("");
    setLastSchoolId("");
    setLastSchoolAddress("");
    setIsEsc(false);
    setIsShsVoucher(false);
    setCredentials(null);
  }

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  // Filtered grade levels based on learner type
  const filteredGradeLevels =
    GRADE_LEVELS_BY_LEARNER_TYPE[learnerType] ??
    Object.keys(GRADE_LEVEL_LABELS);

  // Search handler with debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(async () => {
      const result = await searchStudentByLRN(searchQuery.trim());
      setSearchResults(result.data ?? []);
      setIsSearching(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  function handleSelectStudent(student: FoundStudent) {
    setSelectedStudent(student);
    setIsNewStudent(false);
    // Pre-fill bio data from existing student
    setFirstName(student.firstName ?? "");
    setMiddleName(student.middleName ?? "");
    setLastName(student.lastName ?? "");
    setSuffix(student.suffix ?? "");
    setBirthdate(student.birthdate ?? "");
    setGender((student.gender as "male" | "female") ?? "");
    setLrn(student.lrn ?? "");
    setPsaBirthCertNo(student.psaBirthCertNo ?? "");
    setEmail(student.email);
    setAddress(student.address ?? "");
    setZipCode(student.zipCode ?? "");
    setGuardianName(student.guardianName ?? "");
    setGuardianContact(student.guardianContact ?? "");
    setFatherName(student.fatherName ?? "");
    setMotherMaidenName(student.motherMaidenName ?? "");
    setStudentType("old");
    setStep(2);
  }

  function handleNewStudent() {
    setSelectedStudent(null);
    setIsNewStudent(true);
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setSuffix("");
    setBirthdate("");
    setGender("");
    setLrn("");
    setPsaBirthCertNo("");
    setEmail("");
    setAddress("");
    setZipCode("");
    setGuardianName("");
    setGuardianContact("");
    setGuardianRelationship("");
    setIsCustomRelationship(false);
    setFatherName("");
    setMotherMaidenName("");
    setLastGradeLevelCompleted("");
    setLastSchoolYearCompleted("");
    setLastSchoolName("");
    setLastSchoolId("");
    setLastSchoolAddress("");
    setStudentType("new");
    setStep(2);
  }

  async function handleStep2Next() {
    if (!(firstName && lastName && birthdate && gender)) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (isNewStudent && !email) {
      toast.error("Email is required for new students");
      return;
    }

    if (isNewStudent && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (lrn && !/^\d{12}$/.test(lrn)) {
      toast.error("LRN must be exactly 12 digits");
      return;
    }

    if (isNewStudent) {
      startTransition(async () => {
        const res = await checkStudentIdentity(email, lrn || undefined);
        if ("error" in res && res.error) {
          toast.error(res.error);
          return;
        }
        if ("duplicate" in res && res.duplicate && "message" in res) {
          toast.error(res.message);
          return;
        }
        setStep(3);
      });
    } else {
      setStep(3);
    }
  }

  function handleStep3Next() {
    if (
      !(
        address &&
        zipCode &&
        guardianName &&
        guardianContact &&
        guardianRelationship
      )
    ) {
      toast.error("Please fill in all required fields (marked with *)");
      return;
    }

    if (guardianContact.length !== 11) {
      toast.error(
        "Guardian contact number must be exactly 11 digits (e.g., 09123456789)",
      );
      return;
    }
    setStep(4);
  }

  function handleStep4Next() {
    if (!gradeLevel) {
      toast.error("Please select a grade level");
      return;
    }
    if (!activeSY) {
      toast.error("No active school year. Please activate one first.");
      return;
    }
    if (learnerType === "senior_high" && !shsTrack) {
      toast.error("Please select an SHS track");
      return;
    }
    setStep(5);
  }

  function handleSubmit() {
    if (!gradeLevel) {
      toast.error("Please select a grade level");
      return;
    }
    if (!activeSY) {
      toast.error("No active school year. Please activate one first.");
      return;
    }

    startTransition(async () => {
      const payload = selectedStudent
        ? {
            existingStudentId: selectedStudent.id,
            gradeLevel: gradeLevel as Parameters<
              typeof enrollStudentForSY
            >[0]["gradeLevel"],
            studentType: studentType as
              | "new"
              | "transferee"
              | "returning"
              | "old",
            learnerType: learnerType as
              | "elementary"
              | "junior_high"
              | "senior_high",
            shsTrack: (shsTrack as "academic" | "tech_pro") || undefined,
            schoolYearId: activeSY.id,
            guardianRelationship: guardianRelationship || undefined,
            lastGradeLevelCompleted,
            lastSchoolYearCompleted,
            lastSchoolName,
            lastSchoolId,
            lastSchoolAddress,
            isEsc,
            isShsVoucher,
          }
        : {
            email,
            firstName,
            middleName: middleName || undefined,
            lastName,
            suffix: suffix || undefined,
            birthdate,
            gender: gender as "male" | "female",
            lrn: lrn || undefined,
            psaBirthCertNo: psaBirthCertNo || undefined,
            address: address || undefined,
            zipCode: zipCode || undefined,
            guardianName: guardianName || undefined,
            guardianContact: guardianContact || undefined,
            guardianRelationship: guardianRelationship || undefined,
            fatherName: fatherName || undefined,
            motherMaidenName: motherMaidenName || undefined,
            gradeLevel: gradeLevel as Parameters<
              typeof enrollStudentForSY
            >[0]["gradeLevel"],
            studentType: studentType as
              | "new"
              | "transferee"
              | "returning"
              | "old",
            learnerType: learnerType as
              | "elementary"
              | "junior_high"
              | "senior_high",
            shsTrack: (shsTrack as "academic" | "tech_pro") || undefined,
            schoolYearId: activeSY.id,

            lastGradeLevelCompleted,
            lastSchoolYearCompleted,
            lastSchoolName,
            lastSchoolId,
            lastSchoolAddress,
            isEsc,
            isShsVoucher,
          };

      const res = await enrollStudentForSY(payload);
      if ("error" in res && res.error) {
        toast.error(res.error);
      } else if ("newCredentials" in res && res.newCredentials) {
        setCredentials(res.newCredentials);
      } else {
        toast.success("Enrollment form created successfully!");
        handleClose();
      }
    });
  }

  if (!open) {
    return null;
  }

  const stepLabels = ["Identity", "Bio-data", "Family", "Details", "Review"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-linear-to-r from-indigo-600 to-indigo-700 px-6 py-4">
          <div>
            <h3 className="font-semibold text-lg text-white">
              Student Enrollment Wizard
            </h3>
            <p className="mt-0.5 text-indigo-200 text-sm">
              {activeSY
                ? `Enrolling for: ${activeSY.name}`
                : "No active school year"}
            </p>
          </div>
          <button
            className="text-indigo-200 transition-colors hover:text-white"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Indicator */}
        {!credentials && (
          <div className="px-6 pt-4 pb-2">
            <div className="flex items-center gap-2">
              {stepLabels.map((label, i) => {
                const stepNum = (i + 1) as Step;
                const isCurrent = step === stepNum;
                const isDone = step > stepNum;
                return (
                  <div className="flex flex-1 items-center gap-2" key={i}>
                    <div
                      className={`flex min-w-0 items-center gap-2 ${i > 0 ? "flex-1" : ""}`}
                    >
                      {i > 0 && (
                        <div
                          className={`h-px flex-1 ${isDone ? "bg-indigo-400" : "bg-gray-200"}`}
                        />
                      )}
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-bold text-sm transition-colors ${
                          isDone
                            ? "bg-green-500 text-white"
                            : isCurrent
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          stepNum
                        )}
                      </div>
                    </div>
                    <span
                      className={`whitespace-nowrap text-xs ${isCurrent ? "font-medium text-indigo-700" : isDone ? "text-green-600" : "text-gray-400"}`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* ── Success / Credentials Screen ── */}
          {credentials && (
            <div className="space-y-4 py-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">
                  Enrollment Created!
                </h4>
                <p className="mt-1 text-gray-500 text-sm">
                  New student account credentials — share with guardian:
                </p>
              </div>
              <div className="space-y-2 rounded-lg border bg-gray-50 p-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs uppercase tracking-wide">
                    Email
                  </span>
                  <span className="font-mono text-gray-900 text-sm">
                    {credentials.email}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs uppercase tracking-wide">
                    Password
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-indigo-700 text-sm">
                      {credentials.password}
                    </span>
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => {
                        navigator.clipboard.writeText(credentials.password);
                        toast.success("Copied!");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <p className="rounded border border-amber-200 bg-amber-50 p-2 text-amber-600 text-xs">
                ⚠️ Note this password now — it won&apos;t be shown again. The
                student must change it on first login.
              </p>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={handleClose}
              >
                Done
              </Button>
            </div>
          )}

          {/* ── Step 1: Identity Check ── */}
          {!credentials && step === 1 && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Search by LRN or student name to find an existing student, or
                create a new record.
              </p>
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  autoFocus
                  className="pl-10"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter LRN or student name..."
                  value={searchQuery}
                />
                {isSearching && (
                  <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="divide-y overflow-hidden rounded-lg border">
                  {searchResults.map((s) => (
                    <button
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-indigo-50"
                      key={s.id}
                      onClick={() => handleSelectStudent(s)}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                        <UserCheck className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 text-sm">
                          {s.firstName} {s.middleName ? `${s.middleName} ` : ""}
                          {s.lastName}
                          {s.archivedAt && (
                            <Badge className="ml-2 border-red-200 bg-red-100 text-[10px] text-red-700">
                              Archived
                            </Badge>
                          )}
                        </div>
                        <div className="text-gray-500 text-xs">
                          LRN: {s.lrn ?? "—"} · {s.email}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.trim().length >= 2 &&
                !isSearching &&
                searchResults.length === 0 && (
                  <p className="py-2 text-center text-gray-500 text-sm">
                    No existing students found.
                  </p>
                )}

              <div className="border-t pt-2">
                <Button
                  className="w-full gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  onClick={handleNewStudent}
                  variant="outline"
                >
                  <UserPlus className="h-4 w-4" />
                  Create New Student Record
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: Bio-data ── */}
          {!credentials && step === 2 && (
            <div className="space-y-4">
              {selectedStudent && (
                <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2">
                  <UserCheck className="h-4 w-4 shrink-0 text-indigo-600" />
                  <span className="font-medium text-indigo-900 text-sm">
                    Existing student found — verify or update details below
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <Label>
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Juan"
                    value={firstName}
                  />
                </div>
                <div>
                  <Label>Middle Name</Label>
                  <Input
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="(optional)"
                    value={middleName}
                  />
                </div>
                <div>
                  <Label>
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dela Cruz"
                    value={lastName}
                  />
                </div>
                <div>
                  <Label>Suffix</Label>
                  <Input
                    onChange={(e) => setSuffix(e.target.value)}
                    placeholder="(optional)"
                    value={suffix}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>
                    Birthdate <span className="text-red-500">*</span>
                  </Label>
                  <DatePicker onChange={setBirthdate} value={birthdate} />
                </div>
                <div>
                  <Label>
                    Gender <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(v) => setGender(v as "male" | "female")}
                    value={gender}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>LRN</Label>
                  <Input
                    maxLength={12}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setLrn(val);
                    }}
                    placeholder="12-digit LRN"
                    value={lrn}
                  />
                </div>
                <div>
                  <Label>PSA Birth Cert No.</Label>
                  <Input
                    onChange={(e) => setPsaBirthCertNo(e.target.value)}
                    placeholder="(optional)"
                    value={psaBirthCertNo}
                  />
                </div>
              </div>

              <div>
                <Label>
                  Email{" "}
                  {isNewStudent && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  disabled={!!selectedStudent}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  placeholder="student@email.com"
                  type="email"
                  value={email}
                />
                {selectedStudent && (
                  <p className="mt-1 text-gray-400 text-xs">
                    Email cannot be changed here
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Step 3: Address & Family ── */}
          {!credentials && step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Label>
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Block/Lot, Street, Barangay, City/Municipality, Province"
                    value={address}
                  />
                </div>
                <div>
                  <Label>
                    Zip Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    maxLength={10}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setZipCode(val);
                    }}
                    placeholder="e.g. 1000"
                    value={zipCode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Father&apos;s Name</Label>
                  <Input
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="Full Name"
                    value={fatherName}
                  />
                </div>
                <div>
                  <Label>Mother&apos;s Maiden Name</Label>
                  <Input
                    onChange={(e) => setMotherMaidenName(e.target.value)}
                    placeholder="Full Maiden Name"
                    value={motherMaidenName}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>
                    Relationship to Guardian{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(v) => {
                      if (v === "Other") {
                        setIsCustomRelationship(true);
                        setGuardianRelationship("");
                        setGuardianName("");
                      } else {
                        setIsCustomRelationship(false);
                        setGuardianRelationship(v);
                        if (v === "Father") {
                          setGuardianName(fatherName);
                        } else if (v === "Mother") {
                          setGuardianName(motherMaidenName);
                        } else {
                          setGuardianName("");
                        }
                      }
                    }}
                    value={
                      isCustomRelationship ? "Other" : guardianRelationship
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIP_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {isCustomRelationship && (
                  <div>
                    <Label className="text-gray-400 text-xs">
                      Specify Other <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      autoFocus
                      onChange={(e) => setGuardianRelationship(e.target.value)}
                      placeholder="e.g. Stepparent"
                      value={guardianRelationship}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>
                    Guardian Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="Full Name"
                    value={guardianName}
                  />
                </div>
                <div>
                  <Label>
                    Guardian Contact No. <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className={
                      guardianContact && guardianContact.length !== 11
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                    maxLength={11}
                    onChange={(e) => {
                      const val = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 11);
                      setGuardianContact(val);
                    }}
                    placeholder="09123456789"
                    value={guardianContact}
                  />
                  {guardianContact && guardianContact.length !== 11 && (
                    <p className="mt-1 font-medium text-[10px] text-red-500">
                      Exactly 11 digits ({guardianContact.length}/11)
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Enrollment Details ── */}
          {!credentials && step === 4 && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-gray-50 p-3">
                <p className="mb-1 text-gray-500 text-xs">Enrolling</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">
                    {firstName} {lastName}
                  </p>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <p className="font-medium text-indigo-600 text-sm">
                    {activeSY?.name ?? "No active SY"}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 grid-cols-2">
                <div>
                  <Label>
                    Learner Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(v) => {
                      const nextVal = v as
                        | "elementary"
                        | "junior_high"
                        | "senior_high";
                      setLearnerType(nextVal);
                      setGradeLevel("");
                      setShsTrack("");
                      setLastGradeLevelCompleted("");
                      setLastSchoolYearCompleted("");
                      setLastSchoolName("");
                      setLastSchoolId("");
                      setLastSchoolAddress("");
                    }}
                    value={learnerType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Learner type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LEARNER_TYPE_LABELS).map(
                        ([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>
                    Grade Level <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(v) => {
                      setGradeLevel(v);
                      // Reset tags when grade level changes
                      setIsEsc(false);
                      setIsShsVoucher(false);
                    }}
                    value={gradeLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Grade..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredGradeLevels.map((key) => (
                        <SelectItem key={key} value={key}>
                          {
                            GRADE_LEVEL_LABELS[
                              key as keyof typeof GRADE_LEVEL_LABELS
                            ]
                          }
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tagging Section (Linked per Enrollment) */}
              {["grade_7", "grade_8", "grade_9", "grade_10"].includes(
                gradeLevel,
              ) && (
                <div className="space-y-3 rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-indigo-900">ESC Grantee</Label>
                      <p className="text-indigo-600/70 text-[10px]">
                        Educational Service Contracting
                      </p>
                    </div>
                    <Switch checked={isEsc} onCheckedChange={setIsEsc} />
                  </div>
                </div>
              )}

              {["grade_11", "grade_12"].includes(gradeLevel) && (
                <div className="space-y-3 rounded-lg border border-amber-100 bg-amber-50/50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-amber-900">SHVP</Label>
                      <p className="text-amber-600/70 text-[10px]">
                        Senior High Voucher Program
                      </p>
                    </div>
                    <Switch
                      checked={isShsVoucher}
                      onCheckedChange={setIsShsVoucher}
                    />
                  </div>
                </div>
              )}

              {learnerType === "senior_high" && (
                <div>
                  <Label>
                    SHS Track <span className="text-red-500">*</span>
                  </Label>
                  <Select onValueChange={setShsTrack} value={shsTrack}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select track..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SHS_TRACK_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Student Type</Label>
                <Select
                  onValueChange={(v) =>
                    setStudentType(
                      v as "new" | "transferee" | "returning" | "old",
                    )
                  }
                  value={studentType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STUDENT_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(learnerType !== "senior_high" ||
                studentType === "transferee" ||
                studentType === "returning") && (
                <>
                  <div className="rounded border-t pt-3" />
                  <p className="font-semibold text-gray-800 text-sm">
                    Education History
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Last Grade Level Completed</Label>
                      <Input
                        onChange={(e) =>
                          setLastGradeLevelCompleted(e.target.value)
                        }
                        placeholder="e.g. Grade 5"
                        value={lastGradeLevelCompleted}
                      />
                    </div>
                    <div>
                      <Label>Last School Year Completed</Label>
                      <Input
                        onChange={(e) =>
                          setLastSchoolYearCompleted(e.target.value)
                        }
                        placeholder="e.g. 2023-2024"
                        value={lastSchoolYearCompleted}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Last School Name</Label>
                      <Input
                        onChange={(e) => setLastSchoolName(e.target.value)}
                        placeholder="Previous School Name"
                        value={lastSchoolName}
                      />
                    </div>
                    <div>
                      <Label>Last School ID</Label>
                      <Input
                        onChange={(e) => setLastSchoolId(e.target.value)}
                        placeholder="Optional"
                        value={lastSchoolId}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Last School Address</Label>
                    <Input
                      onChange={(e) => setLastSchoolAddress(e.target.value)}
                      placeholder="Street, City, Province"
                      value={lastSchoolAddress}
                    />
                  </div>
                </>
              )}

              {!activeSY && (
                <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
                  ⚠️ No active school year. Please activate a school year before
                  enrolling.
                </div>
              )}
            </div>
          )}

          {/* ── Step 5: Review & Confirm ── */}
          {!credentials && step === 5 && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Please review all information carefully before completing
                enrollment.
              </p>

              {/* Personal Info */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
                <h4 className="font-semibold text-indigo-900 text-sm border-b pb-1.5">
                  Personal & Account Details
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-400 text-xs block">
                      Full Name
                    </span>
                    <span className="font-medium text-gray-900">
                      {firstName} {middleName ? `${middleName} ` : ""}
                      {lastName} {suffix}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">
                      Email Address
                    </span>
                    <span className="font-medium text-gray-900">{email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">
                      Birthdate
                    </span>
                    <span className="font-medium text-gray-900">
                      {birthdate
                        ? formatPH(birthdate, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">Gender</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {gender || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">LRN</span>
                    <span className="font-medium font-mono text-gray-900">
                      {lrn || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">
                      PSA Birth Cert No.
                    </span>
                    <span className="font-medium text-gray-900">
                      {psaBirthCertNo || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address & Family */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
                <h4 className="font-semibold text-indigo-900 text-sm border-b pb-1.5">
                  Address & Family Records
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="col-span-2">
                    <span className="text-gray-400 text-xs block">Address</span>
                    <span className="font-medium text-gray-900">
                      {address} (Zip: {zipCode})
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">
                      Father&apos;s Name
                    </span>
                    <span className="font-medium text-gray-900">
                      {fatherName || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">
                      Mother&apos;s Maiden Name
                    </span>
                    <span className="font-medium text-gray-900">
                      {motherMaidenName || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">
                      Guardian
                    </span>
                    <span className="font-medium text-gray-900">
                      {guardianName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">
                      Guardian Contact & Relation
                    </span>
                    <span className="font-medium text-gray-900">
                      {guardianContact} ({guardianRelationship})
                    </span>
                  </div>
                </div>
              </div>

              {/* Enrollment Details */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
                <h4 className="font-semibold text-indigo-900 text-sm border-b pb-1.5">
                  Enrollment Details
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-400 text-xs block">
                      School Year
                    </span>
                    <span className="font-medium text-gray-900">
                      {activeSY?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">
                      Student Type
                    </span>
                    <span className="font-medium text-gray-900 capitalize">
                      {STUDENT_TYPE_LABELS[studentType] || studentType}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">
                      Level & Grade
                    </span>
                    <span className="font-medium text-gray-900">
                      {LEARNER_TYPE_LABELS[learnerType]} -{" "}
                      {GRADE_LEVEL_LABELS[
                        gradeLevel as keyof typeof GRADE_LEVEL_LABELS
                      ] || gradeLevel}
                    </span>
                  </div>
                  {shsTrack && (
                    <div>
                      <span className="text-gray-400 text-xs block">
                        SHS Track
                      </span>
                      <span className="font-medium text-gray-900">
                        {SHS_TRACK_LABELS[
                          shsTrack as keyof typeof SHS_TRACK_LABELS
                        ] || shsTrack}
                      </span>
                    </div>
                  )}
                  {isEsc && (
                    <div>
                      <span className="text-gray-400 text-xs block">
                        ESC Grantee
                      </span>
                      <span className="font-medium text-green-600 font-semibold">
                        Yes
                      </span>
                    </div>
                  )}
                  {isShsVoucher && (
                    <div>
                      <span className="text-gray-400 text-xs block">
                        SHS Voucher Program
                      </span>
                      <span className="font-medium text-green-600 font-semibold">
                        Yes
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Education History */}
              {(lastGradeLevelCompleted ||
                lastSchoolYearCompleted ||
                lastSchoolName) && (
                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
                  <h4 className="font-semibold text-indigo-900 text-sm border-b pb-1.5">
                    Education History
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-400 text-xs block">
                        Last Grade Completed
                      </span>
                      <span className="font-medium text-gray-900">
                        {lastGradeLevelCompleted || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs block">
                        Last School Year
                      </span>
                      <span className="font-medium text-gray-900">
                        {lastSchoolYearCompleted || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs block">
                        School Name & ID
                      </span>
                      <span className="font-medium text-gray-900">
                        {lastSchoolName || "—"}{" "}
                        {lastSchoolId ? `(ID: ${lastSchoolId})` : ""}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs block">
                        School Address
                      </span>
                      <span className="font-medium text-gray-900">
                        {lastSchoolAddress || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!credentials && (
          <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
            <Button
              className="gap-2"
              disabled={isPending}
              onClick={() =>
                step === 1 ? handleClose() : setStep((step - 1) as Step)
              }
              variant="ghost"
            >
              <ChevronLeft className="h-4 w-4" />
              {step === 1 ? "Cancel" : "Back"}
            </Button>

            {step === 1 && (
              <p className="text-gray-400 text-xs">
                Search above or click &quot;Create New&quot;
              </p>
            )}

            {step === 2 && (
              <Button
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                disabled={isPending}
                onClick={handleStep2Next}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}

            {step === 3 && (
              <Button
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                onClick={handleStep3Next}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}

            {step === 4 && (
              <Button
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                onClick={handleStep4Next}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}

            {step === 5 && (
              <Button
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                disabled={isPending || !activeSY || !gradeLevel}
                onClick={handleSubmit}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {isPending ? "Creating..." : "Confirm & Create"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
