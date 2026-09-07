"use client";

import { useEffect, useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Input, Label, toast, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@school/ui";
import { Wallet, Receipt } from "lucide-react";
import { saveEmployeeContract, updateEmployee } from "@school/api/accounting/payroll/action";
import { useRouter } from "next/navigation";

function CurrencyInput({ id, label, value, onChange, required = false }: { id: string, label: string, value: string | number, onChange: any, required?: boolean }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">₱</span>
        <Input 
          type="number" 
          step="0.01" 
          className="pl-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
          id={id} 
          name={id} 
          value={value} 
          onChange={onChange} 
          onFocus={e => e.target.select()} 
          required={required} 
        />
      </div>
    </div>
  );
}

export function EditContractDialog({ open, onOpenChange, record }: { open: boolean, onOpenChange: (open: boolean) => void, record: any }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [employeeType, setEmployeeType] = useState<string>("teaching");
  const [formData, setFormData] = useState({
    baseSalary: "0",
    transpoAllowance: "0",
    positionPay: "0",
    advisoryPay: "0",
    holidayPay: "0",
    additionalPay: "0",
    moderatorPay: "0",
    dailySalary: "0",
    subjectHoursPerDay: "0",
    sssEe: "0",
    sssEr: "0",
    philhealthEe: "0",
    philhealthEr: "0",
    pagIbigEe: "0",
    pagIbigEr: "0",
  });

  useEffect(() => {
    if (record?.employee?.type) setEmployeeType(record.employee.type);
    
    if (record?.contract) {
      setFormData({
        baseSalary: record.contract.baseSalary || "0",
        transpoAllowance: record.contract.transpoAllowance || "0",
        positionPay: record.contract.positionPay || "0",
        advisoryPay: record.contract.advisoryPay || "0",
        holidayPay: record.contract.holidayPay || "0",
        additionalPay: record.contract.additionalPay || "0",
        moderatorPay: record.contract.moderatorPay || "0",
        dailySalary: record.contract.dailySalary || "0",
        subjectHoursPerDay: record.contract.subjectHoursPerDay || "0",
        sssEe: record.contract.sssEe || "0",
        sssEr: record.contract.sssEr || "0",
        philhealthEe: record.contract.philhealthEe || "0",
        philhealthEr: record.contract.philhealthEr || "0",
        pagIbigEe: record.contract.pagIbigEe || "0",
        pagIbigEr: record.contract.pagIbigEr || "0",
      });
    } else {
      setFormData({
        baseSalary: "0", transpoAllowance: "0", positionPay: "0", advisoryPay: "0",
        holidayPay: "0", additionalPay: "0", moderatorPay: "0",
        dailySalary: "0", subjectHoursPerDay: "0",
        sssEe: "0", sssEr: "0", philhealthEe: "0", philhealthEr: "0", pagIbigEe: "0", pagIbigEr: "0",
      });
    }
  }, [record]);

  if (!record) return null;
  const employee = record.employee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (employee.type !== employeeType) {
          await updateEmployee(employee.id, { type: employeeType as any });
        }
        await saveEmployeeContract(employee.id, formData);
        toast.success("Contract saved successfully");
        router.refresh();
        onOpenChange(false);
      } catch (error: any) {
        toast.error(error.message || "Failed to save contract");
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      
      if (name === "philhealthEe") next.philhealthEr = value;
      if (name === "pagIbigEe") next.pagIbigEr = value;
      
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto sm:rounded-2xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl text-slate-800">Contract for {employee.firstName} {employee.lastName}</DialogTitle>
          <DialogDescription className="text-slate-500">
            Set the permanent base salary, allowances, and standard fixed deductions for this employee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-4 space-y-2">
            <Label>Employee Type</Label>
            <Select value={employeeType} onValueChange={setEmployeeType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="administrators">Administrators</SelectItem>
                <SelectItem value="teaching">Teaching</SelectItem>
                <SelectItem value="non_teaching">Non-Teaching</SelectItem>
                <SelectItem value="part_time_teaching">Part-Time Teaching</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earnings */}
            <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-6 shadow-sm space-y-5 h-fit">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-2">
                <Wallet className="h-5 w-5 text-emerald-600" />
                <h3 className="font-semibold text-lg text-slate-800 m-0">Earnings</h3>
              </div>
              
              {employeeType !== "part_time_teaching" && (
                <CurrencyInput id="baseSalary" label="Base Salary (Monthly)" value={formData.baseSalary} onChange={handleChange} required />
              )}
              
              {employeeType === "part_time_teaching" && (
                <>
                  <CurrencyInput id="dailySalary" label="Daily Salary Rate" value={formData.dailySalary} onChange={handleChange} required />
                  <CurrencyInput id="subjectHoursPerDay" label="Subject Hours Per Day" value={formData.subjectHoursPerDay} onChange={handleChange} />
                </>
              )}

              {employeeType === "non_teaching" && (
                <CurrencyInput id="transpoAllowance" label="Transpo Allowance" value={formData.transpoAllowance} onChange={handleChange} />
              )}

              {employeeType === "non_teaching" && (
                <CurrencyInput id="holidayPay" label="Holiday Pay" value={formData.holidayPay} onChange={handleChange} />
              )}

              {employeeType === "teaching" && (
                <>
                  <CurrencyInput id="positionPay" label="Position Pay" value={formData.positionPay} onChange={handleChange} />
                  <CurrencyInput id="advisoryPay" label="Advisory Pay" value={formData.advisoryPay} onChange={handleChange} />
                </>
              )}


              {employeeType === "non_teaching" && (
                <>
                  <CurrencyInput id="additionalPay" label="Additional Pay" value={formData.additionalPay} onChange={handleChange} />
                  <CurrencyInput id="moderatorPay" label="Moderator Pay" value={formData.moderatorPay} onChange={handleChange} />
                </>
              )}
            </div>

            {/* Deductions */}
            {employeeType !== "part_time_teaching" && (
              <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-6 shadow-sm space-y-5 h-fit">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-2">
                  <Receipt className="h-5 w-5 text-rose-600" />
                  <h3 className="font-semibold text-lg text-slate-800 m-0">Standard Deductions</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <CurrencyInput id="sssEe" label="SSS (EE Share)" value={formData.sssEe} onChange={handleChange} />
                  <CurrencyInput id="sssEr" label="SSS (ER Share)" value={formData.sssEr} onChange={handleChange} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <CurrencyInput id="philhealthEe" label="PhilHealth (EE Share)" value={formData.philhealthEe} onChange={handleChange} />
                  <CurrencyInput id="philhealthEr" label="PhilHealth (ER Share)" value={formData.philhealthEr} onChange={handleChange} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <CurrencyInput id="pagIbigEe" label="Pag-IBIG (EE Share)" value={formData.pagIbigEe} onChange={handleChange} />
                  <CurrencyInput id="pagIbigEr" label="Pag-IBIG (ER Share)" value={formData.pagIbigEr} onChange={handleChange} />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 mt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="px-6">Cancel</Button>
            <Button type="submit" disabled={isPending} className="px-6 bg-slate-900 hover:bg-slate-800">{isPending ? "Saving..." : "Save Contract"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
