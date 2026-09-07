import { validateRouteSession } from "@school/api/auth/guard";
import { getEnrolledStudents } from "@school/api/enrollment/query";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const auth = await validateRouteSession(
      ["admin", "staff"],
      ["registrar", "faculty"],
    );
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const syId = searchParams.get("syId")
      ? parseInt(searchParams.get("syId")!)
      : undefined;

    const result = await getEnrolledStudents(query, page, limit, syId);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("API Error (getEnrolledStudents):", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
