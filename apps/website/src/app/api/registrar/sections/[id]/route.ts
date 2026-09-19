import { validateRouteSession } from "@school/api/auth/guard";
import { getSectionByIdQuery } from "@school/api/sections/query";
import { NextResponse } from "next/server";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const auth = await validateRouteSession(["admin", "staff"], "registrar");
	if (!auth.success) {
		return NextResponse.json({ error: auth.error }, { status: auth.status });
	}

	const { id } = await params;
	const sectionId = parseInt(id, 10);

	if (Number.isNaN(sectionId)) {
		return NextResponse.json({ error: "Invalid section ID" }, { status: 400 });
	}

	const result = await getSectionByIdQuery(sectionId);
	if (!result) {
		return NextResponse.json({ error: "Section not found" }, { status: 404 });
	}

	return NextResponse.json(result);
}
