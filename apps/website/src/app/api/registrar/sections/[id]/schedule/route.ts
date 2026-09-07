import { validateRouteSession } from "@school/api/auth/guard";
import { getSectionScheduleQuery } from "@school/api/sections/query";
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

  // Set includeArchived to true so the client can filter them as it does now
  const result = await getSectionScheduleQuery(sectionId, true);
  return NextResponse.json(result);
}
