import { Spinner } from "@school/ui";

export default function Loading() {
	return (
		<div className="flex flex-col items-center justify-center py-32 space-y-4 animate-in fade-in duration-300">
			<Spinner className="w-8 h-8 text-slate-800" />
			<p className="text-sm font-medium text-slate-500">Loading data...</p>
		</div>
	);
}
