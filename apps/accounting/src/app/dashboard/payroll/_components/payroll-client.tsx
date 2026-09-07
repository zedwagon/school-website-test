"use client";

import { useState, useTransition, useEffect } from "react";
import { Button, toast, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@school/ui";
import { Printer } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { generatePayrollsForPeriod, updatePayrollPeriodStatus } from "@school/api/accounting/payroll/action";
import { NewPeriodDialog } from "./new-period-dialog";

export function PayrollClient({ periods, initialPeriodId }: { periods: any[], initialPeriodId?: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(initialPeriodId || null);
  
  const getSafeYear = (dateStr: string) => parseInt(dateStr.split('-')[0], 10);
  
  const initialYear = initialPeriodId 
    ? getSafeYear(periods.find(p => p.id === initialPeriodId)?.startDate || new Date().getFullYear().toString())
    : (periods.length > 0 ? getSafeYear(periods[0].startDate) : new Date().getFullYear());
  
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [isPending, startTransition] = useTransition();
  const [isNewPeriodOpen, setIsNewPeriodOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);

  useEffect(() => {
    if (initialPeriodId) {
      setSelectedPeriod(initialPeriodId);
      const year = getSafeYear(periods.find(p => p.id === initialPeriodId)?.startDate || new Date().getFullYear().toString());
      setSelectedYear(year);
    } else if (periods.length > 0) {
      setSelectedPeriod(null);
      setSelectedYear(getSafeYear(periods[0].startDate));
    }
  }, [initialPeriodId, periods]);

  const handlePeriodChange = (val: string) => {
    const id = Number(val);
    setSelectedPeriod(id);
    
    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    params.set("periodId", id.toString());
    router.push(`?${params.toString()}`);
  };

  const handleGenerate = async () => {
    if (!selectedPeriod) return;
    
    setIsGenerateDialogOpen(false);
    startTransition(async () => {
      try {
        await generatePayrollsForPeriod(selectedPeriod);
        toast.success("Payroll generated successfully");
        router.refresh();
      } catch (error: any) {
        toast.error(error.message || "Failed to generate payroll");
      }
    });
  };

  const handleFinalize = async () => {
    if (!selectedPeriod) return;
    
    startTransition(async () => {
      try {
        await updatePayrollPeriodStatus(selectedPeriod, "FINALIZED");
        toast.success("Payroll marked as completed");
        router.refresh();
      } catch (error: any) {
        toast.error(error.message || "Failed to complete period");
      }
    });
  };

  const handleUnfinalize = async () => {
    if (!selectedPeriod) return;
    
    startTransition(async () => {
      try {
        await updatePayrollPeriodStatus(selectedPeriod, "DRAFT");
        toast.success("Payroll reverted to draft");
        router.refresh();
      } catch (error: any) {
        toast.error(error.message || "Failed to revert period");
      }
    });
  };

  const selectedPeriodObj = periods.find(p => p.id === selectedPeriod);
  const isFinalized = selectedPeriodObj?.status === "FINALIZED";

  const availableYears = Array.from(new Set(periods.map(p => getSafeYear(p.startDate)))).sort((a, b) => b - a);
  
  // Filter periods by selected year
  const filteredPeriods = periods.filter(p => getSafeYear(p.startDate) === selectedYear);

  // Group periods sequentially to preserve database sort order
  const groupedPeriods: { label: string; periods: any[] }[] = [];
  
  filteredPeriods.forEach(p => {
    // Force time to noon UTC to avoid timezone shift for month formatting
    const date = new Date(p.startDate + "T12:00:00Z");
    const month = date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
    
    if (groupedPeriods.length === 0 || groupedPeriods[groupedPeriods.length - 1].label !== month) {
      groupedPeriods.push({ label: month, periods: [] });
    }
    
    groupedPeriods[groupedPeriods.length - 1].periods.push(p);
  });

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 gap-4">
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <Select
          value={selectedYear.toString()}
          onValueChange={(val) => {
            setSelectedYear(Number(val));
            setSelectedPeriod(null);
          }}
        >
          <SelectTrigger className="w-[120px] bg-slate-50">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
            {availableYears.length === 0 && <SelectItem value={new Date().getFullYear().toString()}>{new Date().getFullYear()}</SelectItem>}
          </SelectContent>
        </Select>

        <Select 
          value={selectedPeriod?.toString() || ""}
          onValueChange={handlePeriodChange}
        >
          <SelectTrigger className="w-[280px] bg-slate-50">
            <SelectValue placeholder="Select Payroll Period" />
          </SelectTrigger>
          <SelectContent>
            {groupedPeriods.map((group) => (
              <SelectGroup key={group.label}>
                <SelectLabel className="bg-slate-100/50">{group.label}</SelectLabel>
                {group.periods.map(p => {
                  const start = new Date(p.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  const end = new Date(p.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <SelectItem key={p.id} value={p.id.toString()}>{start} to {end}</SelectItem>
                  );
                })}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>

        {selectedPeriodObj && (
          <Badge variant={isFinalized ? "outline" : "default"} className={`ml-2 px-3 py-1 ${isFinalized ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "bg-amber-100 text-amber-800 hover:bg-amber-200 border-none"}`}>
            {isFinalized ? "COMPLETED" : "DRAFT"}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
        {selectedPeriod && (
          <div className="flex items-center gap-2 pr-4 md:border-r border-slate-200 mr-2">
            <Button 
              variant="outline" 
              className="bg-white text-slate-400 border-slate-200 cursor-not-allowed hidden sm:flex"
              disabled
              title="Printing is temporarily disabled"
            >
              <Printer className="mr-2 h-4 w-4 opacity-50" />
              Summary
            </Button>
            <Button 
              variant="outline" 
              className="bg-white text-slate-400 border-slate-200 cursor-not-allowed"
              disabled
              title="Printing is temporarily disabled"
            >
              <Printer className="mr-2 h-4 w-4 opacity-50" />
              Payslips
            </Button>
          </div>
        )}
        <Button 
          className="bg-slate-900 hover:bg-slate-800 shadow-sm text-white"
          onClick={() => setIsGenerateDialogOpen(true)} 
          disabled={isPending || !selectedPeriod || isFinalized}
        >
          {isPending ? "Generating..." : "Generate Payroll"}
        </Button>
        {selectedPeriodObj && selectedPeriodObj.status === "DRAFT" && (
          <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 bg-white shadow-sm" onClick={handleFinalize} disabled={isPending}>
            Mark as Completed
          </Button>
        )}
        {selectedPeriodObj && selectedPeriodObj.status === "FINALIZED" && (
          <Button variant="outline" className="border-amber-600 text-amber-700 hover:bg-amber-50 bg-white shadow-sm" onClick={handleUnfinalize} disabled={isPending}>
            Revert to Draft
          </Button>
        )}
        <Button variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-sm" onClick={() => setIsNewPeriodOpen(true)}>
          New Period
        </Button>
      </div>
      
      <NewPeriodDialog open={isNewPeriodOpen} onOpenChange={setIsNewPeriodOpen} />  

      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Payroll</DialogTitle>
            <DialogDescription>
              Are you sure you want to generate payroll for this period? 
              This will calculate salaries for all active contracts and might overwrite existing un-finalized data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerate} className="bg-slate-900 text-white">Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
