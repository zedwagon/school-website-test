import {
  Activity,
  ArrowRight,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-12 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gray-900 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 transform opacity-10">
          <Settings className="h-64 w-64" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-2 backdrop-blur-md">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <h1 className="font-bold text-3xl tracking-tight">
              System Administration
            </h1>
          </div>
          <p className="mt-2 max-w-2xl text-gray-400 text-sm leading-relaxed">
            Central command for MPPSI portal. Manage system-wide users, oversee
            enrollment pipelines, and coordinate departmental clearances.
          </p>
        </div>
      </div>

      {/* Section 1: Core Administration */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <Settings className="h-5 w-5 text-gray-400" />
          <h2 className="font-bold text-xl text-gray-900 uppercase tracking-wider">
            Core Administration
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {/* User Management */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute top-0 right-0 h-2 w-full bg-indigo-500" />
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Users className="h-6 w-6" />
              </div>
              <span className="text-gray-300 text-xs font-bold uppercase">
                Auth & Access
              </span>
            </div>
            <h3 className="mb-2 font-bold text-gray-900 text-xl">
              User Management
            </h3>
            <p className="mb-6 text-gray-500 text-sm leading-relaxed">
              Create staff accounts, manage student access permissions, and
              oversee all active system users.
            </p>
            <Link
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-sm text-white transition-colors hover:bg-indigo-700"
              href="/dashboard/admin/users"
            >
              Manage System Users
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Registrar */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute top-0 right-0 h-2 w-full bg-red-500" />
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-red-50 p-3 text-red-600">
                <ClipboardList className="h-6 w-6" />
              </div>
              <span className="text-gray-300 text-xs font-bold uppercase">
                Registry
              </span>
            </div>
            <h3 className="mb-2 font-bold text-gray-900 text-xl">Registrar</h3>
            <p className="mb-6 text-gray-500 text-sm leading-relaxed">
              Oversee the primary enrollment records, manage sections, school
              years, and maintain student databases.
            </p>
            <Link
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-sm text-white transition-colors hover:bg-red-700"
              href="/dashboard/staff/registrar"
            >
              Open Registrar Portal
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2: Enrollment Flow */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <Activity className="h-5 w-5 text-gray-400" />
          <h2 className="font-bold text-xl text-gray-900 uppercase tracking-wider">
            Enrollment Clearance Process
          </h2>
        </div>

        <div className="relative">
          {/* Connecting Arrows for Desktop */}
          <div className="absolute top-1/2 left-0 hidden w-full -translate-y-1/2 items-center justify-around px-24 lg:flex">
            <div className="h-[2px] flex-1 bg-gradient-to-r from-emerald-200 to-indigo-200" />
            <div className="h-[2px] flex-1 bg-gradient-to-r from-indigo-200 to-blue-200" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Step 1: Clinic */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 font-bold text-white shadow-lg ring-4 ring-emerald-50">
                1
              </div>
              <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Clinic</h3>
                </div>
                <p className="mb-6 h-12 text-gray-500 text-sm leading-snug">
                  First step: Review physical exams and medical history records
                  for clearance.
                </p>
                <Link
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-bold text-sm text-white transition-all hover:bg-emerald-700 hover:shadow-lg active:scale-95"
                  href="/dashboard/staff/clinic"
                >
                  Go to Clinic
                </Link>
              </div>
            </div>

            {/* Step 2: Guidance */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-bold text-white shadow-lg ring-4 ring-indigo-50">
                2
              </div>
              <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Guidance</h3>
                </div>
                <p className="mb-6 h-12 text-gray-500 text-sm leading-snug">
                  Second step: Conduct interviews and behavioral assessments for
                  final approval.
                </p>
                <Link
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-bold text-sm text-white transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-95"
                  href="/dashboard/staff/guidance"
                >
                  Go to Guidance
                </Link>
              </div>
            </div>

            {/* Step 3: Accounting */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white shadow-lg ring-4 ring-blue-50">
                3
              </div>
              <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Accounting
                  </h3>
                </div>
                <p className="mb-6 h-12 text-gray-500 text-sm leading-snug">
                  Final step: Process tuition payments and finalize the student
                  enrollment status.
                </p>
                <Link
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-sm text-white transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95"
                  href="/dashboard/staff/accounting"
                >
                  Go to Accounting
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
