import { MEDICAL_HISTORY_QUESTIONS } from "@school/api/clinic/constants";
import { getClinicPrintData } from "@school/api/print/query";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { formatPH } from "@/lib/utils";

/** Formats specific question texts with exact bold keywords matching the original document */
function formatQuestionText(id: number, text: string) {
  if (id === 7) {
    return (
      <>
        Have you ever passed out or nearly passed out{" "}
        <span className="font-bold">DURING</span> exercise?
      </>
    );
  }
  if (id === 8) {
    return (
      <>
        Have you ever passed out or nearly passed out{" "}
        <span className="font-bold">AFTER</span> exercise?
      </>
    );
  }
  if (id === 29) {
    return (
      <>
        Have you ever had{" "}
        <span className="font-bold">Dengue hemorrhagic fever</span> infection?
      </>
    );
  }
  if (id === 44) {
    return (
      <>
        Have you ever received the{" "}
        <span className="font-bold">Dengvaxia vaccine</span>? If YES, how many
        doses?
      </>
    );
  }
  if (id === 45) {
    return (
      <>
        Do you have a{" "}
        <span className="font-bold">
          G6PD (Glucose 6 Phosphate Dehydrogenase)
        </span>{" "}
        condition?
      </>
    );
  }
  return text;
}

export default async function ClinicPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const formId = Number.parseInt(id, 10);

  if (Number.isNaN(formId)) {
    notFound();
  }

  const data = await getClinicPrintData(formId);

  if (!data || !data.statusClinicDone) {
    notFound();
  }

  const medicalHistory = (data.statusClinicMedicalHistory || {}) as Record<
    number,
    { value: string; remarks: string }
  >;

  const fullName = [
    data.firstName,
    data.middleName ? `${data.middleName.charAt(0)}.` : null,
    data.lastName,
    data.suffix,
  ]
    .filter(Boolean)
    .join(" ");

  const formattedDate = data.statusClinicFinishedAt
    ? formatPH(data.statusClinicFinishedAt, {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
    : "";

  const formattedBirthdate = data.birthdate
    ? formatPH(data.birthdate, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  // Split questions into Page 1 (1-21) and Page 2 (22-49)
  const page1Questions = MEDICAL_HISTORY_QUESTIONS.filter((q) => q.id <= 21);
  const page2Questions = MEDICAL_HISTORY_QUESTIONS.filter((q) => q.id >= 22);

  const renderQuestionRow = (q: (typeof MEDICAL_HISTORY_QUESTIONS)[0]) => {
    const answer = medicalHistory[q.id];
    const isYes = answer?.value === "yes";
    const isNo = answer?.value === "no" || !answer?.value;

    // Determine if a subheader row should be inserted before this question
    let subheader: string | null = null;
    if (q.id === 7) subheader = "HEART HEALTH QUESTIONS ABOUT YOU";
    if (q.id === 15) subheader = "HEART HEALTH QUESTIONS ABOUT YOUR FAMILY";
    if (q.id === 46) subheader = "FEMALES ONLY";

    return (
      <Fragment key={q.id}>
        {subheader && (
          <tr className="border-b border-black font-bold bg-white">
            <td
              className="border-r border-black px-2 py-0.5 text-[10pt]"
              colSpan={1}
            >
              {subheader}
            </td>
            <td className="border-r border-black"></td>
            <td className="border-r border-black"></td>
            <td></td>
          </tr>
        )}
        <tr className="border-b border-black">
          <td className="border-r border-black px-2 py-[2px] align-top leading-snug text-[10pt]">
            <span className="font-semibold">{q.id}.</span>{" "}
            {formatQuestionText(q.id, q.text)}
          </td>
          <td className="border-r border-black px-1 py-[2px] text-center align-middle font-bold text-base">
            {isYes ? "✓" : ""}
          </td>
          <td className="border-r border-black px-1 py-[2px] text-center align-middle font-bold text-base">
            {isNo ? "✓" : ""}
          </td>
          <td className="px-2 py-[2px] align-top text-[9.5pt] text-gray-800">
            {answer?.remarks || ""}
          </td>
        </tr>
      </Fragment>
    );
  };

  return (
    <div className="mx-auto max-w-[210mm] text-[10.5pt] font-sans text-black leading-tight">
      {/* ================= PAGE 1 ================= */}
      <div>
        {/* Prominent Header matching original document */}
        <div className="print-no-break mb-1 text-center">
          <div className="flex items-center justify-between px-1">
            <div className="h-24 w-24 shrink-0">
              <Image
                alt="School Logo"
                className="h-full w-full object-contain"
                height={96}
                src="/logo.webp"
                width={96}
              />
            </div>
            <div className="flex-1 text-center px-2">
              <h1 className="text-lg font-bold uppercase tracking-tight text-[#C00000] mb-0.5">
                MOTHER PERPETUA PAROCHIAL SCHOOL, INC.
              </h1>
              <p className="text-[10pt] leading-tight text-gray-800 font-medium">
                Catholic Educational Association of the Philippines (CEAP)
              </p>
              <p className="text-[10pt] leading-tight text-gray-800 font-medium">
                United Private Education Institutions of Quezon, Inc. (UPEIQ)
              </p>
              <p className="text-[10pt] leading-tight text-gray-800 font-medium">
                Lucena Diocese Catholic Schools Association (LUDICSA)
              </p>
              <p className="text-[10pt] leading-tight text-gray-800 font-medium">
                Lucena Diocese Educational System (LUDES)
              </p>
              <p className="text-[10pt] leading-tight text-gray-800 font-medium">
                Mauban, Quezon 4330
              </p>
            </div>
            <div className="h-24 w-24 shrink-0">
              <Image
                alt="Diocese Logo"
                className="h-full w-full object-contain"
                height={96}
                src="/logo_diocese.webp"
                width={96}
              />
            </div>
          </div>
        </div>

        {/* Student Details Header Lines */}
        <div className="mt-1.5 mb-2 space-y-0.5 text-sm font-bold">
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-1 items-end gap-2">
              <span className="shrink-0">NAME:</span>
              <span className="flex-1 border-b border-black px-2 pb-0.5 font-normal text-base">
                {fullName}
              </span>
            </div>
            <div className="flex w-48 items-end gap-2">
              <span className="shrink-0">DATE:</span>
              <span className="flex-1 border-b border-black px-2 pb-0.5 font-normal text-base">
                {formattedDate}
              </span>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="shrink-0">BIRTHDATE:</span>
            <span className="flex-1 border-b border-black px-2 pb-0.5 font-normal text-base">
              {formattedBirthdate}
            </span>
          </div>
        </div>

        {/* Title & Instructions */}
        <div className="my-2.5 text-center">
          <h2 className="text-base font-bold uppercase tracking-wide">
            MEDICAL HISTORY
          </h2>
        </div>

        <p className="mb-2.5 text-[10.5pt] leading-snug text-black">
          The parent/guardian must complete and sign this form before the
          physical examination for review by the examining practitioner. Put a
          check (/) in the column, and if the answer is YES, explain it.
        </p>

        {/* Page 1 Table (Questions 1-21) */}
        <table className="w-full border-collapse border border-black text-[10pt]">
          <thead>
            <tr className="border-b border-black bg-white font-bold">
              <th className="border-r border-black px-2 py-1 text-left w-[62%]">
                GENERAL QUESTIONS
              </th>
              <th className="border-r border-black px-1 py-1 text-center w-[9%]">
                YES
              </th>
              <th className="border-r border-black px-1 py-1 text-center w-[9%]">
                NO
              </th>
              <th className="px-2 py-1 text-left w-[20%]">REMARKS</th>
            </tr>
          </thead>
          <tbody>{page1Questions.map((q) => renderQuestionRow(q))}</tbody>
        </table>
      </div>

      {/* ================= PAGE 2 ================= */}
      <div className="print-page-break pt-2">
        {/* Page 2 Table (Questions 22-49) */}
        <table className="mb-4 w-full border-collapse border border-black text-[10pt]">
          <thead>
            <tr className="border-b border-black bg-white font-bold">
              <th className="border-r border-black px-2 py-1 text-left w-[62%]"></th>
              <th className="border-r border-black px-1 py-1 text-center w-[9%]">
                YES
              </th>
              <th className="border-r border-black px-1 py-1 text-center w-[9%]">
                NO
              </th>
              <th className="px-2 py-1 text-left w-[20%]">REMARKS</th>
            </tr>
          </thead>
          <tbody>{page2Questions.map((q) => renderQuestionRow(q))}</tbody>
        </table>

        {/* NOTES Section */}
        <div className="print-no-break mb-4">
          <h3 className="mb-1 text-xs font-bold uppercase">NOTES:</h3>
          {data.statusClinicNote ? (
            <p className="min-h-[1.5rem] text-xs italic text-gray-800">
              {data.statusClinicNote}
            </p>
          ) : (
            <p className="min-h-[1.5rem] text-xs text-gray-400 italic">None</p>
          )}
        </div>

        {/* Certification & Signatures */}
        <div className="print-no-break mt-4">
          <p className="mb-8 text-xs font-bold">
            I certify that the answers to the above questions are true.
          </p>

          <div className="grid grid-cols-2 gap-12 text-center text-xs">
            <div>
              <div className="mx-auto mb-1.5 w-full border-b border-black" />
              <p className="font-bold">
                Parent/Guardian Signature over Printed Name
              </p>
            </div>
            <div>
              <div className="mx-auto mb-1.5 w-full border-b border-black">
                {data.approvedByFirstName && data.approvedByLastName ? (
                  <span className="font-normal text-xs block -mb-1 pb-0.5">
                    {data.approvedByFirstName} {data.approvedByLastName}
                  </span>
                ) : null}
              </div>
              <p className="font-bold">Student Signature over Printed Name</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
