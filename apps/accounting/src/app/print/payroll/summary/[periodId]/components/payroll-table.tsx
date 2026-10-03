import { SCHOOL_INFO } from "@school/api/constants";
import Image from "next/image";

interface PayrollTableProps {
	typeKey: string;
	periodName: string;
	groupRecords: any[];
}

export function PayrollTable({
	typeKey,
	periodName,
	groupRecords,
}: PayrollTableProps) {
	const isPartTime = typeKey === "part_time_teaching";
	const isTeaching = typeKey === "teaching";
	const isNonTeaching = typeKey === "non_teaching";
	const isAdministrators = typeKey === "administrators";

	const formatMoney = (val: number | string) => {
		const num = typeof val === "string" ? parseFloat(val) : val;
		if (Number.isNaN(num) || num === 0) return "-";
		return num.toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	};

	const formatType = (type: string) =>
		type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

	// Helpers for calculating totals
	const getVal = (record: any, key: string) => parseFloat(record[key] || "0");
	const sum = (key: string) =>
		groupRecords.reduce((acc, r) => acc + getVal(r, key), 0);
	const hasVal = (key: string) => sum(key) > 0;

	// Custom colors based on Excel snippet
	const COLOR_GREEN = "#92D050";
	const COLOR_BLUE = "#9BC2E6";
	const COLOR_YELLOW = "#FFFF00";



	// Signatories
	const Signatories = () => (
		<div className="mt-8 grid grid-cols-3 gap-8 text-[11px] break-inside-avoid pb-8">
			<div>
				<p className="mb-8">Prepared by:</p>
				<p className="font-bold underline uppercase">MS. MICHELLE V. TALABONG</p>
				<p>Accounting Assistant</p>
			</div>
			<div>
				<p className="mb-8">Noted by:</p>
				<p className="font-bold underline uppercase">MRS. QUEZAROANY B. RIVERA</p>
				<p>Finance Officer</p>
			</div>
			<div>
				<p className="mb-8">Approved by:</p>
				<p className="font-bold underline uppercase">
					REV. FR. RODERICK G. MERCURIO, LPT. MMEM, FRIEdr
				</p>
				<p>School Director / Principal</p>
			</div>
		</div>
	);

	// Header
	const Header = () => (
		<div className="flex justify-center items-center gap-8 mb-8 text-xs leading-tight text-center">
			<div className="relative h-24 w-24 shrink-0">
				<Image src="/logo.webp" alt="MPPSI Logo" fill className="object-contain" />
			</div>
			
			<div className="flex flex-col">
				<div className="font-bold uppercase text-sm text-red-600">{SCHOOL_INFO.name}</div>
				<div className="text-gray-700">Catholic Educational Association of the Philippines (CEAP)</div>
				<div className="text-gray-700">United Private Institution of Quezon, Inc. (UPEIQ)</div>
				<div className="text-gray-700">Lucena Diocese Catholic Schools Association (LUDICSA)</div>
				<div className="text-gray-700">Lucena Diocese Educational System (LUDES)</div>
				<div className="text-gray-700">Mauban, Quezon</div>
				<div className="font-bold mt-2 uppercase text-sm">FOR THE PERIOD OF {periodName}</div>
			</div>

			<div className="relative h-24 w-24 shrink-0">
				<Image src="/logo_diocese.webp" alt="Diocese Logo" fill className="object-contain" />
			</div>
		</div>
	);

	const GroupTypeHeader = () => (
		<div className="mb-4 text-center sm:text-left">
			<h2 className="inline-block text-lg font-black tracking-widest text-slate-800 uppercase border-b-[3px] border-slate-800 pb-1 px-2">
				{formatType(typeKey)}
			</h2>
		</div>
	);

	// Shared Cell styling classes
	const thClass = "border border-slate-700 px-3 py-2 align-middle leading-tight";
	const tdClass = "border border-slate-700 px-3 py-1.5 align-middle text-[11.5px] 2xl:text-xs";

	if (isPartTime) {
		const sumDaily = sum("dailySalary");
		const sumTotal = sum("totalEarnings");

		return (
			<div className="print-page w-full flex flex-col px-4 py-8 print:px-2 print:py-4">
				<div>
					<Header />
					<GroupTypeHeader />
					<table className="w-full text-xs border-collapse border border-slate-700 font-medium print-exact-colors shadow-sm print:shadow-none bg-white">
						<thead>
							<tr
								style={{ backgroundColor: COLOR_GREEN }}
								className="text-center font-bold"
							>
								<th className={`${thClass} w-10`}>#</th>
								<th className={`${thClass} w-64 text-left`}>Employee Name</th>
								<th className={thClass}>SALARY</th>
								<th className={thClass}>SUBJECT HOURS PER DAY</th>
								<th className={thClass}>NUMBER OF CLASS PER CUT-OFF</th>
								<th className={thClass}>DAILY SALARY</th>
								<th className={thClass}>TOTAL</th>
								<th className={thClass}>NET PAY</th>
							</tr>
						</thead>
						<tbody>
							{groupRecords.map((r, i) => (
								<tr key={r.id} className="text-right hover:bg-slate-50 transition-colors">
									<td className={`${tdClass} text-center font-bold text-gray-500`}>
										{i + 1}
									</td>
									<td className={`${tdClass} text-left font-bold uppercase`}>
										{r.employee?.lastName}, {r.employee?.firstName}
									</td>
									<td
										className={tdClass}
										style={{ backgroundColor: COLOR_BLUE }}
									>
										{formatMoney(r.totalEarnings)}
									</td>
									<td className={tdClass}>
										{formatMoney(r.subjectHoursPerDay)}
									</td>
									<td
										className={tdClass}
										style={{ backgroundColor: COLOR_YELLOW }}
									>
										{r.numberOfClasses}
									</td>
									<td className={tdClass}>
										{formatMoney(r.dailySalary)}
									</td>
									<td className={tdClass}>
										{formatMoney(r.totalEarnings)}
									</td>
									<td
										className={`${tdClass} font-bold`}
										style={{ backgroundColor: COLOR_YELLOW }}
									>
										{formatMoney(r.totalEarnings)}
									</td>
								</tr>
							))}
							<tr className="text-right font-bold text-blue-900 bg-gray-50 print:bg-white">
								<td className={`${tdClass} text-center`}></td>
								<td className={`${tdClass} text-right uppercase tracking-wider pr-4`}>
									TOTAL
								</td>
								<td
									className={tdClass}
									style={{ backgroundColor: COLOR_BLUE }}
								>
									{formatMoney(sumTotal)}
								</td>
								<td className={`${tdClass} text-center`}>-</td>
								<td className={`${tdClass} text-center`}>-</td>
								<td className={tdClass}>{formatMoney(sumDaily)}</td>
								<td className={tdClass}>{formatMoney(sumTotal)}</td>
								<td
									className={`${tdClass} text-black font-bold`}
									style={{ backgroundColor: COLOR_YELLOW }}
								>
									{formatMoney(sumTotal)}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<Signatories />
			</div>
		);
	}

	// For Full-time (Admins, Teaching, Non-Teaching)
	
	// Dynamic column checks
	const showAdditional = isNonTeaching && hasVal("additionalPay");
	const showOverload = (isTeaching || isNonTeaching) && hasVal("subjectOverload");
	const showTranspo = (isAdministrators || isNonTeaching) && hasVal("transpoAllowance");
	const showHoliday = isNonTeaching && hasVal("holidayPay");
	const showModerator = isNonTeaching && hasVal("moderatorPay");
	const showPosition = (isAdministrators || isTeaching) && hasVal("positionPay");
	const showAdvisory = (isAdministrators || isTeaching) && hasVal("advisoryPay");
	
	const showSssEr = hasVal("sssEr");
	const showPhilhealthEr = hasVal("philhealthEr");
	const showPagIbigEr = hasVal("pagIbigEr");
	
	const deductionColSpan = 3 + (showSssEr ? 1 : 0) + (showPhilhealthEr ? 1 : 0) + (showPagIbigEr ? 1 : 0);

	return (
		<div className="print-page w-full flex flex-col px-4 py-8 print:px-2 print:py-4">
			<div>
				<Header />
				<GroupTypeHeader />
				<table className="w-full text-xs border-collapse border border-slate-700 font-medium print-exact-colors shadow-sm print:shadow-none bg-white">
					<thead>
						<tr
							style={{ backgroundColor: COLOR_GREEN }}
							className="text-center font-bold"
						>
							<th className={`${thClass} w-10`} rowSpan={3}>#</th>
							<th className={`${thClass} w-56 text-left`} rowSpan={3}>Employee Name</th>
							<th className={thClass} rowSpan={3}>SALARY</th>
							<th className={thClass} rowSpan={3}>HALF SALARY</th>
							
							{showAdditional && <th className={thClass} rowSpan={3}>ADDITIONAL PAY</th>}
							{showOverload && <th className={thClass} rowSpan={3}>SUBJECT OVERLOAD 1/2</th>}
							{showTranspo && <th className={thClass} rowSpan={3}>{isNonTeaching ? "TRANSPORTATION" : "TRANSPO ALLOWANCE"}</th>}
							
							{showHoliday && <th className={thClass} rowSpan={3}>HOLIDAY PAY</th>}
							{showModerator && <th className={thClass} rowSpan={3}>MODERATOR PAY</th>}
							{showPosition && <th className={thClass} rowSpan={3}>POSITION PAY</th>}
							{showAdvisory && <th className={thClass} rowSpan={3}>ADVISORY</th>}
							
							<th className={thClass} rowSpan={3}>TOTAL</th>
							<th className={`${thClass} tracking-widest`} colSpan={deductionColSpan}>D E D U C T I O N S</th>
							<th className={thClass} rowSpan={3}>Salary Loan Deduction</th>
							<th className={thClass} rowSpan={3}>Total Deductions</th>
							<th className={thClass} rowSpan={3}>Net Pay</th>
						</tr>
						<tr
							style={{ backgroundColor: COLOR_GREEN }}
							className="text-center font-bold"
						>
							<th className={thClass} colSpan={showSssEr ? 2 : 1}>SSS</th>
							<th className={thClass} colSpan={showPhilhealthEr ? 2 : 1}>Philhealth</th>
							<th className={thClass} colSpan={showPagIbigEr ? 2 : 1}>Pag-Ibig</th>
						</tr>
						<tr
							style={{ backgroundColor: COLOR_GREEN }}
							className="text-center font-bold text-[11px]"
						>
							{showSssEr && <th className="border border-slate-700 px-1 py-1">ER</th>}
							<th className="border border-slate-700 px-1 py-1">EE</th>
							{showPhilhealthEr && <th className="border border-slate-700 px-1 py-1">ER</th>}
							<th className="border border-slate-700 px-1 py-1">EE</th>
							{showPagIbigEr && <th className="border border-slate-700 px-1 py-1">ER</th>}
							<th className="border border-slate-700 px-1 py-1">EE</th>
						</tr>
					</thead>
					<tbody>
						{groupRecords.map((r, i) => (
							<tr key={r.id} className="text-right hover:bg-slate-50 transition-colors">
								<td className={`${tdClass} text-center font-bold text-gray-500`}>{i + 1}</td>
								<td className={`${tdClass} text-left font-bold uppercase whitespace-nowrap`}>{r.employee?.lastName}, {r.employee?.firstName}</td>
								<td className={tdClass} style={{ backgroundColor: COLOR_BLUE }}>{formatMoney(r.baseSalary)}</td>
								<td className={tdClass}>{formatMoney(r.halfSalary)}</td>
								
								{showAdditional && <td className={tdClass}>{formatMoney(r.additionalPay)}</td>}
								{showOverload && <td className={tdClass}>{formatMoney(r.subjectOverload)}</td>}
								{showTranspo && <td className={tdClass}>{formatMoney(r.transpoAllowance)}</td>}
								
								{showHoliday && <td className={tdClass}>{formatMoney(r.holidayPay)}</td>}
								{showModerator && <td className={tdClass}>{formatMoney(r.moderatorPay)}</td>}
								{showPosition && <td className={tdClass}>{formatMoney(r.positionPay)}</td>}
								{showAdvisory && <td className={tdClass}>{formatMoney(r.advisoryPay)}</td>}
								
								<td className={`${tdClass} font-bold text-[12px] 2xl:text-sm`}>{formatMoney(r.totalEarnings)}</td>
								
								{/* Deductions */}
								{showSssEr && <td className={`${tdClass} text-gray-500`}>{formatMoney(r.sssEr)}</td>}
								<td className={tdClass}>{formatMoney(r.sssEe)}</td>
								{showPhilhealthEr && <td className={`${tdClass} text-gray-500`}>{formatMoney(r.philhealthEr)}</td>}
								<td className={tdClass}>{formatMoney(r.philhealthEe)}</td>
								{showPagIbigEr && <td className={`${tdClass} text-gray-500`}>{formatMoney(r.pagIbigEr)}</td>}
								<td className={tdClass}>{formatMoney(r.pagIbigEe)}</td>
								
								<td className={tdClass}>{formatMoney(r.loanDeduction)}</td>
								<td className={`${tdClass} font-bold text-black`} style={{ backgroundColor: COLOR_YELLOW }}>{formatMoney(r.totalDeductions)}</td>
								<td className={`${tdClass} font-bold text-[12px] 2xl:text-sm`}>{formatMoney(r.netPay)}</td>
							</tr>
						))}
						<tr className="text-right font-bold text-blue-900 bg-gray-50 print:bg-white">
							<td className={`${tdClass} text-center`}></td>
							<td className={`${tdClass} text-right uppercase tracking-wider pr-4`}>TOTAL</td>
							<td className={tdClass} style={{ backgroundColor: COLOR_BLUE }}>{formatMoney(sum("baseSalary"))}</td>
							<td className={tdClass}>{formatMoney(sum("halfSalary"))}</td>
							
							{showAdditional && <td className={tdClass}>{formatMoney(sum("additionalPay"))}</td>}
							{showOverload && <td className={tdClass}>{formatMoney(sum("subjectOverload"))}</td>}
							{showTranspo && <td className={tdClass}>{formatMoney(sum("transpoAllowance"))}</td>}
							
							{showHoliday && <td className={tdClass}>{formatMoney(sum("holidayPay"))}</td>}
							{showModerator && <td className={tdClass}>{formatMoney(sum("moderatorPay"))}</td>}
							{showPosition && <td className={tdClass}>{formatMoney(sum("positionPay"))}</td>}
							{showAdvisory && <td className={tdClass}>{formatMoney(sum("advisoryPay"))}</td>}
							
							<td className={`${tdClass} text-[12px] 2xl:text-sm`}>{formatMoney(sum("totalEarnings"))}</td>
							
							{/* Deductions Totals */}
							{showSssEr && <td className={`${tdClass} text-gray-500`}>{formatMoney(sum("sssEr"))}</td>}
							<td className={tdClass}>{formatMoney(sum("sssEe"))}</td>
							{showPhilhealthEr && <td className={`${tdClass} text-gray-500`}>{formatMoney(sum("philhealthEr"))}</td>}
							<td className={tdClass}>{formatMoney(sum("philhealthEe"))}</td>
							{showPagIbigEr && <td className={`${tdClass} text-gray-500`}>{formatMoney(sum("pagIbigEr"))}</td>}
							<td className={tdClass}>{formatMoney(sum("pagIbigEe"))}</td>
							
							<td className={tdClass}>{formatMoney(sum("loanDeduction"))}</td>
							<td className={`${tdClass} text-black font-bold`} style={{ backgroundColor: COLOR_YELLOW }}>{formatMoney(sum("totalDeductions"))}</td>
							<td className={`${tdClass} text-[12px] 2xl:text-sm`}>{formatMoney(sum("netPay"))}</td>
						</tr>
					</tbody>
				</table>
			</div>
			<Signatories />
		</div>
	);
}
