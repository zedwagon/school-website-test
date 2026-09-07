import { SCHOOL_INFO } from "@school/api/constants";
import Image from "next/image";

/**
 * A reusable school header for all printable forms.
 * Renders the logo, school name, and address in a centered header layout.
 */
export function PrintHeader({ subtitle }: { subtitle: string }) {
  return (
    <div className="print-no-break mb-6 text-center">
      <div className="flex items-center justify-center gap-4">
        <Image
          alt={`${SCHOOL_INFO.acronym} Logo`}
          className="h-16 w-16 object-contain"
          height={64}
          src="/logo.webp"
          width={64}
        />
        <div>
          <h1 className="text-lg font-bold uppercase tracking-wide text-gray-900">
            {SCHOOL_INFO.name}
          </h1>
          <p className="text-xs text-gray-500">{SCHOOL_INFO.address.full}</p>
          <p className="text-xs text-gray-500">
            Tel: {SCHOOL_INFO.phone} | Email: {SCHOOL_INFO.email}
          </p>
        </div>
      </div>
      <div className="mt-4 border-b-2 border-gray-800 pb-2">
        <h2 className="text-base font-bold uppercase tracking-wider text-gray-800">
          {subtitle}
        </h2>
      </div>
    </div>
  );
}
