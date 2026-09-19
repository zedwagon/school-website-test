"use client";

import { useState, useTransition } from "react";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, toast, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Avatar, AvatarFallback } from "@school/ui";
import { Edit2, Ban, RotateCcw, UserX, AlertCircle, Users, Briefcase, GraduationCap, UserCog, Clock, CircleDashed, CheckCircle2 } from "lucide-react";
import { EditContractDialog } from "./edit-contract-dialog";
import { toggleEmployeeStatus } from "@school/api/accounting/payroll/action";
import { useRouter } from "next/navigation";

export function ContractsClient({ records }: { records: any[] }) {
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("active");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredRecords = records.filter(r => {
    const matchType = filterType === "all" || r.employee?.type === filterType;
    
    let matchStatus = true;
    if (filterStatus === "active") {
      matchStatus = !r.employee.archivedAt && !!r.contract;
    } else if (filterStatus === "inactive") {
      matchStatus = !!r.employee.archivedAt;
    } else if (filterStatus === "no_contract") {
      matchStatus = !r.employee.archivedAt && !r.contract;
    }

    return matchType && matchStatus;
  });

  const regularRecords = filteredRecords.filter(r => r.employee.type !== "part_time_teaching");
  const partTimeRecords = filteredRecords.filter(r => r.employee.type === "part_time_teaching");

  const handleToggleStatus = (employeeId: number, currentIsActive: boolean) => {
    startTransition(async () => {
      try {
        await toggleEmployeeStatus(employeeId, !currentIsActive);
        toast.success(`Employee ${!currentIsActive ? 'activated' : 'deactivated'} successfully`);
        router.refresh();
      } catch (error: any) {
        toast.error(error.message || "Failed to update employee status");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 overflow-x-auto w-full xl:w-auto pb-2 lg:pb-0">
          <div className="flex bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/60 shadow-inner w-max">
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
          
          <div className="flex bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/60 shadow-inner w-max">
            <button 
              onClick={() => setFilterStatus("all")} 
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${filterStatus === "all" ? "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
            >
              <CircleDashed className="h-4 w-4" /> All Statuses
            </button>
            <button 
              onClick={() => setFilterStatus("active")} 
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${filterStatus === "active" ? "bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
            >
              <CheckCircle2 className="h-4 w-4" /> Active
            </button>
            <button 
              onClick={() => setFilterStatus("inactive")} 
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${filterStatus === "inactive" ? "bg-white text-rose-600 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
            >
              <Ban className="h-4 w-4" /> Inactive
            </button>
            <button 
              onClick={() => setFilterStatus("no_contract")} 
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${filterStatus === "no_contract" ? "bg-white text-amber-600 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
            >
              <AlertCircle className="h-4 w-4" /> No Contract
            </button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredRecords.length}</span> employees
        </div>
      </div>

      {regularRecords.length > 0 && (
        <div className="mb-8">
          {filterType === "all" && <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2"><Users className="h-5 w-5 text-indigo-500" /> Regular Employees</h3>}
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-600">Employee Name</TableHead>
                  <TableHead className="font-semibold text-slate-600">Type</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Base Salary</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Total Extra Income</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Total Deductions</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regularRecords.map((record) => {
                  const { employee, contract } = record;
                  
                  const totalAllowances = contract 
                    ? parseFloat(contract.transpoAllowance) + parseFloat(contract.positionPay) + parseFloat(contract.advisoryPay) + parseFloat(contract.holidayPay) + parseFloat(contract.additionalPay) + parseFloat(contract.moderatorPay)
                    : 0;
                    
                  const totalDeductions = contract
                    ? parseFloat(contract.sssEe) + parseFloat(contract.philhealthEe) + parseFloat(contract.pagIbigEe)
                    : 0;

                  const initials = `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();

                  return (
                    <TableRow key={employee.id} className="group transition-colors hover:bg-slate-50/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border shadow-sm">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{employee.lastName}, {employee.firstName} {employee.middleName}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-medium bg-slate-100 text-slate-700 capitalize">
                          {employee.type?.replace(/_/g, " ") || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {employee.archivedAt ? (
                          <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">Inactive</Badge>
                        ) : contract ? (
                          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">No Contract</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-900">
                        {contract ? `₱ ${parseFloat(contract.baseSalary).toFixed(2)}` : <span className="text-slate-300">-</span>}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-500">
                        {contract ? `₱ ${totalAllowances.toFixed(2)}` : <span className="text-slate-300">-</span>}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-500">
                        {contract ? `₱ ${totalDeductions.toFixed(2)}` : <span className="text-slate-300">-</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900" onClick={() => setEditingEmployee(record)} disabled={isPending} title={contract ? "Edit Contract" : "Set Contract"}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className={`h-8 w-8 ${employee.archivedAt ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" : "text-rose-600 hover:text-rose-700 hover:bg-rose-50"}`} onClick={() => handleToggleStatus(employee.id, !employee.archivedAt)} disabled={isPending} title={employee.archivedAt ? "Restore Employee" : "Deactivate Employee"}>
                            {employee.archivedAt ? <RotateCcw className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {partTimeRecords.length > 0 && (
        <div className="mb-8">
          {filterType === "all" && <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2"><Clock className="h-5 w-5 text-sky-500" /> Part-Time Employees</h3>}
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-600">Employee Name</TableHead>
                  <TableHead className="font-semibold text-slate-600">Type</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Daily Salary Rate</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Subject Hours / Day</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partTimeRecords.map((record) => {
                  const { employee, contract } = record;
                  const initials = `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();

                  return (
                    <TableRow key={employee.id} className="group transition-colors hover:bg-slate-50/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border shadow-sm">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{employee.lastName}, {employee.firstName} {employee.middleName}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-medium bg-slate-100 text-slate-700 capitalize">
                          {employee.type?.replace(/_/g, " ") || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {employee.archivedAt ? (
                          <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">Inactive</Badge>
                        ) : contract ? (
                          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">No Contract</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-900">
                        {contract ? `₱ ${parseFloat(contract.dailySalary).toFixed(2)}` : <span className="text-slate-300">-</span>}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-500">
                        {contract ? `${parseFloat(contract.subjectHoursPerDay).toFixed(1)} hrs` : <span className="text-slate-300">-</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900" onClick={() => setEditingEmployee(record)} disabled={isPending} title={contract ? "Edit Contract" : "Set Contract"}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className={`h-8 w-8 ${employee.archivedAt ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" : "text-rose-600 hover:text-rose-700 hover:bg-rose-50"}`} onClick={() => handleToggleStatus(employee.id, !employee.archivedAt)} disabled={isPending} title={employee.archivedAt ? "Restore Employee" : "Deactivate Employee"}>
                            {employee.archivedAt ? <RotateCcw className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {filteredRecords.length === 0 && (
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden h-40 flex flex-col items-center justify-center text-slate-500">
          <UserX className="h-10 w-10 mb-3 text-slate-300" />
          <p className="font-medium text-slate-600">No employees match your filters.</p>
        </div>
      )}

      <EditContractDialog 
        open={!!editingEmployee} 
        onOpenChange={(open) => !open && setEditingEmployee(null)} 
        record={editingEmployee} 
      />
    </div>
  );
}
