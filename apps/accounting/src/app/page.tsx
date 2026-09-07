import { Button } from "@school/ui";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { SCHOOL_INFO } from "@school/api/constants";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 selection:bg-primary/20 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[30%] -left-[10%] h-[70%] w-[50%] rounded-full bg-primary/5 blur-[120px] mix-blend-multiply" />
        <div className="absolute top-[20%] -right-[10%] h-[70%] w-[50%] rounded-full bg-rose-200/20 blur-[120px] mix-blend-multiply" />
        <div className="absolute -bottom-[20%] left-[20%] h-[60%] w-[60%] rounded-full bg-primary/10 blur-[120px] mix-blend-multiply" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Navbar */}
      <header className="relative z-50 w-full border-b border-white/40 bg-white/60 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-6 md:px-12">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/60 bg-white p-1 shadow-sm ring-1 ring-slate-900/5">
              <Image src="/logo.webp" alt="Logo" fill className="object-contain p-1" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-black tracking-tight text-slate-900">
                MPPSI
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Accounting
              </span>
            </div>
          </div>
          <Button asChild variant="default" size="sm" className="h-10 rounded-full px-6 font-semibold shadow-sm transition-transform hover:scale-105 active:scale-95">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center">
        <section className="container mx-auto px-6 py-12 md:px-12 text-center">
          <div className="mx-auto flex max-w-4xl flex-col items-center">
            
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/60 px-4 py-1.5 text-xs font-bold tracking-wide text-primary shadow-sm backdrop-blur-md">
              <ShieldCheck className="h-4 w-4" />
              <span>SECURE FINANCIAL SYSTEM</span>
            </div>
            
            <h1 className="text-5xl font-black tracking-tight text-slate-900 sm:text-7xl lg:text-[5.5rem] leading-[1.1]">
              School Finances,
              <br />
              <span className="relative mt-2 inline-block">
                <span className="absolute -inset-2 block rounded-3xl bg-primary/10 blur-xl"></span>
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-primary via-rose-600 to-primary">
                  Simplified.
                </span>
              </span>
            </h1>
            
            <p className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-slate-600 sm:text-xl">
              The centralized accounting platform for {SCHOOL_INFO.name}. Manage ledgers, student billing, tuition plans, and employee payroll in one secure portal.
            </p>
            
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="group h-14 rounded-full bg-primary px-8 text-base font-bold shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/40 active:translate-y-0">
                <Link href="/login">
                  Access Portal 
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8">
        <div className="container mx-auto px-6 text-center text-xs font-semibold uppercase tracking-wider text-slate-400 md:px-12">
          <p>&copy; {new Date().getFullYear()} {SCHOOL_INFO.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
