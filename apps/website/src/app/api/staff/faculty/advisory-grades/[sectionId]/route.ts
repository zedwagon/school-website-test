import { validateRouteSession } from "@school/api/auth/guard";
import { getActiveSchoolYear } from "@school/api/school-years/query";
import { db, grades, sections, staff } from "@school/db";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sectionId: string }> },
) {
  const auth = await validateRouteSession(["admin", "staff"], "faculty");
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { sectionId: sectionIdStr } = await params;
  const sectionId = parseInt(sectionIdStr, 10);

  if (isNaN(sectionId)) {
    return NextResponse.json({ error: "Invalid section ID" }, { status: 400 });
  }

  const activeSy = await getActiveSchoolYear();
  if (!activeSy) {
    return NextResponse.json(
      { error: "No active school year" },
      { status: 400 },
    );
  }

  const staffRecord = await db.query.staff.findFirst({
    where: eq(staff.userId, auth.user.id),
  });

  const section = await db.query.sections.findFirst({
    where: eq(sections.id, sectionId),
  });

  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  if (auth.user.role !== "admin" && section.adviserId !== staffRecord?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const existingGrades = await db.query.grades.findMany({
    where: and(
      eq(grades.sectionId, sectionId),
      eq(grades.schoolYearId, activeSy.id),
    ),
  });

  return NextResponse.json(existingGrades);
}
