import { Toaster } from "@school/ui";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type React from "react";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "School Accounting & Payroll System",
	description: "Accounting, Employee Payroll, and Expense Management System",
	icons: {
		icon: [
			{ url: "/logo.webp", sizes: "32x32", type: "image/webp" },
			{ url: "/logo.webp", sizes: "192x192", type: "image/webp" },
		],
		apple: "/logo.webp",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-slate-50`}
			>
				{children}
				<Toaster />
			</body>
		</html>
	);
}
