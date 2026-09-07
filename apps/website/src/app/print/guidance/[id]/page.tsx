import { GRADE_LEVEL_LABELS, SCHOOL_INFO } from "@school/api/constants";
import {
  CIVIL_STATUS_OPTIONS,
  EDUCATIONAL_ATTAINMENT_OPTIONS,
  INCOME_BRACKET_OPTIONS,
} from "@school/api/guidance/constants";
import { getGuidancePrintData } from "@school/api/print/query";
import Image from "next/image";
import { notFound } from "next/navigation";
import { formatPH } from "@/lib/utils";
import type { ProfileState } from "../../../dashboard/staff/guidance/_components/guidance-dashboard";

/** Lookup a label from a { value, label } option array */
function optionLabel(
  options: readonly { value: string; label: string }[],
  value: string | undefined | null,
): string {
  if (!value) return "";
  return options.find((o) => o.value === value)?.label ?? value;
}

/** Checkbox rendering helper */
function Checkbox({
  label,
  checked,
  specify,
  specifyBelow = false,
  className = "",
}: {
  label: string;
  checked?: boolean;
  specify?: string;
  specifyBelow?: boolean;
  className?: string;
}) {
  if (specifyBelow) {
    return (
      <div
        className={`flex flex-col gap-0.5 text-[10pt] leading-tight ${className}`}
      >
        <span className="inline-flex items-baseline gap-1">
          <span className="font-bold shrink-0">{checked ? "(✓)" : "( )"}</span>
          <span className="shrink-0">{label}</span>
        </span>
        <span className="border-b border-gray-800 px-1 block w-full text-center min-h-[16px]">
          {specify || ""}
        </span>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-baseline gap-1 text-[10pt] leading-tight ${className}`}
    >
      <span className="font-bold shrink-0">{checked ? "(✓)" : "( )"}</span>
      <span>{label}</span>
      {specify !== undefined && (
        <span className="border-b border-gray-800 px-1 inline-block min-w-[60px] text-center">
          {specify || ""}
        </span>
      )}
    </span>
  );
}

/** Underlined field line helper */
function LineField({
  label,
  value,
  className = "",
}: {
  label: string;
  value?: string | null;
  className?: string;
}) {
  return (
    <div className={`flex items-baseline text-[10pt] my-0 ${className}`}>
      <span className="font-normal shrink-0 mr-1 text-gray-900">{label}:</span>
      <span className="grow border-b border-gray-800 px-1 font-medium text-gray-900 min-h-[17px] leading-snug">
        {value || ""}
      </span>
    </div>
  );
}

/** Address block helper with full-width underline lines */
function AddressBlock({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  const hasValue = Boolean(value && value.trim());
  return (
    <div className="my-0.5 text-[10pt]">
      <p className="font-normal text-gray-900 mb-0 leading-tight">{label}:</p>
      <div
        className="font-medium text-gray-900 min-h-[40px] px-1"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, transparent 19px, #1f2937 19px, #1f2937 20px)",
          backgroundSize: "100% 20px",
          lineHeight: "20px",
        }}
      >
        {hasValue ? value : ""}
      </div>
    </div>
  );
}

/** Full-width line field helper where label sits on top of underline */
function FullLineField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="my-0 text-[10pt]">
      <p className="font-normal text-gray-900 mb-0 leading-tight">{label}:</p>
      <div className="border-b border-gray-800 font-medium text-gray-900 min-h-[17px] px-1 leading-snug">
        {value || ""}
      </div>
    </div>
  );
}

export default async function GuidancePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const formId = Number.parseInt(id, 10);

  if (Number.isNaN(formId)) {
    notFound();
  }

  const data = await getGuidancePrintData(formId);

  if (!data || !data.statusGuidanceDone) {
    notFound();
  }

  const profile = (data.statusGuidanceProfile || {}) as Partial<ProfileState>;
  const needs = (data.statusGuidanceNeeds || {}) as Record<
    string,
    boolean | string[]
  >;

  function isNeedChecked(
    rawNeeds: Record<string, boolean | string[]>,
    itemId: string,
  ): boolean {
    if (!rawNeeds) return false;
    if (typeof rawNeeds[itemId] === "boolean") return rawNeeds[itemId];
    for (const key in rawNeeds) {
      const val = rawNeeds[key];
      if (Array.isArray(val) && val.includes(itemId)) {
        return true;
      }
    }
    return false;
  }

  const father = (profile.father || {}) as NonNullable<ProfileState["father"]>;
  const mother = (profile.mother || {}) as NonNullable<ProfileState["mother"]>;
  const guardian = (profile.guardian || {}) as NonNullable<
    ProfileState["guardian"]
  >;
  const siblings: { name: string; schoolWork: string }[] =
    profile.siblings || [];
  const householdMembers: { name: string; relationship: string }[] =
    profile.householdMembers || [];

  // Format LRN digits (up to 12 digits)
  const lrnDigits = (data.lrn || "")
    .replace(/\D/g, "")
    .padEnd(12, " ")
    .split("");

  const gradeLabel =
    GRADE_LEVEL_LABELS[data.gradeLevel as keyof typeof GRADE_LEVEL_LABELS] ||
    data.gradeLevel;

  return (
    <div
      className="mx-auto max-w-[800px] bg-white p-4 text-gray-900 text-[10pt] leading-normal print:p-0 print:max-w-none"
      style={{ fontFamily: "Cambria, Georgia, serif" }}
    >
      {/* ================= PAGE 1 ================= */}
      <div className="print-page border-b print:border-none pb-6 print:pb-0 mb-6 print:mb-0">
        {/* Dual Logo Header */}
        <div className="flex items-center justify-between border-b-2 border-red-600 pb-1 mb-1.5">
          <div className="flex items-center gap-3">
            <Image
              alt="School Logo"
              className="h-12 w-12 object-contain"
              height={48}
              src="/logo.webp"
              width={48}
            />
            <div>
              <h1 className="text-sm uppercase tracking-tight text-gray-900">
                {SCHOOL_INFO.name}
              </h1>
              <p className="text-xs font-bold text-gray-800">
                Student Welfare Services Unit
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <Image
              alt="Guidance Logo"
              className="h-12 w-12 object-contain"
              height={48}
              src="/logo_education.webp"
              width={48}
            />
            <span className="text-[7pt] text-gray-900 mt-0.5 tracking-tight">
              August, 2022
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-1.5">
          <h2 className="text-[12pt] font-bold tracking-wide uppercase text-gray-900">
            STUDENT&apos;S PERSONAL INFORMATION SHEET
          </h2>
        </div>

        {/* Top Meta & 2x2 Picture Row */}
        <div className="flex justify-between items-start gap-4 mb-1.5">
          <div className="grow space-y-1">
            <div className="flex gap-6">
              <div className="flex items-baseline">
                <span className="font-normal mr-1 text-gray-900">
                  School Year:
                </span>
                <span className="border-b border-gray-800 px-2 font-medium min-w-[100px] inline-block text-center">
                  {data.schoolYearName || ""}
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="font-normal mr-1 text-gray-900">
                  Grade Applied:
                </span>
                <span className="border-b border-gray-800 px-2 font-medium min-w-[100px] inline-block text-center">
                  {gradeLabel || ""}
                </span>
              </div>
            </div>

            <div>
              <p className="font-normal mb-0.5 text-gray-900 leading-tight">
                Learner Reference Number:
              </p>
              <div className="flex gap-1">
                {lrnDigits.map((digit, idx) => (
                  <div
                    className="w-5.5 h-6 border border-gray-800 flex items-center justify-center font-mono font-bold text-xs bg-gray-50 print:bg-transparent"
                    key={`lrn-box-${idx}`}
                  >
                    {digit !== " " ? digit : ""}
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <p className="text-[9pt] font-bold pt-0.5 uppercase tracking-tight text-gray-900 leading-tight">
              INSTRUCTION:{" "}
              <span className="font-normal normal-case">
                Please fill out the following information needed in PRINT and
                use black ink.
              </span>
            </p>
          </div>

          {/* 2x2 Picture Frame */}
          <div className="w-[1.4in] h-[1.4in] border border-gray-800 flex flex-col items-center justify-center text-center p-2 shrink-0 bg-gray-50 print:bg-transparent -mt-4">
            <span className="text-xs font-semibold text-gray-600">
              2x2 picture
            </span>
            <span className="text-[10px] text-gray-500">with name tag</span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {/* LEFT COLUMN */}
          <div>
            {/* Personal Information */}
            <div className="mb-2">
              <h3 className="text-[13px] font-bold uppercase text-red-600 text-center mb-0 leading-tight">
                PERSONAL INFORMATION
              </h3>
              <p className="text-[9pt] font-normal italic text-gray-800 text-center mb-0.5 leading-tight">
                *Full name as appeared in the PSA Birth Certificate
              </p>
              <LineField label="Surname" value={data.lastName} />
              <LineField label="Given Name" value={data.firstName} />
              <LineField label="Middle Name" value={data.middleName} />
              <div className="flex items-center my-0">
                <span className="font-normal text-gray-900 w-24 shrink-0">
                  Sex:
                </span>
                <div className="flex items-center gap-10">
                  <Checkbox
                    checked={data.gender?.toLowerCase() === "male"}
                    label="Male"
                  />
                  <Checkbox
                    checked={data.gender?.toLowerCase() === "female"}
                    label="Female"
                  />
                </div>
              </div>
              <LineField label="Nationality" value={profile.nationality} />
              <LineField
                label="Birthday"
                value={formatPH(data.birthdate, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              />
              <LineField label="Birthplace" value={profile.birthplace} />
              <LineField label="Birth Order" value={profile.birthOrder} />
              <LineField label="Religion" value={profile.religion} />
              <LineField
                label="Personal Contact No."
                value={profile.personalContact}
              />
            </div>

            {/* Home Information */}
            <div className="mb-2">
              <h3 className="text-[13px] font-bold uppercase text-red-600 text-center mb-0.5 leading-tight">
                HOME INFORMATION
              </h3>
              <AddressBlock
                label="Permanent Address"
                value={
                  profile.sameAddress
                    ? profile.currentAddress
                    : profile.permanentAddress
                }
              />
              <AddressBlock
                label="Current Address"
                value={profile.currentAddress}
              />

              <div className="mt-1.5">
                <p className="font-normal text-[10pt] text-gray-900 leading-tight">
                  Do you have other family member(s) living with you?
                </p>
                <div className="my-0">
                  <Checkbox
                    checked={householdMembers.length > 0}
                    className="mr-3"
                    label="Yes"
                  />
                  <Checkbox
                    checked={householdMembers.length === 0}
                    label="No"
                  />
                </div>
                <p className="text-[10pt] font-normal text-gray-900 mb-0.5 leading-tight">
                  If yes, please specify below
                </p>
                <div className="mt-0.5 space-y-0.5">
                  <div className="grid grid-cols-2 gap-x-6 text-[10pt] font-normal text-gray-900 text-center">
                    <span>Name</span>
                    <span>Relationship</span>
                  </div>
                  {Array.from({
                    length: Math.max(4, householdMembers.length),
                  }).map((_, i) => {
                    const member = householdMembers[i];
                    return (
                      <div
                        className="grid grid-cols-2 gap-x-6 text-[10pt] text-center items-baseline"
                        key={`hm-row-${i}`}
                      >
                        <span className="border-b border-gray-800 min-h-[17px] px-1 leading-snug">
                          {member?.name || ""}
                        </span>
                        <span className="border-b border-gray-800 min-h-[17px] px-1 leading-snug">
                          {member?.relationship || ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Parents' Information - Father */}
            <div>
              <h3 className="text-[13px] font-bold uppercase text-red-600 text-center mb-1">
                PARENTS&apos; INFORMATION
              </h3>
              <p className="font-bold text-gray-900 text-sm mb-0.5 leading-tight">
                Father
              </p>
              <LineField
                label="Surname"
                value={
                  father.lastName ||
                  ((father as Record<string, unknown>).name as string)
                }
              />
              <LineField label="Given Name" value={father.firstName} />
              <LineField label="Middle Name" value={father.middleName} />
              <LineField label="Birthday" value={father.birthday} />
              <LineField label="Religion" value={father.religion} />
              <LineField label="Contact No." value={father.contact} />
              <FullLineField
                label="Highest Educational Attainment"
                value={optionLabel(
                  EDUCATIONAL_ATTAINMENT_OPTIONS,
                  father.education,
                )}
              />
              <p className="font-normal text-gray-900 text-[10pt] mt-0 mb-0 leading-tight">
                Occupation:
              </p>

              <div className="grid grid-cols-2 gap-y-0 gap-x-2 text-[10pt] my-0 pl-2">
                <Checkbox
                  checked={father.occupationType === "government"}
                  label="Government Employee"
                />
                <Checkbox
                  checked={father.occupationType === "private"}
                  label="Private Employee"
                />
                <Checkbox
                  checked={father.occupationType === "self_employed"}
                  label="Self-Employed"
                />
                <Checkbox
                  checked={father.occupationType === "housewife"}
                  label="Housewife"
                />
                <Checkbox
                  checked={father.occupationType === "retired"}
                  label="Retired"
                />
                <Checkbox
                  checked={father.occupationType === "ofw"}
                  label="OFW at"
                  specify={
                    father.occupationType === "ofw"
                      ? father.ofwLocation || ""
                      : ""
                  }
                />
              </div>

              <LineField label="Name of Company" value={father.companyName} />
              <LineField
                label="Company Address"
                value={father.companyAddress}
              />
              <LineField
                label="Company Contact No."
                value={father.companyContact}
              />

              <div className="mt-0.5 text-[10pt]">
                <p className="font-normal text-gray-900 mb-0 leading-tight">
                  Annual income (in pesos):
                </p>
                <div className="grid grid-cols-2 gap-y-0 gap-x-2 pl-4">
                  {INCOME_BRACKET_OPTIONS.map((inc) => (
                    <Checkbox
                      checked={(profile.familyIncome || "") === inc.value}
                      key={`f-inc-${inc.value}`}
                      label={inc.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            {/* Mother */}
            <div className="mb-2">
              <p className="font-bold text-gray-900 text-sm mb-0.5 leading-tight">
                Mother
              </p>
              <LineField
                label="Surname"
                value={
                  mother.lastName ||
                  ((mother as Record<string, unknown>).name as string)
                }
              />
              <LineField label="Given Name" value={mother.firstName} />
              <LineField label="Middle Name" value={mother.middleName} />
              <LineField label="Birthday" value={mother.birthday} />
              <LineField label="Religion" value={mother.religion} />
              <LineField label="Contact No." value={mother.contact} />
              <FullLineField
                label="Highest Educational Attainment"
                value={optionLabel(
                  EDUCATIONAL_ATTAINMENT_OPTIONS,
                  mother.education,
                )}
              />
              <p className="font-normal text-gray-900 text-[10pt] mt-0 mb-0 leading-tight">
                Occupation:
              </p>

              <div className="grid grid-cols-2 gap-y-0 gap-x-2 text-[10pt] my-0 pl-2">
                <Checkbox
                  checked={mother.occupationType === "government"}
                  label="Government Employee"
                />
                <Checkbox
                  checked={mother.occupationType === "private"}
                  label="Private Employee"
                />
                <Checkbox
                  checked={mother.occupationType === "self_employed"}
                  label="Self-Employed"
                />
                <Checkbox
                  checked={mother.occupationType === "housewife"}
                  label="Housewife"
                />
                <Checkbox
                  checked={mother.occupationType === "retired"}
                  label="Retired"
                />
                <Checkbox
                  checked={mother.occupationType === "ofw"}
                  label="OFW at"
                  specify={
                    mother.occupationType === "ofw"
                      ? mother.ofwLocation || ""
                      : ""
                  }
                />
              </div>
            </div>

            {/* Parents' Civil Status */}
            <div className="mb-1 text-[10pt]">
              <p className="font-normal text-gray-900 mb-0 leading-tight">
                Parents&apos; Civil Status:
              </p>
              <div className="grid grid-cols-2 gap-y-0 gap-x-2 pl-4">
                {CIVIL_STATUS_OPTIONS.filter((o) => o.value !== "single").map(
                  (cs) => (
                    <Checkbox
                      checked={profile.parentsCivilStatus === cs.value}
                      key={`pcs-${cs.value}`}
                      label={cs.label}
                    />
                  ),
                )}
              </div>
            </div>

            {/* Guardian */}
            <div className="mb-2">
              <p className="font-bold text-gray-900 text-sm mb-0.5 leading-tight">
                Guardian
              </p>
              <LineField
                label="Surname"
                value={
                  guardian.lastName ||
                  ((guardian as Record<string, unknown>).name as string)
                }
              />
              <LineField label="Given Name" value={guardian.firstName} />
              <LineField label="Middle Name" value={guardian.middleName} />
              <LineField label="Birthday" value={guardian.birthday} />
              <LineField label="Religion" value={guardian.religion} />
              <LineField label="Contact No." value={guardian.contact} />
              <FullLineField
                label="Highest Educational Attainment"
                value={optionLabel(
                  EDUCATIONAL_ATTAINMENT_OPTIONS,
                  guardian.education,
                )}
              />
              <p className="font-normal text-gray-900 text-[10pt] mt-0 mb-0 leading-tight">
                Occupation:
              </p>

              <div className="grid grid-cols-2 gap-y-0 gap-x-2 text-[10pt] my-0 pl-2">
                <Checkbox
                  checked={guardian.occupationType === "government"}
                  label="Government Employee"
                />
                <Checkbox
                  checked={guardian.occupationType === "private"}
                  label="Private Employee"
                />
                <Checkbox
                  checked={guardian.occupationType === "self_employed"}
                  label="Self-Employed"
                />
                <Checkbox
                  checked={guardian.occupationType === "housewife"}
                  label="Housewife"
                />
                <Checkbox
                  checked={guardian.occupationType === "retired"}
                  label="Retired"
                />
                <Checkbox
                  checked={guardian.occupationType === "ofw"}
                  label="OFW at"
                  specify={
                    guardian.occupationType === "ofw"
                      ? guardian.ofwLocation || ""
                      : ""
                  }
                />
              </div>

              <LineField label="Name of Company" value={guardian.companyName} />
              <LineField
                label="Company Address"
                value={guardian.companyAddress}
              />
              <LineField
                label="Company Contact No."
                value={guardian.companyContact}
              />
            </div>

            {/* Siblings Information */}
            <div>
              <h3 className="text-[13px] font-bold uppercase text-red-600 mb-0.5 leading-tight">
                SIBLING(S) INFORMATION:
              </h3>
              <p className="text-[9pt] font-normal italic text-gray-900 mb-1 leading-tight">
                * Name the siblings of the student from{" "}
                <span className="underline">eldest to youngest.</span>
              </p>

              <div className="mt-1 space-y-0.5">
                <div className="grid grid-cols-2 gap-x-3 text-[10pt] font-normal text-gray-900 text-center mb-0.5">
                  <span>Name</span>
                  <span>School/ Place of Work</span>
                </div>
                {Array.from({ length: Math.max(5, siblings.length) }).map(
                  (_, i) => {
                    const sib = siblings[i];
                    return (
                      <div
                        className="grid grid-cols-2 gap-x-3 text-[9pt] items-baseline my-0"
                        key={`sib-row-${i}`}
                      >
                        <div className="flex items-baseline gap-1">
                          <span className="font-normal shrink-0 w-4">
                            {i + 1}.
                          </span>
                          <span className="grow border-b border-gray-800 px-1 font-medium min-h-[17px] leading-snug text-center">
                            {sib?.name || ""}
                          </span>
                        </div>
                        <div className="flex items-baseline">
                          <span className="grow border-b border-gray-800 px-1 font-medium min-h-[17px] leading-snug text-center">
                            {sib?.schoolWork || ""}
                          </span>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PAGE 2 ================= */}
      <div className="print-page print:break-before-page pt-10 print:pt-12">
        <p className="font-bold italic text-[9.5pt] mb-3 text-gray-900 uppercase leading-tight">
          *THIS PART IS TO BE FILLED OUT BY PARENT OR GUARDIAN
        </p>

        {/* Student's Medical Profile */}
        <div className="mb-4">
          <h3 className="text-[13px] font-bold uppercase text-red-600 mb-0.5 leading-tight">
            STUDENT&apos;S MEDICAL PROFILE
          </h3>
          <p className="font-normal text-[10pt] mb-1 leading-tight">
            Does the student experience the following?
          </p>

          {/* 4 Column Medical Grid matching exact PDF layout */}
          <div className="grid grid-cols-4 gap-y-0 gap-x-2 text-[10px]">
            <Checkbox
              checked={isNeedChecked(needs, "allergy")}
              label="allergy/ies"
            />
            <Checkbox
              checked={isNeedChecked(needs, "arthritis")}
              label="arthritis"
            />
            <Checkbox checked={isNeedChecked(needs, "asthma")} label="asthma" />
            <Checkbox
              checked={isNeedChecked(needs, "epilepsy")}
              label="epilepsy"
            />

            <Checkbox checked={isNeedChecked(needs, "cancer")} label="cancer" />
            <Checkbox checked={isNeedChecked(needs, "deaf")} label="deaf" />
            <Checkbox
              checked={isNeedChecked(needs, "diabetes")}
              label="diabetes"
            />
            <Checkbox
              checked={isNeedChecked(needs, "obesity")}
              label="obesity"
            />

            <Checkbox
              checked={isNeedChecked(needs, "heart_disease")}
              label="heart disease"
            />
            <Checkbox
              checked={isNeedChecked(needs, "migraine")}
              label="migraine"
            />
            <Checkbox
              checked={isNeedChecked(needs, "osteoporosis")}
              label="osteoporosis"
            />
            <Checkbox
              checked={isNeedChecked(needs, "others_medical")}
              label="others"
              specify={
                ((profile as Record<string, unknown>)
                  .others_medicalSpecify as string) || ""
              }
            />

            <Checkbox
              checked={isNeedChecked(needs, "pneumonia")}
              label="pneumonia"
            />
            <Checkbox checked={isNeedChecked(needs, "uti")} label="UTI" />
            <Checkbox
              checked={isNeedChecked(needs, "astigmatism")}
              label="astigmatism"
            />
          </div>
        </div>

        {/* Special Needs Section */}
        <div className="mb-4">
          <h3 className="text-[13px] font-bold uppercase text-gray-900 mb-1 leading-tight">
            PLEASE LET US KNOW IF THE STUDENT HAS ANY SPECIAL NEEDS WE NEED TO
            KNOW:
          </h3>

          {/* Learning Disabilities */}
          <div className="mb-3">
            <h4 className="text-[13px] font-bold text-red-600 mb-0.5 leading-tight">
              Learning Disabilities:
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-0 text-[10px]">
              <div className="flex flex-col gap-y-0.5">
                <Checkbox
                  checked={isNeedChecked(needs, "pronouncing")}
                  label="Problems pronouncing words"
                />
                <Checkbox
                  checked={isNeedChecked(needs, "finding_word")}
                  label="Trouble finding the right word"
                />
                <Checkbox
                  checked={isNeedChecked(needs, "rhyming")}
                  label="Difficulty rhyming"
                />
                <Checkbox
                  checked={isNeedChecked(needs, "alphabet_colors")}
                  label="Trouble learning the alphabet, numbers, colors, shapes, days of the week"
                />
                <Checkbox
                  checked={isNeedChecked(needs, "directions_routines")}
                  label="Difficulty following directions or learning routines"
                />
                <Checkbox
                  checked={isNeedChecked(needs, "controlling_crayons")}
                  label="Difficulty controlling crayons, pencils, and scissors, or coloring within the lines"
                />
                <Checkbox
                  checked={isNeedChecked(needs, "buttons_zippers")}
                  label="Trouble with buttons, zippers, snaps, learning to tie shoes"
                />
                <Checkbox
                  checked={isNeedChecked(needs, "letters_sounds")}
                  label="Trouble learning the connection between letters and sounds"
                />
                <Checkbox
                  checked={isNeedChecked(needs, "unable_blend")}
                  label="Unable to blend sounds to make words"
                />
                <Checkbox
                  checked={isNeedChecked(needs, "confuses_words")}
                  label="Confuses basic words when reading"
                />
                <Checkbox
                  checked={isNeedChecked(needs, "learns_slowly")}
                  label="Learns new skills slowly"
                />
                <Checkbox
                  checked={isNeedChecked(needs, "misspells")}
                  label="Consistently misspells words and makes frequent errors"
                />
              </div>
              <div className="flex flex-col gap-y-0.5">
                <Checkbox
                  checked={isNeedChecked(needs, "math_concepts")}
                  label="Trouble learning basic math concepts"
                />
                <Checkbox
                  checked={isNeedChecked(needs, "telling_time")}
                  label="Difficulty telling time and remembering sequences"
                />
                <Checkbox
                  checked={isNeedChecked(needs, "reading_math_skills")}
                  label="Difficulty with reading comprehension or math skills"
                />
                <Checkbox
                  checked={isNeedChecked(needs, "open_ended_questions")}
                  label="Trouble with open-ended test questions and word problems"
                />
                <Checkbox
                  checked={isNeedChecked(needs, "dislikes_reading")}
                  label="Dislikes reading and writing; avoids reading aloud"
                />
                <Checkbox
                  checked={isNeedChecked(needs, "handwriting")}
                  label="Poor handwriting"
                />
                <Checkbox
                  checked={isNeedChecked(needs, "organizational_skills")}
                  label="Poor organizational skills (bedroom, homework, desk is messy and disorganized)"
                />
                <Checkbox
                  checked={isNeedChecked(needs, "discussions_expression")}
                  label="Trouble following classroom discussions and expressing thoughts aloud"
                />
                <Checkbox
                  checked={isNeedChecked(needs, "spells_differently")}
                  label="Spells the same word differently in a single document"
                />
                <Checkbox
                  checked={isNeedChecked(needs, "others_learning")}
                  label="others, please specify"
                  specify={profile.others_learningSpecify}
                  specifyBelow
                />
              </div>
            </div>
          </div>

          {/* Developmental Delay */}
          <div className="mb-3">
            <h4 className="text-[13px] font-bold text-gray-900 mb-0.5 leading-tight">
              Developmental Delay
            </h4>
            <div className="grid grid-cols-3 gap-y-0 gap-x-2 text-[10px]">
              <Checkbox
                checked={isNeedChecked(needs, "add")}
                label="Attention Deficit Disorder (ADD)"
              />
              <Checkbox
                checked={isNeedChecked(needs, "hd")}
                label="Hyperactive Disorder (HD)"
              />
              <Checkbox
                checked={isNeedChecked(needs, "combined_adhd")}
                label="Combined ADHD"
              />
              <Checkbox
                checked={isNeedChecked(needs, "asd")}
                label="Autism Spectrum Disorder"
              />
              <Checkbox
                checked={isNeedChecked(needs, "speech_delay")}
                label="Speech Delay"
              />
              <Checkbox
                checked={isNeedChecked(needs, "others_delay")}
                label="others, please specify"
                specify={profile.others_delaySpecify}
                specifyBelow
              />
            </div>
          </div>

          {/* Self-control Problem */}
          <div className="mb-3">
            <h4 className="text-[13px] font-bold text-gray-900 mb-0.5 leading-tight">
              Self-control Problem
            </h4>
            <div className="flex items-baseline gap-x-5 text-[10px]">
              <Checkbox
                checked={isNeedChecked(needs, "odd")}
                label="Oppositional Defiant Disorder"
              />
              <Checkbox
                checked={isNeedChecked(needs, "conduct_disorder")}
                label="Conduct Disorder"
              />
              <Checkbox
                checked={isNeedChecked(needs, "impulse_control")}
                label="impulse control"
              />
              <Checkbox
                checked={isNeedChecked(needs, "others_control")}
                label="others, please specify"
                specify={profile.others_controlSpecify}
                specifyBelow
              />
            </div>
          </div>

          {/* Behavioral Needs */}
          <div className="mb-3">
            <h4 className="text-[13px] font-bold text-gray-900 mb-0.5 leading-tight">
              Behavioral Needs
            </h4>
            <p className="text-[13px] mb-0.5 leading-tight">
              Please let us know if the student experienced in any of the
              following:
            </p>
            <div className="flex items-baseline gap-x-8 mb-2 text-[10px]">
              <Checkbox
                checked={isNeedChecked(needs, "bullying")}
                label="bullying"
              />
              <Checkbox
                checked={isNeedChecked(needs, "self_harm")}
                label="self-harm"
              />
              <span className="inline-flex items-baseline gap-1 grow text-[10pt] leading-tight">
                <span className="font-bold shrink-0">
                  {isNeedChecked(needs, "others_behavioral") ? "(✓)" : "( )"}
                </span>
                <span className="shrink-0">others, please specify</span>
                <span className="border-b border-gray-800 px-1 inline-block grow text-center">
                  {profile.others_behavioralSpecify || ""}
                </span>
              </span>
            </div>

            <div className="flex items-start gap-x-3 text-[10px]">
              <span className="shrink-0 leading-tight pt-0.5 text-[13px]">
                Have you consulted a:
              </span>
              <div className="grid grid-cols-2 gap-x-6 gap-y-0 grow">
                <div className="flex flex-col gap-y-0.5">
                  <Checkbox
                    checked={isNeedChecked(needs, "pediatrician")}
                    label="Development Pediatrician"
                  />
                  <Checkbox
                    checked={isNeedChecked(needs, "behavior_therapist")}
                    label="Behavior Therapist"
                  />
                  <Checkbox
                    checked={isNeedChecked(needs, "speech_pathologist")}
                    label="Speech Pathologist"
                  />
                  <Checkbox
                    checked={isNeedChecked(needs, "counseling_specialist")}
                    label="Counseling Specialist"
                  />
                </div>
                <div className="flex flex-col gap-y-0.5">
                  <Checkbox
                    checked={isNeedChecked(needs, "psychologist")}
                    label="Development Psychologist"
                  />
                  <Checkbox
                    checked={isNeedChecked(needs, "occupational_therapist")}
                    label="Occupational Therapist"
                  />
                  <Checkbox
                    checked={isNeedChecked(needs, "psychiatrist")}
                    label="Psychiatrist"
                  />
                  <Checkbox
                    checked={isNeedChecked(needs, "others_specialist")}
                    label="Others"
                    specify={profile.others_specialistSpecify}
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="text-[13px] italic text-gray-700">
            *Please submit Diagnosis and Specialist&apos;s Recommendations
          </p>
        </div>

        {/* Dashed Separator */}
        <div className="my-6 border-b-2 border-dashed border-gray-800" />

        {/* Memorandum of Agreement */}
        <div>
          <h3 className="text-center text-lg font-bold uppercase tracking-wide text-gray-900 mb-2 leading-tight">
            MEMORANDUM OF AGREEMENT
          </h3>
          <p className="text-justify text-[13px] leading-relaxed mb-4 indent-8">
            I hereby acknowledge that all the information written in this form
            are true and correct. That in the event of any information that I
            have not conveyed, I will concede whatever liabilities that may
            happen during the stay of my child/ relative at Mother Perpetua
            Parochial School.
          </p>

          <div className="text-[13px] mb-8">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="shrink-0">
                I hereby affix my/our signature being the
              </span>
              <span className="flex flex-col items-center min-w-[120px]">
                <span className="border-b border-gray-800 w-full h-[20px] block" />
                <span className="text-[13px] italic">
                  (relationship to the student)
                </span>
              </span>
              <span className="shrink-0">of</span>
              <span className="flex flex-col items-center grow min-w-[200px]">
                <span className="border-b border-gray-800 w-full h-[20px] block relative">
                  <span className="absolute bottom-[1px] left-0 right-0 text-center font-bold text-[13px] leading-none whitespace-nowrap">
                    {[
                      data.firstName,
                      data.middleName,
                      data.lastName,
                      data.suffix,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </span>
                </span>
                <span className="text-[13px] italic">
                  (name of the student)
                </span>
              </span>
            </div>
          </div>

          {/* 3 Signature Lines */}
          <div className="grid grid-cols-3 gap-6 text-center text-[13px] mt-6">
            <div>
              <div className="border-b border-gray-800 mb-1 h-6 flex items-end justify-center font-semibold"></div>
              <p className="font-bold text-gray-800">
                Parent/ Guardian&apos;s name
              </p>
            </div>
            <div>
              <div className="border-b border-gray-800 mb-1 h-6" />
              <p className="font-bold text-gray-800">Signature</p>
            </div>
            <div>
              <div className="border-b border-gray-800 mb-1 h-6 flex items-end justify-center font-medium">
                {formatPH(new Date(), {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <p className="font-bold text-gray-800">Date</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
