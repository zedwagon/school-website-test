import { getPayrollsForPrint, getPayrollPeriodById } from "@school/api/accounting/payroll/query";
import { PayslipCard } from "@/components/print/payslip-card";
import { PrintButton } from "@/components/print/print-button";
import { notFound } from "next/navigation";

export default async function BatchPrintPayslipsPage({ params }: { params: Promise<{ periodId: string }> }) {
  const { periodId: rawPeriodId } = await params;
  const periodId = parseInt(rawPeriodId, 10);
  if (isNaN(periodId)) return notFound();

  const period = await getPayrollPeriodById(periodId);
  if (!period) return notFound();

  const payrolls = await getPayrollsForPrint(periodId);
  
  // Sort alphabetically by last name for easier distribution
  payrolls.sort((a: any, b: any) => {
    const aName = a.employee?.lastName || "";
    const bName = b.employee?.lastName || "";
    return aName.localeCompare(bName);
  });

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white text-black font-sans">
      <div className="print:hidden sticky top-0 z-50 bg-white border-b shadow-sm p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Batch Print: {period.name}</h1>
          <p className="text-sm text-gray-500">{payrolls.length} payslips to print</p>
        </div>
        <PrintButton />
      </div>
      
      <div className="py-8 print:py-0 flex flex-col gap-8 print:gap-0">
        {payrolls.map((record: any) => (
          <div key={record.id} className="print-page">
            <PayslipCard 
              data={{
                periodName: period.name,
                staffName: `${record.employee?.lastName}, ${record.employee?.firstName} ${record.employee?.middleName || ""}`.trim(),
                type: record.employee?.type,
                department: record.employee?.department,
                baseSalary: record.baseSalary,
                halfSalary: record.halfSalary,
                transpoAllowance: record.transpoAllowance,
                positionPay: record.positionPay,
                advisoryPay: record.advisoryPay,
                holidayPay: record.holidayPay,
                subjectOverload: record.subjectOverload,
                additionalPay: record.additionalPay,
                moderatorPay: record.moderatorPay,
                dailySalary: record.dailySalary,
                subjectHoursPerDay: record.subjectHoursPerDay,
                numberOfClasses: record.numberOfClasses,
                totalEarnings: record.totalEarnings,
                sssEe: record.sssEe,
                philhealthEe: record.philhealthEe,
                pagIbigEe: record.pagIbigEe,
                loanDeduction: record.loanDeduction,
                totalDeductions: record.totalDeductions,
                netPay: record.netPay
              }} 
            />
          </div>
        ))}
        {payrolls.length === 0 && (
          <div className="text-center py-20 print:hidden text-gray-500">
            No payroll records found for this period.
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }
          .print-page {
            page-break-after: always;
            break-after: page;
          }
          /* Remove default browser headers/footers */
          @page { margin: 0.5cm; }
        }
      `}} />
    </div>
  );
}
