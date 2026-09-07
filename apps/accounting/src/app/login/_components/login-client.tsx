"use client";

import { login } from "@school/api/auth/action";
import { SCHOOL_INFO } from "@school/api/constants";
import { Button, Input, Label } from "@school/ui";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      className="w-full font-bold shadow-md transition-all active:scale-[0.98]"
      disabled={pending}
      size="lg"
      type="submit"
    >
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
    </Button>
  );
}

export default function LoginClient() {
  const [state, formAction] = useActionState(login, null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row bg-slate-50 selection:bg-primary/20">
      {/* Back Button */}
      <div className="absolute top-8 left-8 z-20">
        <Link
          className="group flex items-center gap-3 text-sm font-bold tracking-tight text-slate-600 transition-all hover:text-slate-900"
          href="/"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm ring-primary/5 transition-all group-hover:scale-110 group-hover:border-primary/20 group-hover:bg-white group-hover:text-primary group-hover:ring-4 group-active:scale-95">
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Return to
            </span>
            <span className="hidden sm:inline text-xs font-semibold text-slate-600">
              Accounting Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Left Side: Branding & Info */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 bg-white lg:bg-transparent border-b lg:border-b-0 lg:border-r">
        <div className="max-w-[440px] space-y-8 text-center lg:text-left transition-all duration-700 animate-in fade-in slide-in-from-left-8">
          <div className="relative inline-block h-32 w-32 overflow-hidden rounded-3xl border-4 border-slate-50 shadow-xl lg:h-40 lg:w-40">
            <Image
              alt="MPPSI Logo"
              className="object-contain p-2"
              fill
              priority
              sizes="(max-width: 1024px) 128px, 160px"
              src="/logo.webp"
            />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Accounting <span className="text-primary italic">Portal</span>
            </h1>
            <div className="space-y-1">
              <p className="text-xl font-bold text-slate-800">
                {SCHOOL_INFO.name}
              </p>
              <p className="text-sm font-medium text-slate-500 max-w-[320px] lg:max-w-none">
                Access the secure financial management and reporting portal for managing ledgers, student billing, and employee payroll.
              </p>
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-4 pt-8 border-t border-slate-200">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Location
              </p>
              <p className="text-xs font-semibold text-slate-600 line-clamp-1">
                {SCHOOL_INFO.address.municipality},{" "}
                {SCHOOL_INFO.address.province}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Contact
              </p>
              <p className="text-xs font-semibold text-slate-600">
                {SCHOOL_INFO.phone}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-[400px] space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-slate-900">Sign In</h2>
            <p className="text-sm text-slate-500">
              Enter your credentials to access your account
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50 sm:p-10">
            <form action={formAction} className="space-y-6">
              <div className="space-y-2 text-left">
                <Label
                  className="text-xs font-bold uppercase tracking-wider text-slate-400"
                  htmlFor="email"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="h-12 bg-slate-50/50 border-slate-200 pl-10 ring-offset-background placeholder:text-slate-300 focus-visible:ring-primary focus-visible:ring-2 transition-all"
                    id="email"
                    name="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@school.edu"
                    required
                    type="email"
                    value={email}
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <Label
                    className="text-xs font-bold uppercase tracking-wider text-slate-400"
                    htmlFor="password"
                  >
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="h-12 bg-slate-50/50 border-slate-200 pl-10 pr-12 ring-offset-background placeholder:text-slate-300 focus-visible:ring-primary focus-visible:ring-2 transition-all"
                    id="password"
                    name="password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-900"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    type="button"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {state?.error && (
                <div className="rounded-xl bg-red-50 p-4 text-center text-xs font-bold text-red-600 ring-1 ring-red-100 animate-in shake-in duration-300">
                  {state.error}
                </div>
              )}

              <SubmitButton />
            </form>
          </div>

          <div className="text-center text-xs font-medium text-slate-400 pt-4">
            <p>
              &copy; {new Date().getFullYear()} {SCHOOL_INFO.acronym}. All
              rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
