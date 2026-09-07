"use client";

import { logout } from "@school/api/auth/action";
import { Button } from "@school/ui";
import {
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  School,
  Settings,
  Shield,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: {
    firstName?: string | null;
    middleName?: string | null;
    lastName?: string | null;
    suffix?: string | null;
    email?: string | null;
    role: string;
    staffDepartment?: string | null;
  };
}

export function AppSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Build full name
  const fullName =
    [
      user.firstName,
      user.middleName ? `${user.middleName.charAt(0)}.` : null,
      user.lastName,
      user.suffix,
    ]
      .filter(Boolean)
      .join(" ") || "User";

  // Get display role/department
  const displayRole =
    user.role === "staff" && user.staffDepartment
      ? user.staffDepartment.charAt(0).toUpperCase() +
        user.staffDepartment.slice(1)
      : user.role.charAt(0).toUpperCase() + user.role.slice(1);

  // Settings link destination (unified)
  const settingsHref = "/dashboard/settings";

  // Define links based on Role
  const getLinks = () => {
    const isRegistrarRoute = pathname.startsWith("/dashboard/staff/registrar");
    const isClinicRoute = pathname.startsWith("/dashboard/staff/clinic");
    const isGuidanceRoute = pathname.startsWith("/dashboard/staff/guidance");
    const isAccountingRoute = pathname.startsWith(
      "/dashboard/staff/accounting",
    );
    const isFacultyRoute = pathname.startsWith("/dashboard/staff/faculty");

    const dashboardLink = {
      label: "Dashboard",
      href: isRegistrarRoute
        ? "/dashboard/staff/registrar"
        : isClinicRoute
          ? "/dashboard/staff/clinic"
          : isGuidanceRoute
            ? "/dashboard/staff/guidance"
            : isAccountingRoute
              ? "/dashboard/staff/accounting"
              : isFacultyRoute
                ? "/dashboard/staff/faculty"
                : user.role === "admin"
                  ? "/dashboard/admin"
                  : user.role === "student"
                    ? "/dashboard/student"
                    : user.staffDepartment === "accounting"
                      ? "/dashboard/staff/accounting"
                      : user.staffDepartment === "clinic"
                        ? "/dashboard/staff/clinic"
                        : user.staffDepartment === "guidance"
                          ? "/dashboard/staff/guidance"
                          : user.staffDepartment === "registrar"
                            ? "/dashboard/staff/registrar"
                            : "/dashboard/admin", // fallback
      icon: LayoutDashboard,
    };

    if (user.role === "admin") {
      // 1. REGISTRAR MODE
      if (isRegistrarRoute) {
        const baseUrl = "/dashboard/staff/registrar";
        return [
          { label: "Back to Admin", href: "/dashboard/admin", icon: Shield },
          dashboardLink,
          {
            label: "School Years",
            href: `${baseUrl}/school-years`,
            icon: Calendar,
          },
          { label: "Teachers", href: `${baseUrl}/teachers`, icon: Users },
          { label: "Subjects", href: `${baseUrl}/subjects`, icon: BookOpen },
          { label: "Class Builder", href: `${baseUrl}/sections`, icon: School },
          {
            label: "Enrollment",
            href: `${baseUrl}/enrollments`,
            icon: ClipboardList,
          },
          {
            label: "Students",
            href: `${baseUrl}/students`,
            icon: GraduationCap,
          },
          {
            label: "Contact Messages",
            href: `${baseUrl}/messages`,
            icon: Mail,
          },
        ];
      }

      // 2. CLINIC MODE
      if (isClinicRoute) {
        return [
          { label: "Back to Admin", href: "/dashboard/admin", icon: Shield },
          dashboardLink,
        ];
      }

      // 3. GUIDANCE MODE
      if (isGuidanceRoute) {
        return [
          { label: "Back to Admin", href: "/dashboard/admin", icon: Shield },
          dashboardLink,
        ];
      }

      // 4. ACCOUNTING MODE
      if (isAccountingRoute) {
        return [
          { label: "Back to Admin", href: "/dashboard/admin", icon: Shield },
          dashboardLink,
        ];
      }

      // 5. FACULTY MODE
      if (isFacultyRoute) {
        const baseUrl = "/dashboard/staff/faculty";
        return [
          { label: "Back to Admin", href: "/dashboard/admin", icon: Shield },
          {
            label: "Enrollment",
            href: `${baseUrl}/enrollments`,
            icon: ClipboardList,
          },
          {
            label: "Advisory Grades",
            href: `${baseUrl}/advisory-grades`,
            icon: FileText,
          },
        ];
      }

      // DEFAULT ADMIN VIEW
      return [
        dashboardLink,
        {
          label: "User Management",
          href: "/dashboard/admin/users",
          icon: Users,
        },
      ];
    }

    if (user.role === "student") {
      return [
        dashboardLink,
        {
          label: "My Profile",
          href: "/dashboard/student/profile",
          icon: UserCircle,
        },
        /*
        {
          label: "My Grades",
          href: "/dashboard/student/grades",
          icon: GraduationCap,
        },
        */
      ];
    }

    if (user.role === "staff") {
      if (user.staffDepartment === "registrar") {
        const baseUrl = "/dashboard/staff/registrar";
        return [
          dashboardLink,
          {
            label: "School Years",
            href: `${baseUrl}/school-years`,
            icon: Calendar,
          },
          { label: "Teachers", href: `${baseUrl}/teachers`, icon: Users },
          { label: "Subjects", href: `${baseUrl}/subjects`, icon: BookOpen },
          { label: "Class Builder", href: `${baseUrl}/sections`, icon: School },
          {
            label: "Enrollment",
            href: `${baseUrl}/enrollments`,
            icon: ClipboardList,
          },
          {
            label: "Students",
            href: `${baseUrl}/students`,
            icon: GraduationCap,
          },
          {
            label: "Contact Messages",
            href: `${baseUrl}/messages`,
            icon: Mail,
          },
        ];
      }

      if (user.staffDepartment === "faculty") {
        const baseUrl = "/dashboard/staff/faculty";
        return [
          {
            label: "Enrollment",
            href: `${baseUrl}/enrollments`,
            icon: ClipboardList,
          },
          {
            label: "Advisory Grades",
            href: `${baseUrl}/advisory-grades`,
            icon: FileText,
          },
        ];
      }

      // Other staff (clinic, guidance, accounting)
      return [dashboardLink];
    }

    return [];
  };

  const links = getLinks();

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="fixed top-0 right-0 left-0 z-50 flex h-16 items-center border-gray-200 border-b bg-white px-4 shadow-sm lg:hidden">
        <Button
          className="mr-2"
          onClick={() => setIsOpen(!isOpen)}
          size="icon"
          variant="ghost"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
        <div className="flex items-center space-x-2">
          <div className="relative h-8 w-8">
            <Image
              alt="MPPSI"
              className="object-contain"
              fill
              sizes="32px"
              src="/logo.webp"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[#8B0000] text-lg tracking-tight leading-none">
              MPPSI Portal
            </span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mt-0.5">
              {displayRole}
            </span>
          </div>
        </div>
      </div>

      {/* Sidebar Container */}
      <div
        className={cn(
          "fixed inset-y-0 top-16 left-0 z-40 w-64 transform border-gray-200 border-r bg-white transition-transform duration-200 ease-in-out lg:static lg:top-0 lg:block lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col bg-white text-gray-800">
          {/* Header / Logo (Desktop only) */}
          <div className="hidden h-16 items-center border-gray-100 border-b px-6 lg:flex">
            <div className="flex items-center space-x-2">
              <div className="relative h-8 w-8">
                <Image
                  alt="MPPSI"
                  className="object-contain"
                  fill
                  sizes="32px"
                  src="/logo.webp"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#8B0000] text-lg tracking-tight leading-none">
                  MPPSI Portal
                </span>
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mt-0.5">
                  {displayRole}
                </span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-3">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive =
                  link.label === "Dashboard"
                    ? pathname === link.href
                    : pathname === link.href ||
                      pathname.startsWith(`${link.href}/`);

                const activeStyle = isActive
                  ? "bg-red-50 text-red-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";

                return (
                  <Link
                    className={cn(
                      "group flex items-center rounded-md px-3 py-2.5 font-medium text-sm transition-colors",
                      activeStyle,
                    )}
                    href={link.href}
                    key={link.label + link.href}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon
                      className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0",
                        isActive
                          ? "text-red-700"
                          : "text-gray-400 group-hover:text-gray-500",
                      )}
                    />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile Footer */}
          <div className="border-gray-100 border-t bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center min-w-0 flex-1">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-100 font-bold text-red-800 uppercase shadow-sm">
                  {user.firstName?.[0] || user.email?.[0]}
                </div>
                <div className="ml-3 overflow-hidden flex-1">
                  <p className="truncate font-semibold text-gray-900 text-sm">
                    {fullName}
                  </p>
                  <p className="truncate text-gray-500 text-[11px] font-medium uppercase tracking-wider">
                    {displayRole}
                  </p>
                </div>
              </div>
              <Link
                className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  pathname === settingsHref
                    ? "bg-red-100 text-red-700 shadow-inner"
                    : "text-gray-400 hover:bg-gray-200 hover:text-gray-600",
                )}
                href={settingsHref}
                title="Account Settings"
              >
                <Settings className="h-5 w-5" />
              </Link>
            </div>

            <form action={logout} className="w-full">
              <Button
                className="w-full justify-start border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700"
                type="submit"
                variant="outline"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
