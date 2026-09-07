"use client";

import {
  archiveUserAccount,
  createUserAccount,
  restoreUserAccount,
  updateUserAccount,
} from "@school/api/users/action";
import { Button, Input, Label, Pagination } from "@school/ui";
import {
  Archive,
  Edit2,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  User as UserIcon,
  X,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface User {
  archivedAt: string | null;
  createdAt: string;
  email: string;
  firstName: string | null;
  id: number;
  lastName: string | null;
  middleName: string | null;
  role: "student" | "staff" | "admin";
  staffDepartment:
    | "registrar"
    | "clinic"
    | "guidance"
    | "accounting"
    | "faculty"
    | "admin"
    | "utility"
    | null;
}

interface UsersClientProps {
  currentPage: number;
  initialSearch: string;
  initialStatus: "active" | "archived";
  initialType?: "staff" | "student";
  totalCount: number;
  users: User[];
}

export default function UsersClient({
  users: initialUsers,
  initialSearch,
  initialStatus,
  initialType,
  totalCount: initialTotalCount,
  currentPage,
}: UsersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Search/Filter State
  const [search, setSearch] = useState(initialSearch);
  const [filterStatus, setFilterStatus] = useState<"active" | "archived">(
    initialStatus,
  );
  const [filterType, setFilterType] = useState<
    "staff" | "student" | "admin" | undefined
  >(initialType as "staff" | "student" | "admin" | undefined);

  const { data: swrData, mutate } = useSWR(
    `/api/admin/users?search=${search}&status=${filterStatus}&type=${filterType || ""}&page=${currentPage}`,
    fetcher,
    {
      fallbackData: {
        success: true,
        data: initialUsers,
        totalCount: initialTotalCount,
      },
      keepPreviousData: true,
    },
  );

  const users = swrData?.data || [];
  const totalCount = swrData?.totalCount || 0;

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Debounce pushing URL updates
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      let changed = false;

      if (search !== (searchParams.get("search") || "")) {
        if (search) {
          params.set("search", search);
        } else {
          params.delete("search");
        }
        changed = true;
      }

      if (filterStatus !== (searchParams.get("status") || "active")) {
        if (filterStatus === "archived") {
          params.set("status", "archived");
        } else {
          params.delete("status");
        }
        changed = true;
      }
      if (filterType !== (searchParams.get("type") || undefined)) {
        if (filterType) {
          params.set("type", filterType);
        } else {
          params.delete("type");
        }
        changed = true;
      }

      if (changed) {
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, filterStatus, filterType, pathname, router, searchParams]);

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteConfirmationEmail, setDeleteConfirmationEmail] = useState("");

  // Form State
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [department, setDepartment] = useState("registrar");

  // Helper to generate password
  const generateRandomPassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const [editingUser, setEditingUser] = useState<User | null>(null);

  function resetForm() {
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setDepartment("registrar");
    setEditingUser(null);
  }

  function handleOpenCreateModal() {
    resetForm();
    setShowPassword(true);
    generateRandomPassword();
    setIsModalOpen(true);
  }

  function handleEdit(user: User) {
    setEditingUser(user);
    setFirstName(user.firstName || "");
    setMiddleName(user.middleName || "");
    setLastName(user.lastName || "");
    setEmail(user.email);
    setDepartment(user.staffDepartment || "registrar");
    setPassword("");
    setShowPassword(false);
    setIsModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("middleName", middleName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      if (password) {
        formData.append("password", password);
      }
      formData.append("department", department);

      let res;
      if (editingUser) {
        res = await updateUserAccount(editingUser.id, formData);
      } else {
        res = await createUserAccount(null, formData);
      }

      if (res.error) {
        if (res.fieldErrors) {
          const errorMessages = Object.entries(res.fieldErrors)
            .map(
              ([field, errors]) =>
                `${field}: ${(errors as string[]).join(", ")}`,
            )
            .join("\n");
          toast.error(errorMessages || res.error);
        } else {
          toast.error(
            typeof res.error === "string" ? res.error : "Validation failed",
          );
        }
      } else {
        toast.success(
          editingUser
            ? "User updated successfully"
            : "User created successfully",
        );
        mutate();
        setIsModalOpen(false);
        resetForm();
      }
    });
  }

  function initiateArchive(user: User) {
    setUserToDelete(user);
    setDeleteConfirmationEmail("");
    setIsDeleteModalOpen(true);
  }

  function handleArchiveUser(e: React.FormEvent) {
    e.preventDefault();
    if (!userToDelete) {
      return;
    }

    startTransition(async () => {
      const res = await archiveUserAccount(
        userToDelete.id,
        deleteConfirmationEmail,
      );
      if (res.success) {
        toast.success("User archived successfully");
        mutate();
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
        setDeleteConfirmationEmail("");
      } else {
        toast.error(res.error || "Failed to archive user");
      }
    });
  }

  function handleRestoreUser(id: number) {
    if (!confirm("Restore this user?")) {
      return;
    }

    startTransition(async () => {
      const res = await restoreUserAccount(id);
      if (res.success) {
        toast.success("User restored successfully");
        mutate();
      } else {
        toast.error(res.error || "Failed to restore user");
      }
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-bold text-2xl text-gray-800">User Accounts</h2>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={handleOpenCreateModal}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Account
        </Button>
      </div>

      {/* Search & Tabs */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
          <Input
            autoComplete="off"
            className="pr-10 pl-10"
            name="user-search"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            ref={searchInputRef}
            value={search}
          />
          {search && (
            <button
              className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
              onClick={() => setSearch("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              className={`rounded-md px-3 py-1.5 font-medium text-xs transition-all ${!filterType ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setFilterType(undefined)}
            >
              All Roles
            </button>
            <button
              className={`rounded-md px-3 py-1.5 font-medium text-xs transition-all ${filterType === "staff" ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setFilterType("staff")}
            >
              Staff
            </button>
            <button
              className={`rounded-md px-3 py-1.5 font-medium text-xs transition-all ${filterType === "student" ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setFilterType("student")}
            >
              Students
            </button>
            <button
              className={`rounded-md px-3 py-1.5 font-medium text-xs transition-all ${filterType === "admin" ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setFilterType("admin")}
            >
              Admins
            </button>
          </div>

          <div className="h-6 w-px bg-gray-200" />
          <button
            className={`rounded-md px-4 py-2 font-medium text-sm transition-all ${filterStatus === "active" ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setFilterStatus("active")}
          >
            Directory
          </button>
          <button
            className={`rounded-md px-4 py-2 font-medium text-sm transition-all ${filterStatus === "archived" ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setFilterStatus("archived")}
          >
            Archived
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        className="overflow-hidden rounded-md border border-gray-200 bg-white shadow"
        style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.2s" }}
      >
        <div className="relative min-w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-right font-medium text-gray-500 text-xs uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map((user: User) => (
                <tr
                  className="transition-colors hover:bg-gray-50"
                  key={user.id}
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <UserIcon className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900 text-sm">
                          {user.firstName}{" "}
                          {user.middleName ? `${user.middleName} ` : ""}
                          {user.lastName}
                        </div>
                        <div className="text-gray-500 text-sm">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 font-semibold text-xs leading-5 ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "staff"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-500 text-sm">
                    {user.staffDepartment ? (
                      <span className="capitalize">
                        {user.staffDepartment.replace("_", " ")}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-sm">
                    <div className="flex justify-end space-x-3 text-sm">
                      {filterStatus === "active" ? (
                        <>
                          <button
                            className="mr-3 flex items-center text-blue-600 hover:text-blue-900"
                            disabled={isPending}
                            onClick={() => handleEdit(user)}
                            title="Edit User"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            className="flex items-center text-gray-600 hover:text-orange-600"
                            disabled={isPending}
                            onClick={() => initiateArchive(user)}
                            title="Archive User"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          className="flex items-center text-green-600 hover:text-green-900"
                          disabled={isPending}
                          onClick={() => handleRestoreUser(user.id)}
                          title="Restore User"
                        >
                          <RotateCcw className="ml-1 h-4 w-4" />
                          <span className="ml-1">Restore</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="p-8 text-center text-gray-500">No users found.</div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(totalCount / 10)}
      />

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-6">
              <h3 className="font-semibold text-gray-900 text-lg">
                {editingUser ? "Edit User" : "Create Account"}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => !isPending && setIsModalOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              autoComplete="off"
              className="space-y-4 px-6 py-4"
              onSubmit={handleSubmit}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    disabled={isPending}
                    id="firstName"
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    value={firstName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    disabled={isPending}
                    id="lastName"
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    value={lastName}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name (Optional)</Label>
                <Input
                  disabled={isPending}
                  id="middleName"
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="Optional"
                  value={middleName}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  disabled={isPending}
                  id="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  value={email}
                />
              </div>

              {(!editingUser || editingUser.role !== "student") && (
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isPending}
                    id="department"
                    onChange={(e) => setDepartment(e.target.value)}
                    value={department}
                  >
                    <option value="registrar">Registrar</option>
                    <option value="faculty">Faculty</option>
                    <option value="accounting">Accounting</option>
                    <option value="clinic">Clinic</option>
                    <option value="guidance">Guidance Office</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      className="pr-10"
                      disabled={isPending}
                      id="password"
                      minLength={6}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        editingUser ? "Leave blank to keep current" : ""
                      }
                      required={!editingUser}
                      type={showPassword ? "text" : "password"}
                      value={password}
                    />
                    <button
                      className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <Button
                    disabled={isPending}
                    onClick={generateRandomPassword}
                    title="Generate Random Password"
                    type="button"
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                {!editingUser && (
                  <p className="text-muted-foreground text-xs">
                    Autogenerated securely. Copy this to share with the new
                    staff member.
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  disabled={isPending}
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={isPending}
                  type="submit"
                >
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingUser ? "Save Changes" : "Create Account"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-lg border-orange-600 border-t-4 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-6">
              <div className="flex items-center space-x-2 text-orange-600">
                <Archive className="h-6 w-6" />
                <h3 className="font-semibold text-lg">Archive Account?</h3>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => !isPending && setIsDeleteModalOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-4 p-6" onSubmit={handleArchiveUser}>
              <div className="rounded-md bg-orange-50 p-4 text-orange-800 text-sm">
                <p className="font-semibold">Archive Account</p>
                <p className="mt-1">
                  Archiving{" "}
                  <strong>
                    {userToDelete!.firstName} {userToDelete!.lastName}
                  </strong>{" "}
                  ({userToDelete!.email}) will disable their access. You can
                  restore this account from the Archived tab.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700" htmlFor="confirmEmail">
                  To confirm, type <strong>{userToDelete!.email}</strong> below:
                </Label>
                <Input
                  autoComplete="off"
                  className="border-orange-300 focus:ring-orange-500"
                  disabled={isPending}
                  id="confirmEmail"
                  onChange={(e) => setDeleteConfirmationEmail(e.target.value)}
                  placeholder={userToDelete!.email}
                  required
                  value={deleteConfirmationEmail}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  disabled={isPending}
                  onClick={() => setIsDeleteModalOpen(false)}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-orange-600 text-white hover:bg-orange-700"
                  disabled={
                    isPending || deleteConfirmationEmail !== userToDelete!.email
                  }
                  type="submit"
                >
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Archive Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
