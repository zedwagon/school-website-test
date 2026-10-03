import "server-only";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "../constants";
import { getUserWithProfileByIdQuery } from "./query";
import { decryptSession, getPasswordFingerprint } from "./util";

/** Validate current account state, never permissions copied into an old JWT. */
export async function getSessionFromToken(token: string | undefined) {
	if (!token || token.split(".").length !== 3) return null;
	try {
		const payload = await decryptSession(token);
		if (!payload || !Number.isInteger(payload.userId) || !payload.passwordFingerprint) return null;
		const profile = await getUserWithProfileByIdQuery(payload.userId);
		if (!profile || profile.userArchivedAt ||
			(profile.userRole === "staff" && profile.staffArchivedAt) ||
			(profile.userRole === "student" && profile.studentArchivedAt)) return null;
		// Pre-migration tokens represent version zero; once archived, they stay revoked.
		if ((payload.sessionVersion ?? 0) !== profile.userSessionVersion) return null;
		if (payload.passwordFingerprint !== await getPasswordFingerprint(profile.userPasswordHash)) return null;
		if (payload.role !== profile.userRole ||
			(payload.staffDepartment ?? null) !== (profile.staffDepartment ?? null)) return null;
		return {
			session: { userId: profile.userId, expiresAt: new Date(payload.exp * 1000) },
			user: {
				id: profile.userId, email: profile.userEmail, role: profile.userRole,
				staffDepartment: profile.staffDepartment,
				firstName: profile.staffFirstName ?? profile.studentFirstName,
				middleName: profile.staffMiddleName ?? profile.studentMiddleName,
				lastName: profile.staffLastName ?? profile.studentLastName,
				suffix: profile.studentSuffix,
			},
		};
	} catch (error) {
		console.error("Session Retrieval Error:", error);
		return null;
	}
}

export async function getSession() {
	const cookieStore = await cookies();
	return getSessionFromToken(cookieStore.get(AUTH_COOKIE.NAME)?.value);
}
