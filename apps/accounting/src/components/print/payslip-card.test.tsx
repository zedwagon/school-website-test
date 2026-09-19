/**
 * @vitest-environment jsdom
 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PayslipCard } from "./payslip-card";

describe("PayslipCard", () => {
	it("should render without crashing", () => {
		const mockData = {
			periodName: "JULY 1-15, 2026",
			staffName: "SANTOALLA, JAYMIE V.",
			type: "teaching",
			baseSalary: "12600.00",
			halfSalary: "6300.00",
			transpoAllowance: "0.00",
			positionPay: "0.00",
			advisoryPay: "350.00",
			subjectOverload: "0.00",
			additionalPay: "0.00",
			moderatorPay: "0.00",
			holidayPay: "0.00",
			dailySalary: "0.00",
			subjectHoursPerDay: "0.00",
			numberOfClasses: 0,
			totalEarnings: "6650.00",
			sssEe: "625.00",
			philhealthEe: "0.00",
			pagIbigEe: "0.00",
			loanDeduction: "0.00",
			totalDeductions: "625.00",
			netPay: "6025.00",
		};

		const { getByText } = render(<PayslipCard data={mockData as any} />);

		// Check key elements are present
		expect(getByText("SANTOALLA, JAYMIE V.")).toBeDefined();
		expect(getByText("JULY 1-15, 2026")).toBeDefined();

		// Check that numeric formats work
		expect(getByText("6,300.00")).toBeDefined(); // Half salary formatted
		expect(getByText("350.00")).toBeDefined(); // Advisory
		expect(getByText("6,650.00")).toBeDefined(); // Total earnings
		expect(getByText("6,025.00")).toBeDefined(); // Net Pay
	});
});
