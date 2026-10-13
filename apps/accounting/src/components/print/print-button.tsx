"use client";

import { Printer } from "lucide-react";

interface PrintButtonProps {
	label?: string;
	disabled?: boolean;
}

export function PrintButton({ label = "Print", disabled = false }: PrintButtonProps) {
	return (
		<button
			onClick={() => window.print()}
			disabled={disabled}
			className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors shadow-sm ${
				disabled
					? "bg-gray-200 text-gray-400 cursor-not-allowed"
					: "bg-red-600 hover:bg-red-700 text-white"
			}`}
		>
			<Printer className="h-4 w-4" />
			{label}
		</button>
	);
}
