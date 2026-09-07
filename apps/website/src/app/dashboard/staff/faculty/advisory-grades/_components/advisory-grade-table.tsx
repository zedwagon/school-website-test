"use client";

import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { type GradeInput, saveAdvisoryGrades } from "../actions";

type Student = {
  studentId: number;
  firstName: string;
  lastName: string;
};

type Subject = {
  subjectId: number;
  subjectName: string;
  subjectCode: string | null;
};

type ExistingGrade = {
  studentId: number;
  subjectId: number | null;
  grade: string | null;
  isGeneralAverage: boolean;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdvisoryGradeTable({
  students,
  subjects,
  sectionId,
  schoolYearId,
}: {
  students: Student[];
  subjects: Subject[];
  sectionId: number;
  schoolYearId: number;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const { data: existingGrades } = useSWR<ExistingGrade[]>(
    `/api/staff/faculty/advisory-grades/${sectionId}`,
    fetcher,
  );

  const [gradesMap, setGradesMap] = useState<Record<string, string>>({});

  // Sync SWR data to local state
  useEffect(() => {
    if (existingGrades) {
      const initial: Record<string, string> = {};
      for (const g of existingGrades) {
        if (!g.grade) continue;
        if (g.isGeneralAverage) {
          initial[`${g.studentId}-avg`] = g.grade;
        } else if (g.subjectId) {
          initial[`${g.studentId}-${g.subjectId}`] = g.grade;
        }
      }
      setGradesMap(initial);
    }
  }, [existingGrades]);

  const handleGradeChange = (
    studentId: number,
    subjectId: number | "avg",
    value: string,
  ) => {
    // Only allow numbers and one decimal point
    if (value && !/^\d*\.?\d*$/.test(value)) return;

    // Prevent extremely large values that would fail DB constraints
    if (value && parseFloat(value) > 100) return;
    if (value && value.length > 6) return;

    setGradesMap((prev) => ({
      ...prev,
      [`${studentId}-${subjectId}`]: value,
    }));
  };

  const getDisplayAverage = (studentId: number) => {
    let sum = 0;
    let count = 0;
    for (const sub of subjects) {
      const val = gradesMap[`${studentId}-${sub.subjectId}`];
      if (val && !isNaN(parseFloat(val))) {
        sum += parseFloat(val);
        count++;
      }
    }

    if (count === 0) return "";
    return (sum / count).toFixed(2);
  };

  const handleSave = async () => {
    setIsPending(true);
    try {
      const payload: GradeInput[] = [];

      for (const student of students) {
        // Collect subject grades
        for (const sub of subjects) {
          const val = gradesMap[`${student.studentId}-${sub.subjectId}`];
          if (val !== undefined) {
            payload.push({
              studentId: student.studentId,
              subjectId: sub.subjectId,
              grade: val,
              isGeneralAverage: false,
            });
          }
        }

        // Collect general average
        const avgVal = getDisplayAverage(student.studentId);

        if (avgVal !== "") {
          payload.push({
            studentId: student.studentId,
            subjectId: null,
            grade: avgVal,
            isGeneralAverage: true,
          });
        }
      }

      await saveAdvisoryGrades(sectionId, schoolYearId, payload);
      toast.success("Grades saved successfully.");
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save grades.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Grade Entry
            <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-tight text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
              Final
            </span>
          </h2>
        </div>
        <button
          className="group relative flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-zinc-800 active:scale-95 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          disabled={isPending}
          onClick={handleSave}
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Save className="h-3 w-3 transition-transform group-hover:scale-110" />
          )}
          Save Changes
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
          <thead className="bg-zinc-50 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:bg-zinc-900/50 dark:text-zinc-500">
            <tr>
              <th className="sticky left-0 z-20 bg-zinc-50 px-6 py-3 dark:bg-zinc-900 shadow-[1px_0_0_0_#e4e4e7] dark:shadow-[1px_0_0_0_#27272a]">
                Student Name
              </th>
              {subjects.map((sub) => (
                <th
                  className="px-4 py-3 min-w-[100px] text-center"
                  key={sub.subjectId}
                >
                  {sub.subjectCode || sub.subjectName}
                </th>
              ))}
              <th className="px-6 py-3 min-w-[150px] text-zinc-900 dark:text-zinc-100 text-center">
                General Average
              </th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td
                  className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400"
                  colSpan={subjects.length + 2}
                >
                  No students found in this section.
                </td>
              </tr>
            ) : (
              students.map((student) => {
                return (
                  <tr
                    className="group border-b border-zinc-100 bg-white last:border-0 hover:bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900 transition-colors"
                    key={student.studentId}
                  >
                    <td className="sticky left-0 z-10 bg-inherit px-6 py-4 shadow-[1px_0_0_0_#f4f4f5] dark:shadow-[1px_0_0_0_#18181b]">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                          {student.lastName}, {student.firstName}
                        </span>
                      </div>
                    </td>
                    {subjects.map((sub) => (
                      <td className="px-4 py-4" key={sub.subjectId}>
                        <input
                          className="w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-1.5 text-center text-sm font-medium outline-none transition-all focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                          onChange={(e) =>
                            handleGradeChange(
                              student.studentId,
                              sub.subjectId,
                              e.target.value,
                            )
                          }
                          placeholder="--"
                          type="text"
                          value={
                            gradesMap[
                              `${student.studentId}-${sub.subjectId}`
                            ] ?? ""
                          }
                        />
                      </td>
                    ))}
                    <td className="px-6 py-4 bg-zinc-50/30 dark:bg-zinc-900/30">
                      <div className="flex items-center justify-center">
                        <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                          {getDisplayAverage(student.studentId) || "--"}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
