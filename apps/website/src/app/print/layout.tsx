import { getSession } from "@school/api/auth/session";
import { redirect } from "next/navigation";
import { PrintToolbar } from "@/components/print/print-toolbar";

/**
 * Print layout - a minimal layout that strips away the dashboard sidebar/nav
 * and wraps children in a print-root container for @media print CSS.
 *
 * Auth: requires active session, redirects to home if not authenticated.
 */
export default async function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return (
    <>
      <PrintToolbar />

      {/* Print content - becomes the only visible element during printing */}
      <div className="print-root mx-auto max-w-[210mm] bg-white p-6 pt-20">
        {children}
      </div>
    </>
  );
}
