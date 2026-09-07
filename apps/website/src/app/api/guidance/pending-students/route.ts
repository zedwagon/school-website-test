import { validateRouteSession } from "@school/api/auth/guard";
import { getPendingGuidance } from "@school/api/guidance/query";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const auth = await validateRouteSession(["admin", "staff"], "guidance");
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const gradeLevel = searchParams.get("gradeLevel") || undefined;

    const result = await getPendingGuidance(search, gradeLevel);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("API Error (getPendingGuidance):", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
