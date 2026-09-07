"use client";

import { useEffect, useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Input, Label, toast } from "@school/ui";
import { Wallet, Receipt, Edit2, AlertCircle } from "lucide-react";
import { updatePayroll } from "@school/api/accounting/payroll/action";
import { useRouter } from "next/navigation";

function CurrencyInput({ id, label, value, onChange, required = false, disabled = false, allowUnlock = true, className = "" }: { id: string, label: string, value: string | number, onChange: any, required?: boolean, disabled?: boolean, allowUnlock?: boolean, className?: string }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const isEffectivelyDisabled = disabled && !isUnlocked;

  return (
    <div className={`grid gap-2 ${className}`}>
      <div className="flex items-center justify-between mb-1 min-h-[28px]">
        <Label htmlFor={id}>{label}</Label>
        {disabled && allowUnlock && (
          <button 
            type="button" 
            onClick={() => setIsUnlocked(!isUnlocked)} 
            className={`p-1 rounded-md transition-all ${isUnlocked ? 'bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm ring-1 ring-indigo-200' : 'bg-transparent text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
            title={isUnlocked ? "Lock field" : "Unlock field for editing"}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">₱</span>
        <Input 
          type="number" 
          step="0.01" 
          className={`pl-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all ${isEffectivelyDisabled ? "bg-slate-50 border-slate-200 text-slate-500 shadow-none cursor-not-allowed" : "bg-white shadow-sm ring-1 ring-slate-200/50"}`} 
          id={id} 
          name={id} 
          value={value} 
          onChange={onChange} 
          onFocus={e => e.target.select()} 
          required={required} 
          disabled={isEffectivelyDisabled}
        />
      </div>
    </div>
  );
}

export function EditPayrollDialog({ open, onOpenChange, record }: { open: boolean, onOpenChange: (open: boolean) => void, record: any }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [formData, setFormData] = useState({
    baseSalary: "0",
    halfSalary: "0",
    transpoAllowance: "0",
    positionPay: "0",
    advisoryPay: "0",
    holidayPay: "0",
    subjectOverload: "0",
    additionalPay: "0",
    moderatorPay: "0",
    dailySalary: "0",
    subjectHoursPerDay: "0",
    numberOfClasses: "0",
    sssEe: "0",
    sssEr: "0",
    philhealthEe: "0",
    philhealthEr: "0",
    pagIbigEe: "0",
    pagIbigEr: "0",
    loanDeduction: "0",
  });

  useEffect(() => {
    if (record) {
      setFormData({
        baseSalary: record.baseSalary || "0",
        halfSalary: record.halfSalary || "0",
        transpoAllowance: record.transpoAllowance || "0",
        positionPay: record.positionPay || "0",
        advisoryPay: record.advisoryPay || "0",
        holidayPay: record.holidayPay || "0",
        subjectOverload: record.subjectOverload || "0",
        additionalPay: record.additionalPay || "0",
        moderatorPay: record.moderatorPay || "0",
        dailySalary: record.dailySalary || "0",
        subjectHoursPerDay: record.subjectHoursPerDay || "0",
        numberOfClasses: record.numberOfClasses || "0",
        sssEe: record.sssEe || "0",
        sssEr: record.sssEr || "0",
        philhealthEe: record.philhealthEe || "0",
        philhealthEr: record.philhealthEr || "0",
        pagIbigEe: record.pagIbigEe || "0",
        pagIbigEr: record.pagIbigEr || "0",
        loanDeduction: record.loanDeduction || "0",
      });
    }
  }, [record]);

  if (!record) return null;
  const employee = record.employee;
  const type = record.employeeType || employee?.type;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        // Calculations are handled on the server by updatePayroll
        await updatePayroll(record.id, {
          ...formData,
          numberOfClasses: parseInt(formData.numberOfClasses || "0", 10)
        });
        toast.success("Payroll record updated successfully");
        router.refresh();
        onOpenChange(false);
      } catch (error: any) {
        toast.error(error.message || "Failed to update record");
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      
      if (name === "baseSalary") {
        const baseVal = parseFloat(value) || 0;
        next.halfSalary = (baseVal / 2).toFixed(2);
      }
      
      if (name === "philhealthEe") next.philhealthEr = value;
      if (name === "pagIbigEe") next.pagIbigEr = value;
      
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto sm:rounded-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl text-slate-800">Edit Payroll for {employee?.firstName} {employee?.lastName}</DialogTitle>
          <DialogDescription className="text-slate-500">
            Modify earnings or add one-time deductions (like loans) for this specific period.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-6 p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl text-sm text-amber-800 flex items-start gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Notice:</strong> Standard fields like Base Salary and Government Deductions are locked by default. If you need to make manual adjustments for this payroll period, simply click the <strong>pencil icon</strong> next to the field to unlock it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earnings */}
            <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-6 shadow-sm h-fit">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
                <Wallet className="h-5 w-5 text-emerald-600" />
                <h3 className="font-semibold text-lg text-slate-800 m-0">Earnings</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {type !== "part_time_teaching" && (
                  <>
                    <CurrencyInput id="baseSalary" label="Base Salary" value={formData.baseSalary} onChange={handleChange} required disabled />
                    <CurrencyInput id="halfSalary" label="Half Salary" value={formData.halfSalary} onChange={handleChange} required disabled allowUnlock={false} />
                  </>
                )}
                
                {type === "part_time_teaching" && (
                  <>
                    <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-md border border-blue-200 col-span-2">
                      <strong>Note:</strong> You must enter the <em>Number of Classes (Cut-off)</em> to calculate the gross earnings for this period.
                    </div>
                    <CurrencyInput id="dailySalary" label="Daily Salary Rate" value={formData.dailySalary} onChange={handleChange} required disabled />
                    <CurrencyInput id="subjectHoursPerDay" label="Subject Hours Per Day" value={formData.subjectHoursPerDay} onChange={handleChange} disabled />
                    <CurrencyInput id="numberOfClasses" label="Classes (Cut-off)" value={formData.numberOfClasses} onChange={handleChange} required />
                  </>
                )}

                {type === "non_teaching" && (
                  <CurrencyInput id="transpoAllowance" label="Transpo Allowance" value={formData.transpoAllowance} onChange={handleChange} />
                )}

                {type === "non_teaching" && (
                  <CurrencyInput id="holidayPay" label="Holiday Pay" value={formData.holidayPay} onChange={handleChange} />
                )}

                {type === "teaching" && (
                  <>
                    <CurrencyInput id="positionPay" label="Position Pay" value={formData.positionPay} onChange={handleChange} />
                    <CurrencyInput id="advisoryPay" label="Advisory Pay" value={formData.advisoryPay} onChange={handleChange} />
                  </>
                )}

                {(type === "teaching" || type === "non_teaching") && (
                  <CurrencyInput id="subjectOverload" label="Subject Overload" value={formData.subjectOverload} onChange={handleChange} />
                )}

                {type === "non_teaching" && (
                  <>
                    <CurrencyInput id="additionalPay" label="Additional Pay" value={formData.additionalPay} onChange={handleChange} />
                    <CurrencyInput id="moderatorPay" label="Moderator Pay" value={formData.moderatorPay} onChange={handleChange} />
                  </>
                )}
              </div>
            </div>

            {/* Deductions */}
            {type !== "part_time_teaching" && (
              <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-6 shadow-sm space-y-5 h-fit">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-2">
                  <Receipt className="h-5 w-5 text-rose-600" />
                  <h3 className="font-semibold text-lg text-slate-800 m-0">Deductions</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <CurrencyInput id="sssEe" label="SSS (EE Share)" value={formData.sssEe} onChange={handleChange} disabled />
                  <CurrencyInput id="sssEr" label="SSS (ER Share)" value={formData.sssEr} onChange={handleChange} disabled />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <CurrencyInput id="philhealthEe" label="PhilHealth (EE Share)" value={formData.philhealthEe} onChange={handleChange} disabled />
                  <CurrencyInput id="philhealthEr" label="PhilHealth (ER Share)" value={formData.philhealthEr} onChange={handleChange} disabled />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <CurrencyInput id="pagIbigEe" label="Pag-IBIG (EE Share)" value={formData.pagIbigEe} onChange={handleChange} disabled />
                  <CurrencyInput id="pagIbigEr" label="Pag-IBIG (ER Share)" value={formData.pagIbigEr} onChange={handleChange} disabled />
                </div>
                
                <div className="pt-4 border-t">
                  <CurrencyInput id="loanDeduction" label="Loan / Other Deductions" value={formData.loanDeduction} onChange={handleChange} className="text-destructive font-bold" />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 mt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="px-6">Cancel</Button>
            <Button type="submit" disabled={isPending} className="px-6 bg-slate-900 hover:bg-slate-800">{isPending ? "Saving..." : "Save Record"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
