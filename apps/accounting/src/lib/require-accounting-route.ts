import "server-only";
import { validateRouteSession } from "@school/api/auth/guard";
import { redirect } from "next/navigation";

// Check in each print page before reading financial records. A dashboard
// layout does not protect sibling /print routes or their server-side queries.
export async function requireAccountingRoute() {
    const auth = await validateRouteSession(["admin", "staff"], "accounting");
    if (!auth.success) {
        redirect(auth.status === 401 ? "/login" : "/dashboard");
    }
    return auth;
}
