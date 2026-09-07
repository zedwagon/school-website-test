import { validateRouteSession } from "@school/api/auth/guard";
import { getTeachers } from "@school/api/faculty/query";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
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

  const result = await getTeachers(query, status, page, limit);
  return NextResponse.json(result);
}
