import { validateRouteSession } from "@school/api/auth/guard";
import { redirect } from "next/navigation";
import StudentGradesClient from "./_components/student-grades-client";

export const metadata = {
  title: "My Grades | MPPSI Portal",
};

export default async function StudentGradesPage() {
  redirect("/dashboard/student");

  const auth = await validateRouteSession(["student", "admin"]);

  if (!auth.success) {
    redirect("/login");
  }

  return <StudentGradesClient />;
}
