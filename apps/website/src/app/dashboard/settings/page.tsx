import { validateRouteSession } from "@school/api/auth/guard";
import { getStudentDashboardData } from "@school/api/students/query";
import { KeyRound, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/forms/change-password-form";

interface SettingsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const auth = await validateRouteSession(["admin", "staff", "student"]);
  const params = await searchParams;
  const currentTab = typeof params.tab === "string" ? params.tab : "security";

  if (!auth.success) {
    redirect("/");
  }

  if (auth.user.role === "student") {
    await getStudentDashboardData(auth.user.id);
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-bold text-3xl text-gray-900">Account Settings</h1>
        <p className="mt-1 text-gray-500">
          Manage your account preferences and security.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <nav className="flex flex-col space-y-1">
            <Link
              className={`flex items-center space-x-3 rounded-lg px-4 py-3 font-medium transition-colors ${
                currentTab === "security"
                  ? "bg-red-50 text-red-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              href="/dashboard/settings?tab=security"
            >
              <KeyRound className="h-5 w-5" />
              <span>Security & Password</span>
            </Link>
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          <>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Change Password
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Update your password to keep your account secure.
              </p>
              <div className="max-w-xl">
                <ChangePasswordForm />
              </div>
            </div>

            <div className="rounded-lg border-red-100 bg-red-50/50 p-6">
              <div className="flex items-center space-x-2 text-red-900 font-semibold mb-3">
                <ShieldCheck className="h-5 w-5" />
                <h4>Security Recommendations</h4>
              </div>
              <ul className="space-y-3 text-red-800 text-sm">
                <li className="flex items-start">
                  <span className="mr-2 mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                  Use a combination of uppercase, lowercase, numbers, and
                  symbols.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                  Avoid using birthdays, names, or common words.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                  Never share your credentials with anyone.
                </li>
              </ul>
            </div>
          </>
        </div>
      </div>
    </div>
  );
}
