import { validateRouteSession } from "@school/api/auth/guard";
import { getClearedPhysicals } from "@school/api/clinic/query";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const auth = await validateRouteSession(["admin", "staff"], "clinic");
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const gradeLevel = searchParams.get("gradeLevel") || undefined;

    const result = await getClearedPhysicals(search, gradeLevel);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("API Error (getClearedPhysicals):", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
