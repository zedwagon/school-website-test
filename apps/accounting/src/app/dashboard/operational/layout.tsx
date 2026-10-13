"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MasterMonthFilter } from "./components/master-month-filter";
import { Suspense } from "react";

export default function OperationalLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	const tabs = [
		{ name: "Cash Receipts", href: "/dashboard/operational/cash-receipts" },
		{ name: "Master Ledger", href: "/dashboard/operational/ledger" },
		{ name: "Loan Management", href: "/dashboard/operational/loans" },
	];

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 xl:flex-row xl:justify-between xl:items-start">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-slate-900">Operational Cash Flow</h1>
					<p className="text-slate-500 mt-1">Manage daily cash receipts and the master ledger.</p>
				</div>
				{!pathname.startsWith("/dashboard/operational/loans") && (
					<Suspense fallback={null}>
						<MasterMonthFilter />
					</Suspense>
				)}
			</div>

			<div className="overflow-x-auto border-b border-gray-200">
				<nav className="-mb-px flex space-x-8" aria-label="Tabs">
					{tabs.map((tab) => {
						const isActive = pathname.startsWith(tab.href);
						return (
							<Link
								key={tab.name}
								href={tab.href}
								className={`
									whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
									${isActive
										? "border-red-600 text-red-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
									}
								`}
							>
								{tab.name}
							</Link>
						);
					})}
				</nav>
			</div>

			<div>{children}</div>
		</div>
	);
}
