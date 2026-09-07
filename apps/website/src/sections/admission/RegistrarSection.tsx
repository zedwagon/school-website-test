"use client";

import {
  BadgeCheck,
  Check,
  CheckCircle2,
  Copy,
  FileDown,
  FileText,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { SectionHeader } from "@/components/section-header";

const newStudentRequirements = [
  "Photocopy of Birth Certificate",
  "Photocopy of Baptismal Certificate",
  "Photocopy of Confirmation Certificate",
  "Photocopy of SF9 (Learner’s Progress Report Card)",
  "Photocopy of SF10 (Learner’s Permanent Academic Record)",
  "Certificate of Good Moral Character (optional)",
  "2 pcs. 1x1 ID Picture (latest)",
  "Long Folder with Fastener",
  "Learner’s Enrollment Form",
  "Student’s Information Sheet",
  "Health Information Sheet",
];

const oldStudentRequirements = [
  "Photocopy of SF9 (Learner’s Progress Report Card)",
  "Learner’s Enrollment Form",
];

const downloadableForms = [
  {
    title: "Learner’s Enrollment Form",
    url: "/registrar/ENROLLMENT%20FORM.pdf",
  },
  {
    title: "ESC Application Form",
    url: "/registrar/ESC_Application_Form2.pdf",
  },
  {
    title: "ESC Contract",
    url: "/registrar/ESC_Grantee_Enrolment_Contract2.pdf",
  },
];

const enrollmentSteps = [
  {
    number: 1,
    title: "Start",
    description: "Proceed to the enrollment area.",
  },
  {
    number: 2,
    title: "Returning or New Student?",
    branches: [
      {
        label: "Returning Student",
        actions: [
          "Go to the Clinic for your initial medical exam.",
          "Fill out the Enrollment Form.",
        ],
      },
      {
        label: "New / Transferee",
        actions: [
          "Go to the Guidance Office for interview and document submission.",
        ],
      },
    ],
  },
  {
    number: 3,
    title: "Registrar Submission",
    description:
      "Submit your completed Enrollment Form and all required documents.",
  },
  {
    number: 4,
    title: "Accounting Payment",
    description: "Proceed to the Accounting Office to finalize your payment.",
  },
  {
    number: 5,
    title: "Enrollment Complete!",
    description: "You are now officially enrolled. Welcome to MPPSI!",
  },
];

export function RegistrarSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("mppsregistrar@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SectionWrapper
      bg="background"
      className="pt-4 pb-24 text-center"
      width="7xl"
    >
      {/* 1. Enrollment Requirements */}
      <div className="mb-20">
        <SectionHeader title="Enrollment Requirements" />

        <div className="mx-auto grid max-w-5xl grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* New / Transferees */}
          <div className="group rounded-3xl border border-gray-150 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary border border-primary/10">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-xl sm:text-2xl text-gray-800 leading-snug">
                Transferees & New Students
              </h3>
            </div>

            <ul className="space-y-3">
              {newStudentRequirements.map((item, i) => (
                <li
                  className="flex items-start gap-2.5 text-gray-600 text-sm sm:text-base leading-relaxed"
                  key={i}
                >
                  <span className="mt-1.5 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Old Students */}
          <div className="group rounded-3xl border border-gray-150 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-xl sm:text-2xl text-gray-800 leading-snug">
                  Old Students
                </h3>
              </div>

              <ul className="space-y-3">
                {oldStudentRequirements.map((item, i) => (
                  <li
                    className="flex items-start gap-2.5 text-gray-600 text-sm sm:text-base leading-relaxed"
                    key={i}
                  >
                    <span className="mt-1.5 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Step-by-Step Guide */}
      <div className="mb-20">
        <SectionHeader title="Step-by-Step Enrollment" />

        <div className="mx-auto max-w-4xl text-left bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-sm">
          <ol className="relative border-l-2 border-primary/20 ml-4 sm:ml-6 space-y-10 py-2">
            {enrollmentSteps.map((step) => (
              <li className="relative pl-8 sm:pl-10" key={step.number}>
                {/* Node indicator */}
                <span className="absolute -left-[21px] top-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-extrabold text-white text-base shadow-md border-4 border-white">
                  {step.number}
                </span>

                <div className="flex flex-col">
                  <h4 className="font-extrabold text-lg sm:text-xl text-gray-800 leading-snug mb-1">
                    {step.title}
                  </h4>

                  {step.description && (
                    <p className="text-gray-550 text-sm sm:text-base leading-relaxed">
                      {step.description}
                    </p>
                  )}

                  {/* Branches layout */}
                  {step.branches && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {step.branches.map((branch, i) => {
                        const isReturning =
                          branch.label === "Returning Student";
                        return (
                          <div
                            className={`p-5 rounded-2xl border ${
                              isReturning
                                ? "border-primary/15 bg-primary/[0.02]"
                                : "border-amber-200 bg-amber-50/[0.2]"
                            }`}
                            key={i}
                          >
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${
                                isReturning
                                  ? "bg-primary/5 text-primary border-primary/10"
                                  : "bg-amber-50 text-amber-700 border-amber-100"
                              }`}
                            >
                              {branch.label}
                            </span>
                            <ul className="mt-3 space-y-2 text-sm text-gray-600">
                              {branch.actions.map((action, j) => (
                                <li className="flex items-start gap-2" key={j}>
                                  <span
                                    className={`mt-1 text-[10px] flex-shrink-0 ${
                                      isReturning
                                        ? "text-primary"
                                        : "text-amber-600"
                                    }`}
                                  >
                                    ●
                                  </span>
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* 3. Downloadable Forms */}
      <div className="mb-20">
        <SectionHeader title="Downloadable Forms" />

        <div className="mx-auto grid max-w-5xl grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {downloadableForms.map((form, index) => (
            <a
              className="group flex items-center justify-between p-5 rounded-2xl border border-gray-150 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 w-full"
              href={form.url}
              key={index}
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary border border-primary/10 transition-transform duration-300 group-hover:scale-105">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="font-extrabold text-gray-800 text-sm sm:text-base leading-snug group-hover:text-primary transition-colors duration-200">
                  {form.title}
                </span>
              </div>
              <FileDown className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors duration-200" />
            </a>
          ))}
        </div>
      </div>

      {/* 4. Support Email Card */}
      <div className="mx-auto max-w-5xl w-full rounded-3xl border border-gray-150 bg-white p-6 sm:p-10 text-left shadow-sm hover:shadow-md transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left Text details */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary border border-primary/10">
                <Mail className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                Support & Admissions
              </span>
            </div>

            <h3 className="font-extrabold text-2xl sm:text-3xl text-gray-800 leading-snug">
              Contact the Registrar Office
            </h3>

            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              For inquiries regarding student admissions, document submission
              requirements, or DepEd ESC grant eligibility, feel free to reach
              out. To help us assist you faster, please include the
              student&apos;s full name and prospective grade level in your
              email.
            </p>
          </div>

          {/* Right Action panel */}
          <div className="w-full lg:max-w-xs lg:ml-auto">
            <div className="flex flex-col gap-3 w-full">
              {/* Email Button */}
              <a
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-primary text-white font-bold hover:bg-primary/95 transition-all duration-200 shadow-md text-sm text-center"
                href="mailto:mppsregistrar@gmail.com"
              >
                <Mail className="h-4 w-4" />
                <span>Email Registrar</span>
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
                mppsregistrar@gmail.com
              </span>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
