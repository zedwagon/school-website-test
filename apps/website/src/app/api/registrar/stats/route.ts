import { validateRouteSession } from "@school/api/auth/guard";
import { getEnrollmentStats } from "@school/api/enrollment/query";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auth = await validateRouteSession(["admin", "staff"], "registrar");
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const result = await getEnrollmentStats();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("API Error (getEnrollmentStats):", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
