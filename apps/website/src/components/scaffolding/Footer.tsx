"use client";

import { ExternalLink, FileText, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <footer className="border-t border-gray-150 bg-background text-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Main Footer Columns Grid - Strictly Maximum of 3 Columns with content-proportional widths */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-12 md:gap-8 lg:gap-12">
          {/* Column 1: School Identity & Contact info (Spans 5 of 12 columns) */}
          <div className="col-span-1 md:col-span-5">
            <Link
              className="mb-5 flex items-center space-x-3 transition-opacity hover:opacity-90"
              href="/"
            >
              <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-gray-50 shadow-2xs flex-shrink-0">
                <Image
                  alt="MPPSI Logo"
                  className="object-contain p-1"
                  fill
                  priority
                  sizes="48px"
                  src="/logo.webp"
                />
              </div>
              <span className="font-extrabold text-gray-900 text-base sm:text-lg leading-snug tracking-tight">
                Mother Perpetua Parochial School Inc.
              </span>
            </Link>

            <p className="mb-6 text-gray-500 leading-relaxed text-sm">
              Nurturing young minds and building tomorrow&apos;s leaders through
              excellence in education, character development, and community
              engagement.
            </p>

            {/* Structured Contact Block */}
            <div className="space-y-3.5 text-gray-600 text-sm">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span className="leading-snug">
                  Brgy. Lual Pob. Mauban, Quezon 4330
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <span>(042) 731 9482 / 09480275299</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <span>motherperpetua_mauban@yahoo.com</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links & Portal (Spans 3 of 12 columns - perfectly proportioned) */}
          <div className="col-span-1 md:col-span-3 flex flex-col gap-10">
            {/* Quick Links Section */}
            <div>
              <h3 className="mb-4 font-black text-gray-900 text-sm uppercase tracking-wider">
                Quick Links
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    className="text-gray-500 hover:text-primary transition-colors duration-200"
                    href="/registrar"
                  >
                    Registrar Office
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-gray-500 hover:text-primary transition-colors duration-200"
                    href="/accounting"
                  >
                    Accounting Office
                  </Link>
                </li>
              </ul>
            </div>

            {/* Portal Section */}
            <div>
              <h3 className="mb-4 font-black text-gray-900 text-sm uppercase tracking-wider">
                Portal
              </h3>
              <Link
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4.5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary/95 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                href="/login"
              >
                MPPSI Portal
                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
              </Link>
            </div>
          </div>

          {/* Column 3: Resources (PDF Files) (Spans 4 of 12 columns - extra breathing room for PDF titles) */}
          <div className="col-span-1 md:col-span-4">
            <h3 className="mb-5 font-black text-gray-900 text-sm uppercase tracking-wider">
              Resources
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <a
                  className="text-gray-500 hover:text-primary transition-colors duration-200 inline-flex items-center gap-1.5 group/link"
                  href="/registrar/ENROLLMENT FORM.pdf"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span>Enrollment Form</span>
                  <ExternalLink className="h-3 w-3 text-gray-400 opacity-60 flex-shrink-0 ml-0.5 group-hover/link:text-primary transition-colors duration-200" />
                </a>
              </li>
              <li>
                <a
                  className="text-gray-500 hover:text-primary transition-colors duration-200 inline-flex items-center gap-1.5 group/link"
                  href="/registrar/ESC_Application_Form2.pdf"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span>ESC Application Form</span>
                  <ExternalLink className="h-3 w-3 text-gray-400 opacity-60 flex-shrink-0 ml-0.5 group-hover/link:text-primary transition-colors duration-200" />
                </a>
              </li>
              <li>
                <a
                  className="text-gray-500 hover:text-primary transition-colors duration-200 inline-flex items-center gap-1.5 group/link"
                  href="/registrar/ESC_Grantee_Enrolment_Contract2.pdf"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span>ESC Grantee Contract</span>
                  <ExternalLink className="h-3 w-3 text-gray-400 opacity-60 flex-shrink-0 ml-0.5 group-hover/link:text-primary transition-colors duration-200" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Dynamic Embedded Map Section: Home Page Exclusive */}
        {isHomePage && (
          <div className="relative mt-12 h-40 sm:h-48 md:h-52 w-full overflow-hidden rounded-2xl border border-gray-100 shadow-md">
            <iframe
              allowFullScreen
              className="border-0 w-full h-full"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d902.8011027135041!2d121.73046123236418!3d14.19077657247068!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x339800a5c6925043%3A0xcbaa6aa0c77118cd!2sMother%20Perpetua%20Parochial%20School!5e1!3m2!1sen!2sph!4v1758732396437!5m2!1sen!2sph"
            />
          </div>
        )}

        {/* Fading Divider & Copyright */}
        <div className="mt-12 border-t border-gray-150 pt-8 text-center text-gray-500 text-xs sm:text-sm">
          © {new Date().getFullYear()} Mother Perpetua Parochial School Inc. All
          rights reserved.
        </div>
      </div>
    </footer>
  );
}
