import { SCHOOL_INFO } from "@school/api/constants";
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

export function PayslipCard({ data }: { data: PayslipData }) {
	const type = data.type;

	const formatCurrency = (val: string | number) => {
		const num = typeof val === "string" ? parseFloat(val) : val;
		if (Number.isNaN(num) || num === 0) return "-";
		return num.toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	};

	const _hasValue = (val: string | number) => {
		const num = typeof val === "string" ? parseFloat(val) : val;
		return !Number.isNaN(num) && num > 0;
	};

	return (
		<div
			className="w-full max-w-[15cm] mx-auto bg-white border border-black p-0 print:shadow-none print:mx-auto print:text-[10px]"
		>
			{/* HEADER SECTION */}
			<div className="flex items-center justify-between pb-2 px-2 pt-2 border-b border-black text-center text-[9px] leading-tight">
				<div className="w-14 h-14 flex-shrink-0">
					<Image
						src="/logo.webp"
						alt="MPPSI Logo"
						width={56}
						height={56}
						className="object-contain h-14 w-14"
					/>
				</div>
				<div className="flex-1 px-2">
					<div className="font-bold text-red-600 text-[11px]">
						{SCHOOL_INFO.name.toUpperCase()}
					</div>
					<div>Catholic Educational Association of the Philippines (CEAP)</div>
					<div>United Private Institution of Quezon, Inc. (UPEIQ)</div>
					<div>Lucena Diocese Catholic Schools Association (LUDICSA)</div>
					<div>Lucena Diocese Educational System (LUDES)</div>
					<div>Mauban, Quezon</div>

					<div className="font-bold mt-1 uppercase">{data.periodName}</div>
					<div className="font-bold">PAY SLIP</div>
				</div>
				<div className="w-14 h-14 flex-shrink-0">
					<Image
						src="/logo_diocese.webp"
						alt="Diocese Logo"
						width={56}
						height={56}
						className="object-contain h-14 w-14"
					/>
				</div>
			</div>

			{/* NAME SECTION */}
			<div className="flex border-b border-black">
				<div className="w-24 px-2 py-0.5 border-r border-black font-semibold text-[10px]">
					Name:
				</div>
				<div className="flex-1 px-2 py-0.5 font-bold text-[10px] uppercase">
					{data.staffName}
				</div>
			</div>

			<div className="bg-red-600 h-3 w-full border-b border-black"></div>

			{type !== "part_time_teaching" && (
				<>
					{/* LEAVES SECTION */}
					<div className="flex border-b border-black text-[10px]">
						<div className="w-[55%] px-2 py-0.5 border-r border-black"></div>
						<div className="flex-1 px-2 py-0.5 font-semibold text-center">Used</div>
					</div>
					<div className="flex border-b border-black text-[10px]">
						<div className="w-[55%] px-2 py-0.5 border-r border-black">Sick Leave</div>
						<div className="flex-1 px-2 py-0.5"></div>
					</div>
					<div className="flex border-b border-black text-[10px]">
						<div className="w-[55%] px-2 py-0.5 border-r border-black">Vacation Leave</div>
						<div className="flex-1 px-2 py-0.5"></div>
					</div>
				</>
			)}

			{/* EARNINGS SECTION */}
			<div className="flex border-b border-black text-[10px]">
				<div className="w-[55%] px-2 py-0.5 border-r border-black">{type === "part_time_teaching" ? "Daily Salary Rate" : "Basic Salary"}</div>
				<div className="w-[15%] px-2 py-0.5 border-r border-black text-center">Php</div>
				<div className="flex-1 px-2 py-0.5 text-right">{type === "part_time_teaching" ? formatCurrency(data.dailySalary) : formatCurrency(data.baseSalary)}</div>
			</div>

			{type !== "part_time_teaching" && (
				<div className="flex border-b border-black text-[10px]">
					<div className="w-[55%] px-2 py-0.5 border-r border-black">1st Half</div>
					<div className="w-[15%] px-2 py-0.5 border-r border-black text-center">Php</div>
					<div className="flex-1 px-2 py-0.5 text-right">{formatCurrency(data.halfSalary)}</div>
				</div>
			)}

			{type === "part_time_teaching" && (
				<>
					<div className="flex border-b border-black text-[10px]">
						<div className="w-[55%] px-2 py-0.5 border-r border-black">Subject Hours Per Day</div>
						<div className="w-[15%] px-2 py-0.5 border-r border-black text-center"></div>
						<div className="flex-1 px-2 py-0.5 text-right">{data.subjectHoursPerDay}</div>
					</div>
					<div className="flex border-b border-black text-[10px]">
						<div className="w-[55%] px-2 py-0.5 border-r border-black">Number of Class Per Cut-off</div>
						<div className="w-[15%] px-2 py-0.5 border-r border-black text-center"></div>
						<div className="flex-1 px-2 py-0.5 text-right">{data.numberOfClasses}</div>
					</div>
				</>
			)}

			{type === "non_teaching" && (
				<div className="flex border-b border-black text-[10px]">
					<div className="w-[55%] px-2 py-0.5 border-r border-black">Additional Pay</div>
					<div className="w-[15%] px-2 py-0.5 border-r border-black text-center">Php</div>
					<div className="flex-1 px-2 py-0.5 text-right">{formatCurrency(data.additionalPay)}</div>
				</div>
			)}

			{(type === "teaching" || type === "non_teaching") && (
				<div className="flex border-b border-black text-[10px]">
					<div className="w-[55%] px-2 py-0.5 border-r border-black">Subject Overload</div>
					<div className="w-[15%] px-2 py-0.5 border-r border-black text-center">Php</div>
					<div className="flex-1 px-2 py-0.5 text-right">{formatCurrency(data.subjectOverload)}</div>
				</div>
			)}

			{type === "non_teaching" && (
				<div className="flex border-b border-black text-[10px]">
					<div className="w-[55%] px-2 py-0.5 border-r border-black">Transportation Allowance</div>
					<div className="w-[15%] px-2 py-0.5 border-r border-black text-center">Php</div>
					<div className="flex-1 px-2 py-0.5 text-right">{formatCurrency(data.transpoAllowance)}</div>
				</div>
			)}

			{type === "non_teaching" && (
				<div className="flex border-b border-black text-[10px]">
					<div className="w-[55%] px-2 py-0.5 border-r border-black">Holiday Pay</div>
					<div className="w-[15%] px-2 py-0.5 border-r border-black text-center">Php</div>
					<div className="flex-1 px-2 py-0.5 text-right">{formatCurrency(data.holidayPay)}</div>
				</div>
			)}

			{type === "non_teaching" && (
				<div className="flex border-b border-black text-[10px]">
					<div className="w-[55%] px-2 py-0.5 border-r border-black">Moderator</div>
					<div className="w-[15%] px-2 py-0.5 border-r border-black text-center">Php</div>
					<div className="flex-1 px-2 py-0.5 text-right">{formatCurrency(data.moderatorPay)}</div>
				</div>
			)}

			{type === "teaching" && (
				<div className="flex border-b border-black text-[10px]">
					<div className="w-[55%] px-2 py-0.5 border-r border-black">POSITION PAY</div>
					<div className="w-[15%] px-2 py-0.5 border-r border-black text-center">Php</div>
					<div className="flex-1 px-2 py-0.5 text-right">{formatCurrency(data.positionPay)}</div>
				</div>
			)}

			{type === "teaching" && (
				<div className="flex border-b border-black text-[10px]">
					<div className="w-[55%] px-2 py-0.5 border-r border-black">Advisory</div>
					<div className="w-[15%] px-2 py-0.5 border-r border-black text-center">Php</div>
					<div className="flex-1 px-2 py-0.5 text-right">{formatCurrency(data.advisoryPay)}</div>
				</div>
			)}

			<div className="flex border-b border-black text-[10px] font-bold">
				<div className="w-[55%] px-2 py-0.5 border-r border-black">Total Income</div>
				<div className="w-[15%] px-2 py-0.5 border-r border-black text-center"></div>
				<div className="flex-1 px-2 py-0.5 text-right">{formatCurrency(data.totalEarnings)}</div>
			</div>

			<div className="bg-red-600 h-3 w-full border-b border-black"></div>

			{/* DEDUCTIONS SECTION */}
			{type !== "part_time_teaching" && (
				<>
					<div className="flex border-b border-black text-[10px]">
						<div className="flex-1 px-2 py-0.5">Less: Deductions</div>
					</div>
					<div className="flex border-b border-black text-[10px] font-semibold">
						<div className="w-[55%] px-2 py-0.5 border-r border-black">Fringe Benefits</div>
						<div className="w-[15%] px-2 py-0.5 border-r border-black text-center"></div>
						<div className="flex-1 px-2 py-0.5"></div>
					</div>
					<div className="flex border-b border-black text-[10px]">
						<div className="w-[55%] px-2 py-0.5 border-r border-black">SSS</div>
						<div className="w-[15%] px-2 py-0.5 border-r border-black text-center">Php</div>
						<div className="flex-1 px-2 py-0.5 text-right">{formatCurrency(data.sssEe)}</div>
					</div>
					<div className="flex border-b border-black text-[10px]">
						<div className="w-[55%] px-2 py-0.5 border-r border-black">PHIC</div>
						<div className="w-[15%] px-2 py-0.5 border-r border-black text-center">Php</div>
						<div className="flex-1 px-2 py-0.5 text-right">{formatCurrency(data.philhealthEe)}</div>
					</div>
					<div className="flex border-b border-black text-[10px]">
						<div className="w-[55%] px-2 py-0.5 border-r border-black">HDMF</div>
						<div className="w-[15%] px-2 py-0.5 border-r border-black text-center">Php</div>
						<div className="flex-1 px-2 py-0.5 text-right">{formatCurrency(data.pagIbigEe)}</div>
					</div>
					<div className="flex border-b border-black text-[10px]">
						<div className="flex-1 px-2 py-0.5">&nbsp;</div>
					</div>
					<div className="flex border-b border-black text-[10px]">
						<div className="w-[55%] px-2 py-0.5 border-r border-black">Loan</div>
						<div className="w-[15%] px-2 py-0.5 border-r border-black text-center">Php</div>
						<div className="flex-1 px-2 py-0.5 text-right">{formatCurrency(data.loanDeduction)}</div>
					</div>
					<div className="flex border-b border-black text-[10px]">
						<div className="w-[55%] px-2 py-0.5 border-r border-black">Absences</div>
						<div className="w-[15%] px-2 py-0.5 border-r border-black text-center">Php</div>
						<div className="flex-1 px-2 py-0.5 text-right"></div>
					</div>
					<div className="flex border-b border-black text-[10px] font-bold">
						<div className="w-[55%] px-2 py-0.5 border-r border-black">Total Deductions</div>
						<div className="w-[15%] px-2 py-0.5 border-r border-black text-center"></div>
						<div className="flex-1 px-2 py-0.5 text-right">{formatCurrency(data.totalDeductions)}</div>
					</div>
				</>
			)}

			<div className="flex border-b border-black text-[10px] font-bold">
				<div className="w-[55%] px-2 py-0.5 border-r border-black">Net Pay</div>
				<div className="w-[15%] px-2 py-0.5 border-r border-black text-center">Php</div>
				<div className="flex-1 px-2 py-0.5 text-right">{formatCurrency(data.netPay)}</div>
			</div>

			<div className="bg-red-600 h-3 w-full border-b border-black"></div>

			{/* SIGNATURES SECTION */}
			<div className="px-4 py-2 space-y-2 text-[11px]">
				<div className="flex justify-start gap-24">
					<div>
						<div className="mb-2">Prepared by:</div>
						<div className="border-b border-black inline-block uppercase">
							MICHELLE V. TALABONG
						</div>
						<div className="font-bold uppercase">ACCOUNTING ASSISTANT</div>
					</div>
					<div>
						<div className="mb-2">Noted by:</div>
						<div className="border-b border-black inline-block uppercase">
							QUEZAROANY B. RIVERA
						</div>
						<div className="font-bold uppercase">FINANCE OFFICER</div>
					</div>
				</div>

				<div className="pt-2">
					<div className="mb-4">Received by:</div>
					<div className="border-b border-black w-[60%] text-center"></div>
					<div className="ml-12 mb-0">Employee</div>
				</div>
			</div>

			<div className="px-2 pb-2 text-[11px]">
				<div className="font-bold">Note:</div>
				<div>Please check your pay slip before leaving the Accounting Office.</div>
			</div>
		</div>
	);
}
