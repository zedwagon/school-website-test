"use client";

import { Award, GraduationCap, Loader2 } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface StudentGrade {
  gradeId?: string | number;
  subjectName?: string | null;
  subjectCode?: string | null;
  gradeValue?: string | null;
  isGeneralAverage?: boolean;
}

export default function StudentGradesClient() {
  const { data, error, isLoading } = useSWR("/api/student/grades", fetcher);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (error || data?.error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">
          {error?.message || data?.error || "Failed to load grades"}
        </p>
      </div>
    );
  }

  const { schoolYear, grades } = data;
  const myGrades: StudentGrade[] = grades || [];

  const subjectGrades = myGrades.filter((g) => !g.isGeneralAverage);
  const generalAverageGrade = myGrades.find((g) => g.isGeneralAverage);

  let computedAverage: string | null = null;
  if (!generalAverageGrade?.gradeValue && subjectGrades.length > 0) {
    let sum = 0;
    let count = 0;
    for (const g of subjectGrades) {
      if (g.gradeValue) {
        sum += parseFloat(g.gradeValue);
        count++;
      }
    }
    if (count > 0) computedAverage = (sum / count).toFixed(2);
  }

  const finalAverageToDisplay =
    generalAverageGrade?.gradeValue || computedAverage;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          My Grades
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          View your final grades for the current school year ({schoolYear?.name}
          ).
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-red-600 dark:text-red-500" />
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Grade Report
            </h2>
          </div>
          {finalAverageToDisplay && (
            <div className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
              <Award className="h-4 w-4" />
              GWA: {finalAverageToDisplay}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
            <thead className="border-b border-zinc-200 uppercase text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
              <tr>
                <th className="px-6 py-4 font-medium">Subject</th>
                <th className="px-6 py-4 font-medium">Final Grade</th>
              </tr>
            </thead>
            <tbody>
              {subjectGrades.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400"
                    colSpan={2}
                  >
                    No grades have been posted yet for this school year.
                  </td>
                </tr>
              ) : (
                subjectGrades.map((grade) => (
                  <tr
                    className="border-b border-zinc-100 bg-white last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/50"
                    key={grade.gradeId}
                  >
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                      {grade.subjectName || grade.subjectCode}
                    </td>
                    <td className="px-6 py-4">
                      {grade.gradeValue ? (
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {grade.gradeValue}
                        </span>
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-600">
                          --
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
