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
    if (user.role === "admin") {
      redirect("/dashboard/admin");
    }
    if (user.role === "student") {
      redirect("/dashboard/student");
    }
    if (user.role === "staff" && user.staffDepartment) {
      redirect(`/dashboard/staff/${user.staffDepartment}`);
    }
    // Fallback if role exists but department is missing or other edge cases
    redirect("/");
  }

  return <LoginClient />;
}
