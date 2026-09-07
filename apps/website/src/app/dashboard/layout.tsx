import { getSession } from "@school/api/auth/session";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-gray-50">
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
