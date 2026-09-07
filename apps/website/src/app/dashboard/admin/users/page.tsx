import { getUsers } from "@school/api/users/action";
import UsersClient from "./_components/users-client";

export const metadata = {
  title: "User Management - Admin Portal",
};

interface UserManagementPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function UserManagementPage({
  searchParams,
}: UserManagementPageProps) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const status =
    typeof params.status === "string" && params.status === "archived"
      ? "archived"
      : "active";
  const page =
    typeof params.page === "string" ? Number.parseInt(params.page, 10) || 1 : 1;
  const type =
    typeof params.type === "string" &&
    (params.type === "staff" || params.type === "student")
      ? params.type
      : undefined;

  const result = await getUsers(search, status, page, 10, type);

  if (!result.success || !("data" in result)) {
    return (
      <div className="p-8">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          Error loading users:{" "}
          {"error" in result ? result.error : "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="font-bold text-3xl text-gray-900">User Management</h1>
          <p className="mt-1 text-gray-600">
            Manage system accounts for students and staff
          </p>
        </div>

        <UsersClient
          currentPage={page}
          initialSearch={search || ""}
          initialStatus={status}
          initialType={type}
          totalCount={result.totalCount || 0}
          users={result.data}
        />
      </div>
    </div>
  );
}
