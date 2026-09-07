import { validateRouteSession } from "@school/api/auth/guard";
import { getSchoolYears } from "@school/api/school-years/query";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const auth = await validateRouteSession(
      ["staff"],
      ["registrar", "faculty"],
    );
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("search") || undefined;
    const status =
      (searchParams.get("status") as "active" | "archived") || "active";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");

    const result = await getSchoolYears(query, status, page, limit);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("API Error (getSchoolYears):", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
