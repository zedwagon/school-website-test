import { validateRouteSession } from "@school/api/auth/guard";
import { getStudents } from "@school/api/students/query";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const auth = await validateRouteSession(["admin", "staff"], "registrar");
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("search") || undefined;
    const status =
      (searchParams.get("status") as "active" | "archived") || "active";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const syId = searchParams.get("sy")
      ? parseInt(searchParams.get("sy")!)
      : undefined;
    const gradeLevel = searchParams.get("gradeLevel") || undefined;

    const result = await getStudents(
      query,
      status,
      page,
      limit,
      syId,
      gradeLevel,
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("API Error (getStudents):", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
