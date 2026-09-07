import { validateRouteSession } from "@school/api/auth/guard";
import { getDroppedTransferredStudents } from "@school/api/enrollment/query";
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
    const syIdStr = searchParams.get("syId");

    if (!syIdStr) {
      return NextResponse.json(
        { error: "School Year ID is required" },
        { status: 400 },
      );
    }

    const syId = parseInt(syIdStr);
    if (isNaN(syId)) {
      return NextResponse.json(
        { error: "Invalid School Year ID" },
        { status: 400 },
      );
    }

    const result = await getDroppedTransferredStudents(syId, query);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("API Error (getDroppedTransferredStudents):", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
