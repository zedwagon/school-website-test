import { validateRouteSession } from "@school/api/auth/guard";
import {
  getStudentDashboardData,
  getStudentEnrollmentHistory,
} from "@school/api/students/query";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const syIdStr = searchParams.get("syId");
    const syId = syIdStr ? Number.parseInt(syIdStr) : undefined;

    const auth = await validateRouteSession(["student"]);
    if (!auth.success || !auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = auth;
    const [studentData, enrollmentYears] = await Promise.all([
      getStudentDashboardData(user.id, syId),
      getStudentEnrollmentHistory(user.id),
    ]);

    if (!studentData) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...studentData,
        enrollmentYears,
      },
    });
  } catch (error) {
    console.error("API Error (student dashboard):", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
