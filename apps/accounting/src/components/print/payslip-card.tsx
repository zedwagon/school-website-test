import Image from "next/image";

interface PayslipData {
  periodName: string; 
  staffName: string; 
  type: string;
  department?: string | null;
  
  // Earnings
  baseSalary: string;
  halfSalary: string;
  transpoAllowance: string;
  positionPay: string;
  advisoryPay: string;
  holidayPay: string;
  subjectOverload: string;
  additionalPay: string;
  moderatorPay: string;
  dailySalary: string;
  subjectHoursPerDay: string;
  numberOfClasses: number;
  totalEarnings: string;

  // Deductions
  sssEe: string;
  philhealthEe: string;
  pagIbigEe: string;
  loanDeduction: string;
  totalDeductions: string;

  netPay: string;
}

export function PayslipCard({ record, period }: { record: any, period: any }) {
  const data = record;
  const type = record.employeeType || record.employee?.type;

  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num) || num === 0) return "-";
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const hasValue = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return !isNaN(num) && num > 0;
  };

  return (
    <div className="w-full max-w-[21cm] mx-auto bg-white border border-black p-0 print:border-none print:shadow-none" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      {/* HEADER SECTION */}
      <div className="relative border-b border-black pb-2 px-2 pt-2 text-center text-xs leading-tight">
        <div className="absolute left-2 top-2 h-16 w-16">
          <Image src="/logo.webp" alt="MPPSI Logo" fill className="object-contain" />
        </div>
        <div className="absolute right-2 top-2 h-16 w-16">
          <Image src="/logo_diocese.webp" alt="Diocese Logo" fill className="object-contain" />
        </div>
        
        <div className="font-bold text-red-600 text-sm">MOTHER PERPETUA PAROCHIAL SCHOOL, INC.</div>
        <div>Catholic Educational Association of the Philippines (CEAP)</div>
        <div>United Private Institution of Quezon, Inc. (UPEIQ)</div>
        <div>Lucena Diocese Catholic Schools Association (LUDICSA)</div>
        <div>Lucena Diocese Educational System (LUDES)</div>
        <div>Mauban, Quezon</div>
        
        <div className="font-bold mt-1 uppercase">{data.periodName}</div>
        <div className="font-bold">PAY SLIP</div>
      </div>

      {/* NAME SECTION */}
      <div className="flex border-b border-black">
        <div className="w-24 px-2 py-1 border-r border-black font-semibold text-xs">Name:</div>
        <div className="flex-1 px-2 py-1 font-bold text-sm uppercase">{data.staffName}</div>
      </div>

      <div className="bg-red-600 h-3 w-full border-b border-black"></div>

      {type !== "part_time_teaching" && (
        <>
          {/* LEAVES SECTION (Placeholder as per original) */}
          <div className="flex text-xs">
            <div className="w-48 px-2 py-1 border-r border-black"></div>
            <div className="w-32 px-2 py-1 border-r border-black font-semibold text-center">Used</div>
            <div className="flex-1 px-2 py-1"></div>
          </div>
          <div className="flex border-b border-black text-xs">
            <div className="w-48 px-2 py-1 border-r border-black">Sick Leave</div>
            <div className="w-32 px-2 py-1 border-r border-black border-b border-black mx-auto mt-2 h-0 mb-1 w-20"></div>
            <div className="flex-1 px-2 py-1"></div>
          </div>
          <div className="flex border-b border-black text-xs">
            <div className="w-48 px-2 py-1 border-r border-black">Vacation Leave</div>
            <div className="w-32 px-2 py-1 border-r border-black border-b border-black mx-auto mt-2 h-0 mb-1 w-20"></div>
            <div className="flex-1 px-2 py-1"></div>
          </div>
        </>
      )}

      {/* EARNINGS SECTION */}
      <div className="flex border-b border-black text-xs">
        <div className="w-48 px-2 py-1 border-r border-black">{type === "part_time_teaching" ? "Daily Salary Rate" : "Basic Salary"}</div>
        <div className="w-16 px-2 py-1 border-r border-black">Php</div>
        <div className="w-32 px-2 py-1 border-r border-black text-right">{type === "part_time_teaching" ? formatCurrency(data.dailySalary) : formatCurrency(data.baseSalary)}</div>
        <div className="w-16 px-2 py-1 border-r border-black"></div>
        <div className="flex-1 px-2 py-1"></div>
      </div>

      {type !== "part_time_teaching" && (
        <div className="flex border-b border-black text-xs">
          <div className="w-48 px-2 py-1 border-r border-black">1st Half</div>
          <div className="w-16 px-2 py-1 border-r border-black"></div>
          <div className="w-32 px-2 py-1 border-r border-black"></div>
          <div className="w-16 px-2 py-1 border-r border-black">Php</div>
          <div className="flex-1 px-2 py-1 text-right">{formatCurrency(data.halfSalary)}</div>
        </div>
      )}

      {type === "part_time_teaching" && (
        <>
          <div className="flex border-b border-black text-xs">
            <div className="w-48 px-2 py-1 border-r border-black">Subject Hours Per Day</div>
            <div className="w-16 px-2 py-1 border-r border-black"></div>
            <div className="w-32 px-2 py-1 border-r border-black text-right">{data.subjectHoursPerDay}</div>
            <div className="w-16 px-2 py-1 border-r border-black"></div>
            <div className="flex-1 px-2 py-1"></div>
          </div>
          <div className="flex border-b border-black text-xs">
            <div className="w-48 px-2 py-1 border-r border-black">Number of Class Per Cut-off</div>
            <div className="w-16 px-2 py-1 border-r border-black"></div>
            <div className="w-32 px-2 py-1 border-r border-black text-right">{data.numberOfClasses}</div>
            <div className="w-16 px-2 py-1 border-r border-black"></div>
            <div className="flex-1 px-2 py-1"></div>
          </div>
        </>
      )}

      {type === "non_teaching" && (
        <div className="flex border-b border-black text-xs">
          <div className="w-48 px-2 py-1 border-r border-black">Additional Pay</div>
          <div className="w-16 px-2 py-1 border-r border-black"></div>
          <div className="w-32 px-2 py-1 border-r border-black"></div>
          <div className="w-16 px-2 py-1 border-r border-black">Php</div>
          <div className="flex-1 px-2 py-1 text-right">{formatCurrency(data.additionalPay)}</div>
        </div>
      )}

      {(type === "teaching" || type === "non_teaching") && (
        <div className="flex border-b border-black text-xs">
          <div className="w-48 px-2 py-1 border-r border-black">Subject Overload</div>
          <div className="w-16 px-2 py-1 border-r border-black"></div>
          <div className="w-32 px-2 py-1 border-r border-black"></div>
          <div className="w-16 px-2 py-1 border-r border-black">Php</div>
          <div className="flex-1 px-2 py-1 text-right">{formatCurrency(data.subjectOverload)}</div>
        </div>
      )}

      {type === "non_teaching" && (
        <div className="flex border-b border-black text-xs">
          <div className="w-48 px-2 py-1 border-r border-black">Transportation Allowance</div>
          <div className="w-16 px-2 py-1 border-r border-black"></div>
          <div className="w-32 px-2 py-1 border-r border-black"></div>
          <div className="w-16 px-2 py-1 border-r border-black">Php</div>
          <div className="flex-1 px-2 py-1 text-right">{formatCurrency(data.transpoAllowance)}</div>
        </div>
      )}

      {type === "non_teaching" && (
        <div className="flex border-b border-black text-xs">
          <div className="w-48 px-2 py-1 border-r border-black">Holiday Pay</div>
          <div className="w-16 px-2 py-1 border-r border-black"></div>
          <div className="w-32 px-2 py-1 border-r border-black"></div>
          <div className="w-16 px-2 py-1 border-r border-black">Php</div>
          <div className="flex-1 px-2 py-1 text-right">{formatCurrency(data.holidayPay)}</div>
        </div>
      )}

      {type === "non_teaching" && (
        <div className="flex border-b border-black text-xs">
          <div className="w-48 px-2 py-1 border-r border-black">Moderator</div>
          <div className="w-16 px-2 py-1 border-r border-black"></div>
          <div className="w-32 px-2 py-1 border-r border-black"></div>
          <div className="w-16 px-2 py-1 border-r border-black">Php</div>
          <div className="flex-1 px-2 py-1 text-right">{formatCurrency(data.moderatorPay)}</div>
        </div>
      )}

      {type === "teaching" && (
        <div className="flex border-b border-black text-xs">
          <div className="w-48 px-2 py-1 border-r border-black">POSITION PAY</div>
          <div className="w-16 px-2 py-1 border-r border-black"></div>
          <div className="w-32 px-2 py-1 border-r border-black"></div>
          <div className="w-16 px-2 py-1 border-r border-black">Php</div>
          <div className="flex-1 px-2 py-1 text-right">{formatCurrency(data.positionPay)}</div>
        </div>
      )}

      {type === "teaching" && (
        <div className="flex border-b border-black text-xs">
          <div className="w-48 px-2 py-1 border-r border-black">Advisory</div>
          <div className="w-16 px-2 py-1 border-r border-black"></div>
          <div className="w-32 px-2 py-1 border-r border-black"></div>
          <div className="w-16 px-2 py-1 border-r border-black">Php</div>
          <div className="flex-1 px-2 py-1 text-right">{formatCurrency(data.advisoryPay)}</div>
        </div>
      )}
      
      <div className="flex border-b border-black text-xs font-bold">
        <div className="w-[18rem] px-2 py-1 border-r border-black">Total Income</div>
        <div className="flex-1 px-2 py-1 text-right">{formatCurrency(data.totalEarnings)}</div>
      </div>

      <div className="bg-red-600 h-3 w-full border-b border-black"></div>

      {/* DEDUCTIONS SECTION */}
      {type !== "part_time_teaching" && (
        <>
          <div className="flex border-b border-black text-xs">
            <div className="flex-1 px-2 py-1 font-semibold">Less: Deductions</div>
          </div>
          <div className="flex border-b border-black text-xs">
            <div className="w-48 px-2 py-1 border-r border-black font-semibold">Fringe Benefits</div>
            <div className="w-16 px-2 py-1 border-r border-black"></div>
            <div className="w-32 px-2 py-1 border-r border-black"></div>
            <div className="w-16 px-2 py-1 border-r border-black"></div>
            <div className="flex-1 px-2 py-1"></div>
          </div>
          <div className="flex border-b border-black text-xs">
            <div className="w-48 px-2 py-1 border-r border-black">SSS</div>
            <div className="w-16 px-2 py-1 border-r border-black"></div>
            <div className="w-32 px-2 py-1 border-r border-black"></div>
            <div className="w-16 px-2 py-1 border-r border-black">Php</div>
            <div className="flex-1 px-2 py-1 text-right">{formatCurrency(data.sssEe)}</div>
          </div>
          <div className="flex border-b border-black text-xs">
            <div className="w-48 px-2 py-1 border-r border-black">PHIC</div>
            <div className="w-16 px-2 py-1 border-r border-black"></div>
            <div className="w-32 px-2 py-1 border-r border-black"></div>
            <div className="w-16 px-2 py-1 border-r border-black">Php</div>
            <div className="flex-1 px-2 py-1 text-right">{formatCurrency(data.philhealthEe)}</div>
          </div>
          <div className="flex border-b border-black text-xs">
            <div className="w-48 px-2 py-1 border-r border-black">HDMF</div>
            <div className="w-16 px-2 py-1 border-r border-black"></div>
            <div className="w-32 px-2 py-1 border-r border-black"></div>
            <div className="w-16 px-2 py-1 border-r border-black">Php</div>
            <div className="flex-1 px-2 py-1 text-right">{formatCurrency(data.pagIbigEe)}</div>
          </div>
          <div className="flex border-b border-black text-xs">
            <div className="w-48 px-2 py-1 border-r border-black">LOAN</div>
            <div className="w-16 px-2 py-1 border-r border-black"></div>
            <div className="w-32 px-2 py-1 border-r border-black"></div>
            <div className="w-16 px-2 py-1 border-r border-black">Php</div>
            <div className="flex-1 px-2 py-1 text-right">{formatCurrency(data.loanDeduction)}</div>
          </div>
          <div className="flex border-b border-black text-xs">
            <div className="w-48 px-2 py-1 border-r border-black">Absences</div>
            <div className="w-16 px-2 py-1 border-r border-black"></div>
            <div className="w-32 px-2 py-1 border-r border-black"></div>
            <div className="w-16 px-2 py-1 border-r border-black">Php</div>
            <div className="flex-1 px-2 py-1 text-right">-</div>
          </div>
          <div className="flex border-b border-black text-xs font-bold">
            <div className="w-[18rem] px-2 py-1 border-r border-black">Total Deductions</div>
            <div className="flex-1 px-2 py-1 text-right">{formatCurrency(data.totalDeductions)}</div>
          </div>
        </>
      )}
      
      <div className="flex border-b border-black text-xs font-bold">
        <div className="w-[18rem] px-2 py-1 border-r border-black">Net Pay</div>
        <div className="w-16 px-2 py-1 border-r border-black">Php</div>
        <div className="flex-1 px-2 py-1 text-right">{formatCurrency(data.netPay)}</div>
      </div>

      <div className="bg-red-600 h-3 w-full border-b border-black"></div>

      {/* SIGNATURES SECTION */}
      <div className="px-4 py-4 space-y-6 text-[11px]">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="mb-8">Prepared by:</div>
            <div className="border-b border-black w-48 font-bold">MICHELLE V. TALABONG</div>
            <div className="font-bold uppercase">ACCOUNTING ASSISTANT</div>
          </div>
          <div>
             <div className="mb-8">Noted by:</div>
             <div className="border-b border-black w-48 font-bold">Quazaroany B. River</div>
             <div className="font-bold uppercase">FINANCE OFFICER</div>
          </div>
        </div>
        
        <div className="pt-2">
          <div className="mb-8">Received by:</div>
          <div className="border-b border-black w-64 text-center"></div>
          <div className="ml-24">Employee</div>
        </div>
      </div>
      
    </div>
  );
}
