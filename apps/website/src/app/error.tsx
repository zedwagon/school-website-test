"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";

export default function ErrorPage({ reset }: { reset: () => void }) {
  const router = useRouter();
	return (
		<div role="alert" className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6 text-center">
			<h2 className="text-xl font-semibold">We couldn't load this page</h2>
			<p>The service may be waking up or temporarily unavailable. Please try again shortly.</p>
      <button type="button" onClick={() => startTransition(() => { router.refresh(); reset(); })} className="rounded-md bg-red-700 px-4 py-2 text-white">
				Try again
			</button>
			<p className="text-sm">If you were saving a record, check whether it was saved before submitting it again.</p>
		</div>
	);
}


