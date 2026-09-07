import { validateRouteSession } from "@school/api/auth/guard";
import { getStudentsInSectionQuery } from "@school/api/sections/query";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await validateRouteSession(["admin", "staff"], "registrar");
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const sectionId = parseInt(id);

  if (isNaN(sectionId)) {
    return NextResponse.json({ error: "Invalid section ID" }, { status: 400 });
  }

  const result = await getStudentsInSectionQuery(sectionId);
  return NextResponse.json(result);
}
