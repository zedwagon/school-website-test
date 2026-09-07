import { validateRouteSession } from "@school/api/auth/guard";
import { getStudentEnrollmentDetails } from "@school/api/enrollment/query";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await validateRouteSession(["admin", "staff"], "registrar");
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const studentId = parseInt(id);
    if (isNaN(studentId)) {
      return NextResponse.json(
        { error: "Invalid student ID" },
        { status: 400 },
      );
    }

    const result = await getStudentEnrollmentDetails(studentId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("API Error (getStudentEnrollmentDetails):", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
