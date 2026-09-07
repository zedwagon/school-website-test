import { getSession } from "@school/api/auth/session";
import { redirect } from "next/navigation";
import LoginClient from "./_components/login-client";

export const metadata = {
  title: "Login | MPPSI Portal",
};

export default async function LoginPage() {
  const session = await getSession();

  // Auto-redirect if already logged in (uses DB-backed check for stability)
  if (session) {
    const { user } = session;
    if (user.role === "admin" || (user.role === "staff" && user.staffDepartment === "accounting")) {
      redirect("/dashboard/payroll");
    }
    // Fallback if not authorized
    redirect("/");
  }

  return <LoginClient />;
}
