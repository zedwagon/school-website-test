"use client";

import { Check, Copy, Mail } from "lucide-react";
import { useState } from "react";
import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { SectionHeader } from "@/components/section-header";
import { accountingFees, paymentSteps } from "@/sections/admission/accounting";

const feeDisplayNames: Record<string, string> = {
  registrationFee: "Registration Fee",
  tuitionFees: "Tuition Fees",
  miscellaneousFees: "Miscellaneous Fees",
  books: "Books",
  intramuralsJersey: "Intramurals Jersey",
  peUniform: "PE Uniform",
  firstCommunion: "First Communion",
  recollectionFee: "Recollection Fee",
  retreatFee: "Retreat Fee",
  movingUpFee: "Moving Up Fee",
  graduationFee: "Graduation Fee",
  jsProm: "JS Prom",
  educationalTour: "Educational Tour",
  totalFees: "Total Fees",
};

// group by level
const groupByLevel = (fees: typeof accountingFees) => {
  const grouped: Record<string, typeof accountingFees> = {};
  fees.forEach((item) => {
    if (!grouped[item.level]) {
      grouped[item.level] = [];
    }
    grouped[item.level].push(item);
  });
  return grouped;
};

export function AccountingSection() {
  const feesByLevel = groupByLevel(accountingFees);

  const [selectedFee, setSelectedFee] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("motherperpetua_mauban@yahoo.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gradeOptions = Array.from(new Set(accountingFees.map((f) => f.grade)));

  return (
    <SectionWrapper
      bg="background"
      className="pt-4 pb-24 text-center"
      width="7xl"
    >
      {/* 1. Payment Process */}
      <div className="mb-20">
        <SectionHeader title="Payment Process" />

        <div className="mx-auto max-w-4xl text-left bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-sm">
          <ol className="relative border-l-2 border-primary/20 ml-4 sm:ml-6 space-y-10 py-2">
            {paymentSteps.map((step) => (
              <li className="relative pl-8 sm:pl-10" key={step.number}>
                {/* Node indicator */}
                <span className="absolute -left-[21px] top-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-extrabold text-white text-base shadow-md border-4 border-white">
                  {step.number}
                </span>

                <div className="flex flex-col">
                  <h4 className="font-extrabold text-lg sm:text-xl text-gray-800 leading-snug mb-1">
                    {step.title}
                  </h4>
                  <p className="text-gray-550 text-sm sm:text-base leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* 2. Tuition & School Fees Directory */}
      <div className="mb-20">
        <SectionHeader title="Tuition & School Fees" />

        {/* Filter Controls */}
        <div className="mx-auto max-w-5xl flex flex-wrap gap-3 border-b border-gray-100 pb-6 mb-10 text-left justify-start">
          <select
            className="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm bg-white text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50 transition-all duration-200 cursor-pointer shadow-sm"
            onChange={(e) => setSelectedFee(e.target.value)}
            value={selectedFee}
          >
            <option value="all">All Fees</option>
            {Object.entries(feeDisplayNames).map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>

          <select
            className="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm bg-white text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50 transition-all duration-200 cursor-pointer shadow-sm"
            onChange={(e) => setSelectedGrade(e.target.value)}
            value={selectedGrade}
          >
            <option value="all">All Grades</option>
            {gradeOptions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Fee Level Blocks */}
        <div className="mx-auto max-w-5xl space-y-16">
          {Object.entries(feesByLevel).map(([level, grades], idx) => {
            const filteredGrades = grades.filter(
              (g) => selectedGrade === "all" || g.grade === selectedGrade,
            );
            if (filteredGrades.length === 0) {
              return null;
            }

            return (
              <div className="space-y-6 text-left" key={idx}>
                <h3 className="font-extrabold text-2xl text-gray-800 tracking-wide border-b border-gray-100 pb-3">
                  {level} Fees
                </h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredGrades.map((gradeItem, i) => (
                    <div
                      className="group rounded-3xl border border-gray-150 bg-white p-6 sm:p-7 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                      key={i}
                    >
                      <h4 className="mb-4 font-extrabold text-lg sm:text-xl text-gray-800 leading-snug tracking-wide group-hover:text-primary transition-colors duration-250 border-b border-gray-100 pb-3">
                        {gradeItem.grade}
                      </h4>

                      <ul className="space-y-2">
                        {Object.entries(gradeItem.fees)
                          .filter(
                            ([key]) =>
                              selectedFee === "all" || key === selectedFee,
                          )
                          .map(([key, amount], j) => (
                            <li
                              className={`flex justify-between py-0.5 ${
                                key === "totalFees"
                                  ? "mt-4 border-t border-gray-150 pt-4 font-extrabold text-lg text-primary"
                                  : "text-sm sm:text-base text-gray-650 font-semibold"
                              }`}
                              key={j}
                            >
                              <span className="capitalize">
                                {feeDisplayNames[key]}
                              </span>
                              <span className="font-extrabold text-gray-800 group-hover:text-primary transition-colors duration-250">
                                {amount}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Support Email Card */}
      <div className="mx-auto max-w-5xl w-full rounded-3xl border border-gray-150 bg-white p-6 sm:p-10 text-left shadow-sm hover:shadow-md transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left Text details */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary border border-primary/10">
                <Mail className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                Billing & Accounts
              </span>
            </div>

            <h3 className="font-extrabold text-2xl sm:text-3xl text-gray-800 leading-snug">
              Contact the Accounting Office
            </h3>

            <p className="text-gray-550 text-sm sm:text-base leading-relaxed">
              For inquiries regarding tuition payments, fee assessments, or
              official receipts, feel free to reach out. To help us assist you
              faster, please include the student&apos;s full name, grade level,
              and reference number in your email.
            </p>
          </div>

          {/* Right Action panel */}
          <div className="w-full lg:max-w-xs lg:ml-auto">
            <div className="flex flex-col gap-3 w-full">
              {/* Email Button */}
              <a
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-primary text-white font-bold hover:bg-primary/95 transition-all duration-200 shadow-md text-sm text-center"
                href="mailto:motherperpetua_mauban@yahoo.com"
              >
                <Mail className="h-4 w-4" />
                <span>Email Accounting</span>
              </a>

              {/* Copy Button */}
              <button
                className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl border font-bold transition-all duration-200 text-sm ${
                  copied
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-gray-50 text-gray-750 border-gray-200 hover:bg-gray-100"
                }`}
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>

              {/* Email Address Indicator */}
              <span className="text-[10px] text-center text-gray-400 font-extrabold tracking-wider uppercase block mt-1">
                motherperpetua_mauban@yahoo.com
              </span>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
