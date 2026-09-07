import { getPayrollsForPrint, getPayrollPeriodById } from "@school/api/accounting/payroll/query";
import { PrintButton } from "@/components/print/print-button";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function PrintPayrollSummaryPage({ params }: { params: Promise<{ periodId: string }> }) {
  const { periodId: rawPeriodId } = await params;
  const periodId = parseInt(rawPeriodId, 10);
  if (isNaN(periodId)) return notFound();

  const period = await getPayrollPeriodById(periodId);
  if (!period) return notFound();

  const payrolls = await getPayrollsForPrint(periodId);
  
  // Sort alphabetically by last name
  payrolls.sort((a: any, b: any) => {
    const aName = a.employee?.lastName || "";
    const bName = b.employee?.lastName || "";
    return aName.localeCompare(bName);
  });

  const totalBase = payrolls.reduce((acc, r) => acc + parseFloat(r.baseSalary), 0);
  const totalEarnings = payrolls.reduce((acc, r) => acc + parseFloat(r.totalEarnings), 0);
  const totalDeductions = payrolls.reduce((acc, r) => acc + parseFloat(r.totalDeductions), 0);
  const totalNet = payrolls.reduce((acc, r) => acc + parseFloat(r.netPay), 0);

  const formatMoney = (val: number | string) => {
    return parseFloat(val as string).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white text-black font-sans">
      <div className="print:hidden sticky top-0 z-50 bg-white border-b shadow-sm p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Payroll Summary: {period.name}</h1>
          <p className="text-sm text-gray-500">{payrolls.length} employees</p>
        </div>
        <PrintButton />
      </div>
      
      <div className="p-8 print:p-0 max-w-[1200px] mx-auto bg-white print:max-w-none">
        <div className="flex items-center gap-4 mb-6 mt-4">
          <Image src="/logo_diocese.webp" alt="Diocese Logo" width={60} height={60} />
          <div>
            <h2 className="text-2xl font-bold">Mary's Pathway Public School</h2>
            <p className="text-sm text-gray-600">Payroll Summary for {period.name}</p>
          </div>
        </div>

        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 print:bg-gray-200 text-left">
              <th className="border border-gray-300 px-2 py-1">Employee Name</th>
              <th className="border border-gray-300 px-2 py-1">Type</th>
              <th className="border border-gray-300 px-2 py-1 text-right">Base Salary</th>
              <th className="border border-gray-300 px-2 py-1 text-right">Allowances</th>
              <th className="border border-gray-300 px-2 py-1 text-right">Gross Pay</th>
              <th className="border border-gray-300 px-2 py-1 text-right">Deductions</th>
              <th className="border border-gray-300 px-2 py-1 text-right">Net Pay</th>
              <th className="border border-gray-300 px-2 py-1 text-center">Signature</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map((record: any) => {
              const name = `${record.employee?.lastName}, ${record.employee?.firstName} ${record.employee?.middleName || ""}`.trim();
              const snapshotType = record.employeeType || record.employee?.type;
              const type = snapshotType?.replace(/_/g, " ") || "N/A";
              
              const isPartTime = snapshotType === "part_time_teaching";
              const baseOrDaily = isPartTime ? parseFloat(record.dailySalary) : parseFloat(record.baseSalary);
              const allowances = isPartTime ? 0 : parseFloat(record.totalEarnings) - parseFloat(record.baseSalary);
              
              return (
                <tr key={record.id}>
                  <td className="border border-gray-300 px-2 py-1 font-medium">{name}</td>
                  <td className="border border-gray-300 px-2 py-1 capitalize">{type}</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">
                    {isPartTime ? `${formatMoney(baseOrDaily)}/day` : formatMoney(baseOrDaily)}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right">{isPartTime ? "-" : formatMoney(allowances)}</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">{formatMoney(record.totalEarnings)}</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">{formatMoney(record.totalDeductions)}</td>
                  <td className="border border-gray-300 px-2 py-1 text-right font-bold">{formatMoney(record.netPay)}</td>
                  <td className="border border-gray-300 px-2 py-4"></td>
                </tr>
              );
            })}
            <tr className="bg-gray-50 print:bg-gray-100 font-bold">
              <td colSpan={2} className="border border-gray-300 px-2 py-1 text-right">TOTAL</td>
              <td className="border border-gray-300 px-2 py-1 text-right">{formatMoney(totalBase)}</td>
              <td className="border border-gray-300 px-2 py-1 text-right">{formatMoney(totalEarnings - totalBase)}</td>
              <td className="border border-gray-300 px-2 py-1 text-right">{formatMoney(totalEarnings)}</td>
              <td className="border border-gray-300 px-2 py-1 text-right">{formatMoney(totalDeductions)}</td>
              <td className="border border-gray-300 px-2 py-1 text-right">{formatMoney(totalNet)}</td>
              <td className="border border-gray-300 px-2 py-1"></td>
            </tr>
          </tbody>
        </table>
        
        <div className="mt-16 grid grid-cols-2 gap-8 text-sm">
          <div>
            <div className="border-b border-black w-48 mb-1"></div>
            <p>Prepared By</p>
          </div>
          <div>
            <div className="border-b border-black w-48 mb-1"></div>
            <p>Approved By</p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }
          @page { margin: 1cm; size: landscape; }
        }
      `}} />
    </div>
  );
}
