"use client";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Avatar, AvatarFallback } from "@school/ui";
import { EditPayrollDialog } from "./edit-payroll-dialog";
import { Edit2, Briefcase, GraduationCap, UserCog, Clock, Users } from "lucide-react";

export function PayrollTable({ periodId, initialPayrolls, isFinalized = false }: { periodId: number, initialPayrolls: any[], isFinalized?: boolean }) {
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>("all");

  if (!initialPayrolls || initialPayrolls.length === 0) {
    return (
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">Staff Name</TableHead>
              <TableHead className="font-semibold text-slate-600">Base Salary</TableHead>
              <TableHead className="font-semibold text-slate-600">Net Pay</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                No payroll records generated for this period yet. Click "Generate Payroll" to populate from contracts.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  const groupedPayrolls = initialPayrolls.reduce((acc: any, record: any) => {
    const type = record.employeeType || record.employee?.type || "unknown";
    if (!acc[type]) acc[type] = [];
    acc[type].push(record);
    return acc;
  }, {});

  const fmt = (val: string) => !val || val === "0.00" ? <span className="text-slate-300">-</span> : val;
  const fmtEe = (val: string) => !val || val === "0.00" ? <span className="text-slate-300">-</span> : <span className="text-rose-700 font-bold">{val}</span>;
  const fmtEr = (val: string) => !val || val === "0.00" ? <span className="text-slate-300">-</span> : <span className="text-slate-500 font-medium text-[11px]">{val}</span>;
  const renderEmployeeName = (record: any) => {
    const initials = `${record.employee?.firstName?.[0] || ""}${record.employee?.lastName?.[0] || ""}`.toUpperCase();
    return (
      <div className="flex items-center gap-3 whitespace-nowrap">
        <Avatar className="h-9 w-9 border shadow-sm">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">{record.employee?.lastName}, {record.employee?.firstName}</span>
        </div>
      </div>
    );
  };

  const renderAdministratorsTable = (records: any[]) => (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Briefcase className="h-5 w-5 text-indigo-500" />
        <h3 className="text-lg font-bold text-slate-800">Administrators</h3>
      </div>
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent">
              <TableHead rowSpan={3} className="min-w-[220px] font-semibold text-slate-600 align-middle border-r border-slate-100">Name</TableHead>
              <TableHead colSpan={3} className="text-center bg-slate-100/50 font-semibold text-slate-600 border-r border-slate-200">Earnings</TableHead>
              <TableHead colSpan={8} className="text-center bg-rose-50/50 font-semibold text-slate-600 border-r border-slate-200">Deductions</TableHead>
              <TableHead rowSpan={3} className="text-right font-bold text-slate-700 min-w-[120px] align-middle border-l border-slate-100">Net Pay</TableHead>
              <TableHead rowSpan={3} className="text-right font-semibold text-slate-600 min-w-[80px] align-middle">Actions</TableHead>
            </TableRow>
            <TableRow className="hover:bg-transparent">
              {/* Earnings */}
              <TableHead rowSpan={2} className="text-right text-xs bg-slate-100/50 border-l border-slate-200 align-middle">Base</TableHead>
              <TableHead rowSpan={2} className="text-right text-xs bg-slate-100/50 align-middle">Half</TableHead>
              <TableHead rowSpan={2} className="text-right text-xs bg-slate-200/50 font-bold text-slate-700 border-r border-slate-200 align-middle">Total Earnings</TableHead>
              
              {/* Deductions */}
              <TableHead colSpan={2} className="text-center text-xs bg-rose-50/50 border-r border-rose-100 border-b border-rose-100/50 py-2">SSS</TableHead>
              <TableHead colSpan={2} className="text-center text-xs bg-rose-50/50 border-r border-rose-100 border-b border-rose-100/50 py-2">PHIC</TableHead>
              <TableHead colSpan={2} className="text-center text-xs bg-rose-50/50 border-r border-rose-100 border-b border-rose-100/50 py-2">HDMF</TableHead>
              <TableHead rowSpan={2} className="text-right text-xs bg-rose-50/50 align-middle border-r border-rose-100">Loan</TableHead>
              <TableHead rowSpan={2} className="text-right text-xs bg-rose-100/50 font-bold text-rose-700 border-r border-slate-200 align-middle">Total Deductions</TableHead>
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-center text-[11px] bg-rose-50/50 text-rose-700 font-semibold px-2 py-2">EE</TableHead>
              <TableHead className="text-center text-[10px] bg-rose-50/50 text-slate-500 border-r border-rose-100 px-2 py-2">ER</TableHead>
              <TableHead className="text-center text-[11px] bg-rose-50/50 text-rose-700 font-semibold px-2 py-2">EE</TableHead>
              <TableHead className="text-center text-[10px] bg-rose-50/50 text-slate-500 border-r border-rose-100 px-2 py-2">ER</TableHead>
              <TableHead className="text-center text-[11px] bg-rose-50/50 text-rose-700 font-semibold px-2 py-2">EE</TableHead>
              <TableHead className="text-center text-[10px] bg-rose-50/50 text-slate-500 border-r border-rose-100 px-2 py-2">ER</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id} className="group transition-colors hover:bg-slate-50/50">
                <TableCell className="font-medium border-r border-slate-100 bg-white group-hover:bg-transparent">{renderEmployeeName(record)}</TableCell>
                <TableCell className="text-right font-medium text-slate-600">{fmt(record.baseSalary)}</TableCell>
                <TableCell className="text-right font-medium text-slate-600">{fmt(record.halfSalary)}</TableCell>
                <TableCell className="text-right font-bold text-slate-800 bg-slate-50/80 border-r border-slate-100 group-hover:bg-transparent">{fmt(record.totalEarnings)}</TableCell>
                <TableCell className="text-right bg-rose-50/10 px-3">{fmtEe(record.sssEe)}</TableCell>
                <TableCell className="text-right border-r border-rose-50 px-3">{fmtEr(record.sssEr)}</TableCell>
                <TableCell className="text-right bg-rose-50/10 px-3">{fmtEe(record.philhealthEe)}</TableCell>
                <TableCell className="text-right border-r border-rose-50 px-3">{fmtEr(record.philhealthEr)}</TableCell>
                <TableCell className="text-right bg-rose-50/10 px-3">{fmtEe(record.pagIbigEe)}</TableCell>
                <TableCell className="text-right border-r border-rose-100 px-3">{fmtEr(record.pagIbigEr)}</TableCell>
                <TableCell className="text-right text-rose-600/80">{fmt(record.loanDeduction)}</TableCell>
                <TableCell className="text-right font-bold text-rose-700 bg-rose-50/40 border-r border-slate-100 group-hover:bg-transparent">{fmt(record.totalDeductions)}</TableCell>
                <TableCell className="text-right font-bold text-emerald-600 bg-emerald-50/40 group-hover:bg-transparent text-lg">{fmt(record.netPay)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" onClick={() => setEditingRecord(record)} disabled={isFinalized}><Edit2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const renderTeachingTable = (records: any[]) => (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <GraduationCap className="h-5 w-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-slate-800">Teaching</h3>
      </div>
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent">
              <TableHead rowSpan={3} className="min-w-[220px] font-semibold text-slate-600 align-middle border-r border-slate-100">Name</TableHead>
              <TableHead colSpan={6} className="text-center bg-slate-100/50 font-semibold text-slate-600 border-r border-slate-200">Earnings</TableHead>
              <TableHead colSpan={8} className="text-center bg-rose-50/50 font-semibold text-slate-600 border-r border-slate-200">Deductions</TableHead>
              <TableHead rowSpan={3} className="text-right font-bold text-slate-700 min-w-[120px] align-middle border-l border-slate-100">Net Pay</TableHead>
              <TableHead rowSpan={3} className="text-right font-semibold text-slate-600 min-w-[80px] align-middle">Actions</TableHead>
            </TableRow>
            <TableRow className="hover:bg-transparent">
              {/* Earnings */}
              <TableHead rowSpan={2} className="text-right text-xs bg-slate-100/50 border-l border-slate-200 align-middle">Base</TableHead>
              <TableHead rowSpan={2} className="text-right text-xs bg-slate-100/50 align-middle">Half</TableHead>
              <TableHead rowSpan={2} className="text-right text-xs bg-slate-100/50 align-middle">Overload</TableHead>
              <TableHead rowSpan={2} className="text-right text-xs bg-slate-100/50 align-middle">Position</TableHead>
              <TableHead rowSpan={2} className="text-right text-xs bg-slate-100/50 align-middle">Advisory</TableHead>
              <TableHead rowSpan={2} className="text-right text-xs bg-slate-200/50 font-bold text-slate-700 border-r border-slate-200 align-middle">Total Earnings</TableHead>
              
              {/* Deductions */}
              <TableHead colSpan={2} className="text-center text-xs bg-rose-50/50 border-r border-rose-100 border-b border-rose-100/50 py-2">SSS</TableHead>
              <TableHead colSpan={2} className="text-center text-xs bg-rose-50/50 border-r border-rose-100 border-b border-rose-100/50 py-2">PHIC</TableHead>
              <TableHead colSpan={2} className="text-center text-xs bg-rose-50/50 border-r border-rose-100 border-b border-rose-100/50 py-2">HDMF</TableHead>
              <TableHead rowSpan={2} className="text-right text-xs bg-rose-50/50 align-middle border-r border-rose-100">Loan</TableHead>
              <TableHead rowSpan={2} className="text-right text-xs bg-rose-100/50 font-bold text-rose-700 border-r border-slate-200 align-middle">Total Deductions</TableHead>
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-center text-[11px] bg-rose-50/50 text-rose-700 font-semibold px-2 py-2">EE</TableHead>
              <TableHead className="text-center text-[10px] bg-rose-50/50 text-slate-500 border-r border-rose-100 px-2 py-2">ER</TableHead>
              <TableHead className="text-center text-[11px] bg-rose-50/50 text-rose-700 font-semibold px-2 py-2">EE</TableHead>
              <TableHead className="text-center text-[10px] bg-rose-50/50 text-slate-500 border-r border-rose-100 px-2 py-2">ER</TableHead>
              <TableHead className="text-center text-[11px] bg-rose-50/50 text-rose-700 font-semibold px-2 py-2">EE</TableHead>
              <TableHead className="text-center text-[10px] bg-rose-50/50 text-slate-500 border-r border-rose-100 px-2 py-2">ER</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id} className="group transition-colors hover:bg-slate-50/50">
                <TableCell className="font-medium border-r border-slate-100 bg-white group-hover:bg-transparent">{renderEmployeeName(record)}</TableCell>
                <TableCell className="text-right font-medium text-slate-600">{fmt(record.baseSalary)}</TableCell>
                <TableCell className="text-right font-medium text-slate-600">{fmt(record.halfSalary)}</TableCell>
                <TableCell className="text-right font-medium text-slate-600">{fmt(record.subjectOverload)}</TableCell>
                <TableCell className="text-right font-medium text-slate-600">{fmt(record.positionPay)}</TableCell>
                <TableCell className="text-right font-medium text-slate-600">{fmt(record.advisoryPay)}</TableCell>
                <TableCell className="text-right font-bold text-slate-800 bg-slate-50/80 border-r border-slate-100 group-hover:bg-transparent">{fmt(record.totalEarnings)}</TableCell>
                <TableCell className="text-right bg-rose-50/10 px-3">{fmtEe(record.sssEe)}</TableCell>
                <TableCell className="text-right border-r border-rose-50 px-3">{fmtEr(record.sssEr)}</TableCell>
                <TableCell className="text-right bg-rose-50/10 px-3">{fmtEe(record.philhealthEe)}</TableCell>
                <TableCell className="text-right border-r border-rose-50 px-3">{fmtEr(record.philhealthEr)}</TableCell>
                <TableCell className="text-right bg-rose-50/10 px-3">{fmtEe(record.pagIbigEe)}</TableCell>
                <TableCell className="text-right border-r border-rose-100 px-3">{fmtEr(record.pagIbigEr)}</TableCell>
                <TableCell className="text-right text-rose-600/80">{fmt(record.loanDeduction)}</TableCell>
                <TableCell className="text-right font-bold text-rose-700 bg-rose-50/40 border-r border-slate-100 group-hover:bg-transparent">{fmt(record.totalDeductions)}</TableCell>
                <TableCell className="text-right font-bold text-emerald-600 bg-emerald-50/40 group-hover:bg-transparent text-lg">{fmt(record.netPay)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" onClick={() => setEditingRecord(record)} disabled={isFinalized}><Edit2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const renderNonTeachingTable = (records: any[]) => (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <UserCog className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-bold text-slate-800">Non-Teaching</h3>
      </div>
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent">
              <TableHead rowSpan={3} className="min-w-[220px] font-semibold text-slate-600 align-middle border-r border-slate-100">Name</TableHead>
              <TableHead colSpan={8} className="text-center bg-slate-100/50 font-semibold text-slate-600 border-r border-slate-200">Earnings</TableHead>
              <TableHead colSpan={8} className="text-center bg-rose-50/50 font-semibold text-slate-600 border-r border-slate-200">Deductions</TableHead>
              <TableHead rowSpan={3} className="text-right font-bold text-slate-700 min-w-[120px] align-middle border-l border-slate-100">Net Pay</TableHead>
              <TableHead rowSpan={3} className="text-right font-semibold text-slate-600 min-w-[80px] align-middle">Actions</TableHead>
            </TableRow>
            <TableRow className="hover:bg-transparent">
              {/* Earnings */}
              <TableHead rowSpan={2} className="text-right text-xs bg-slate-100/50 border-l border-slate-200 align-middle">Base</TableHead>
              <TableHead rowSpan={2} className="text-right text-xs bg-slate-100/50 align-middle">Half</TableHead>
              <TableHead rowSpan={2} className="text-right text-xs bg-slate-100/50 align-middle">Add'l</TableHead>
              <TableHead rowSpan={2} className="text-right text-xs bg-slate-100/50 align-middle">Overload</TableHead>
              <TableHead rowSpan={2} className="text-right text-xs bg-slate-100/50 align-middle">Transpo</TableHead>
              <TableHead rowSpan={2} className="text-right text-xs bg-slate-100/50 align-middle">Holiday</TableHead>
              <TableHead rowSpan={2} className="text-right text-xs bg-slate-100/50 align-middle">Moderator</TableHead>
              <TableHead rowSpan={2} className="text-right text-xs bg-slate-200/50 font-bold text-slate-700 border-r border-slate-200 align-middle">Total Earnings</TableHead>
              
              {/* Deductions */}
              <TableHead colSpan={2} className="text-center text-xs bg-rose-50/50 border-r border-rose-100 border-b border-rose-100/50 py-2">SSS</TableHead>
              <TableHead colSpan={2} className="text-center text-xs bg-rose-50/50 border-r border-rose-100 border-b border-rose-100/50 py-2">PHIC</TableHead>
              <TableHead colSpan={2} className="text-center text-xs bg-rose-50/50 border-r border-rose-100 border-b border-rose-100/50 py-2">HDMF</TableHead>
              <TableHead rowSpan={2} className="text-right text-xs bg-rose-50/50 align-middle border-r border-rose-100">Loan</TableHead>
              <TableHead rowSpan={2} className="text-right text-xs bg-rose-100/50 font-bold text-rose-700 border-r border-slate-200 align-middle">Total Deductions</TableHead>
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-center text-[11px] bg-rose-50/50 text-rose-700 font-semibold px-2 py-2">EE</TableHead>
              <TableHead className="text-center text-[10px] bg-rose-50/50 text-slate-500 border-r border-rose-100 px-2 py-2">ER</TableHead>
              <TableHead className="text-center text-[11px] bg-rose-50/50 text-rose-700 font-semibold px-2 py-2">EE</TableHead>
              <TableHead className="text-center text-[10px] bg-rose-50/50 text-slate-500 border-r border-rose-100 px-2 py-2">ER</TableHead>
              <TableHead className="text-center text-[11px] bg-rose-50/50 text-rose-700 font-semibold px-2 py-2">EE</TableHead>
              <TableHead className="text-center text-[10px] bg-rose-50/50 text-slate-500 border-r border-rose-100 px-2 py-2">ER</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id} className="group transition-colors hover:bg-slate-50/50">
                <TableCell className="font-medium border-r border-slate-100 bg-white group-hover:bg-transparent">{renderEmployeeName(record)}</TableCell>
                <TableCell className="text-right font-medium text-slate-600">{fmt(record.baseSalary)}</TableCell>
                <TableCell className="text-right font-medium text-slate-600">{fmt(record.halfSalary)}</TableCell>
                <TableCell className="text-right font-medium text-slate-600">{fmt(record.additionalPay)}</TableCell>
                <TableCell className="text-right font-medium text-slate-600">{fmt(record.subjectOverload)}</TableCell>
                <TableCell className="text-right font-medium text-slate-600">{fmt(record.transpoAllowance)}</TableCell>
                <TableCell className="text-right font-medium text-slate-600">{fmt(record.holidayPay)}</TableCell>
                <TableCell className="text-right font-medium text-slate-600">{fmt(record.moderatorPay)}</TableCell>
                <TableCell className="text-right font-bold text-slate-800 bg-slate-50/80 border-r border-slate-100 group-hover:bg-transparent">{fmt(record.totalEarnings)}</TableCell>
                <TableCell className="text-right bg-rose-50/10 px-3">{fmtEe(record.sssEe)}</TableCell>
                <TableCell className="text-right border-r border-rose-50 px-3">{fmtEr(record.sssEr)}</TableCell>
                <TableCell className="text-right bg-rose-50/10 px-3">{fmtEe(record.philhealthEe)}</TableCell>
                <TableCell className="text-right border-r border-rose-50 px-3">{fmtEr(record.philhealthEr)}</TableCell>
                <TableCell className="text-right bg-rose-50/10 px-3">{fmtEe(record.pagIbigEe)}</TableCell>
                <TableCell className="text-right border-r border-rose-100 px-3">{fmtEr(record.pagIbigEr)}</TableCell>
                <TableCell className="text-right text-rose-600/80">{fmt(record.loanDeduction)}</TableCell>
                <TableCell className="text-right font-bold text-rose-700 bg-rose-50/40 border-r border-slate-100 group-hover:bg-transparent">{fmt(record.totalDeductions)}</TableCell>
                <TableCell className="text-right font-bold text-emerald-600 bg-emerald-50/40 group-hover:bg-transparent text-lg">{fmt(record.netPay)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" onClick={() => setEditingRecord(record)} disabled={isFinalized}><Edit2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const renderPartTimeTable = (records: any[]) => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-sky-500" />
          <h3 className="text-lg font-bold text-slate-800">Part-Time Teaching</h3>
        </div>
        {!isFinalized && (
          <p className="text-xs text-amber-700 font-medium bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200 flex items-center gap-2 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Click Edit to fill in the "Classes per Cut-off" for each employee.
          </p>
        )}
      </div>
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[220px] font-semibold text-slate-600">Name</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Daily Salary Rate</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Subject Hours/Day</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Classes (Cut-off)</TableHead>
              <TableHead className="text-right font-bold text-slate-700">Net Pay</TableHead>
              <TableHead className="text-right font-semibold text-slate-600 min-w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id} className="group transition-colors hover:bg-slate-50/50">
                <TableCell className="font-medium border-r border-slate-100 bg-white group-hover:bg-transparent">{renderEmployeeName(record)}</TableCell>
                <TableCell className="text-right font-medium text-slate-600">{fmt(record.dailySalary)}</TableCell>
                <TableCell className="text-right font-medium text-slate-600">{fmt(record.subjectHoursPerDay)}</TableCell>
                <TableCell className="text-right font-medium text-slate-900">
                  {record.numberOfClasses || "0"}
                  {(!record.numberOfClasses || parseInt(record.numberOfClasses) === 0) && !isFinalized && (
                    <span className="block text-[10px] text-amber-600 mt-0.5 font-medium">Needs input</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-bold text-emerald-600 bg-emerald-50/40 group-hover:bg-transparent text-lg">{fmt(record.netPay)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" onClick={() => setEditingRecord(record)} disabled={isFinalized}><Edit2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex bg-slate-100/80 p-1.5 rounded-xl w-fit border border-slate-200/60 shadow-inner">
          <button 
            onClick={() => setFilterType("all")} 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${filterType === "all" ? "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
          >
            <Users className="h-4 w-4" /> All Types
          </button>
          <button 
            onClick={() => setFilterType("administrators")} 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${filterType === "administrators" ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
          >
            <Briefcase className="h-4 w-4" /> Administrators
          </button>
          <button 
            onClick={() => setFilterType("teaching")} 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${filterType === "teaching" ? "bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
          >
            <GraduationCap className="h-4 w-4" /> Teaching
          </button>
          <button 
            onClick={() => setFilterType("non_teaching")} 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${filterType === "non_teaching" ? "bg-white text-amber-600 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
          >
            <UserCog className="h-4 w-4" /> Non-Teaching
          </button>
          <button 
            onClick={() => setFilterType("part_time_teaching")} 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${filterType === "part_time_teaching" ? "bg-white text-sky-600 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
          >
            <Clock className="h-4 w-4" /> Part-Time Teaching
          </button>
        </div>
      </div>
      <div className="space-y-6">
        {(filterType === "all" || filterType === "administrators") && groupedPayrolls["administrators"] && renderAdministratorsTable(groupedPayrolls["administrators"])}
        {(filterType === "all" || filterType === "teaching") && groupedPayrolls["teaching"] && renderTeachingTable(groupedPayrolls["teaching"])}
        {(filterType === "all" || filterType === "non_teaching") && groupedPayrolls["non_teaching"] && renderNonTeachingTable(groupedPayrolls["non_teaching"])}
        {(filterType === "all" || filterType === "part_time_teaching") && groupedPayrolls["part_time_teaching"] && renderPartTimeTable(groupedPayrolls["part_time_teaching"])}
        {(filterType === "all" || filterType === "unknown") && groupedPayrolls["unknown"] && (
          <div className="text-slate-500">Some records have an unknown employee type.</div>
        )}
      </div>

      <EditPayrollDialog 
        open={!!editingRecord} 
        onOpenChange={(open) => !open && setEditingRecord(null)}
        record={editingRecord}
      />
    </>
  );
}
