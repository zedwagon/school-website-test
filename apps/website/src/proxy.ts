import { decryptSession } from "@school/api/auth/util";
import { AUTH_COOKIE } from "@school/api/constants";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  // Check if maintenance mode is enabled via environment variable
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";

  // Let the user access the /maintenance page itself to avoid infinite redirects
  if (request.nextUrl.pathname === "/maintenance") {
    if (!isMaintenanceMode) {
      // If maintenance mode is OFF, and they try to visit /maintenance, redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // If maintenance mode is ON, redirect all page requests to /maintenance
  if (isMaintenanceMode) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  const session = request.cookies.get(AUTH_COOKIE.NAME);
  const path = request.nextUrl.pathname;

  // Public routes - allow access
  if (path.startsWith("/login")) {
    // If logged in and trying to access login pages, redirect to appropriate dashboard
    if (session) {
      const user = await decryptSession(session.value);
      if (user) {
        if (user.role === "student") {
          return NextResponse.redirect(
            new URL("/dashboard/student", request.url),
          );
        }
        if (user.role === "admin") {
          return NextResponse.redirect(
            new URL("/dashboard/admin", request.url),
          );
        }
        if (user.role === "staff" && user.staffDepartment) {
          return NextResponse.redirect(
            new URL(`/dashboard/staff/${user.staffDepartment}`, request.url),
          );
        }
      }
    }

    // Redirect legacy sub-paths (e.g., /login/student, /login/staff) to unified /login
    if (path !== "/login") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (path.startsWith("/dashboard")) {
    if (!session) {
      // Not logged in - redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Get user session to check role WITHOUT hitting the database
    const user = await decryptSession(session.value);
    if (!user) {
      // Invalid token or decrypt failed
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Direct Dashboard Root Access -> Redirect to specific portal
    if (path === "/dashboard") {
      if (user.role === "student") {
        return NextResponse.redirect(
          new URL("/dashboard/student", request.url),
        );
      }
      if (user.role === "admin") {
        return NextResponse.redirect(new URL("/dashboard/admin", request.url));
      }
      if (user.role === "staff" && user.staffDepartment) {
        return NextResponse.redirect(
          new URL(`/dashboard/staff/${user.staffDepartment}`, request.url),
        );
      }
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Student routes
    if (path.startsWith("/dashboard/student") && user.role !== "student") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Staff routes (department-specific)
    if (path.startsWith("/dashboard/staff")) {
      // Allow only staff and admins
      if (user.role !== "staff" && user.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Extract department from path: /dashboard/staff/{department}
      const pathParts = path.split("/");
      if (pathParts.length >= 4) {
        const requestedDepartment = pathParts[3];

        // Staff can only access their own department's dashboard
        // Admins can access any department
        if (
          user.role === "staff" &&
          user.staffDepartment !== requestedDepartment
        ) {
          // Redirect to their correct department
          return NextResponse.redirect(
            new URL(`/dashboard/staff/${user.staffDepartment}`, request.url),
          );
        }

        // Faculty has no root dashboard, redirect to enrollments
        if (
          requestedDepartment === "faculty" &&
          (path === "/dashboard/staff/faculty" ||
            path === "/dashboard/staff/faculty/")
        ) {
          return NextResponse.redirect(
            new URL("/dashboard/staff/faculty/enrollments", request.url),
          );
        }
      }
    }

    // Admin routes
    if (path.startsWith("/dashboard/admin") && user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
