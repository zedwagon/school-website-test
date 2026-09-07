import { validateRouteSession } from "@school/api/auth/guard";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRouteSession();

  if (!session || !session.success) {
    redirect("/login");
  }

  // Ensure only accounting department can access
  if (session.user.staffDepartment !== "accounting" && session.user.role !== "admin") {
    // If not accounting, redirect out or show error
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Unauthorized: Accounting personnel only.
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <AppSidebar user={session.user} />

      {/* Main Content Area */}
      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 pt-20 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
