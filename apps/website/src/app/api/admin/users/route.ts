import { validateRouteSession } from "@school/api/auth/guard";
import { getUsersQuery } from "@school/api/users/query";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const auth = await validateRouteSession(["admin"]);
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("search") || undefined;
    const status =
      searchParams.get("status") === "archived" ? "archived" : "active";
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10);
    const type = searchParams.get("type") as "staff" | "student" | null;

    const result = await getUsersQuery(
      query,
      status,
      page,
      limit,
      type || undefined,
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("API Error (getUsers):", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
