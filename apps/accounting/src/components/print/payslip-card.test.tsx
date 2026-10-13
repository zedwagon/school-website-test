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
			sickLeaveUsed: "1.50",
			silUsed: "2.00",
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

		const { getByText, queryByText, rerender, container } = render(<PayslipCard data={mockData} />);

		expect(getByText("Sick Leave").nextElementSibling?.textContent).toBe("1.5");
		expect(getByText("SIL").nextElementSibling?.textContent).toBe("2");
		rerender(<PayslipCard data={{ ...mockData, sickLeaveUsed: "0", silUsed: "0" }} />);
		expect(queryByText("Sick Leave")).toBeNull();
		expect(queryByText("SIL")).toBeNull();
		expect(queryByText("Used")).toBeNull();
		rerender(<PayslipCard data={{ ...mockData, sickLeaveUsed: "0.00" }} />);
		expect(queryByText("Sick Leave")).toBeNull();
		expect(getByText("SIL").nextElementSibling?.textContent).toBe("2");
		rerender(<PayslipCard data={{ ...mockData, silUsed: "0.00" }} />);
		expect(getByText("Sick Leave").nextElementSibling?.textContent).toBe("1.5");
		expect(queryByText("SIL")).toBeNull();
		rerender(<PayslipCard data={{ ...mockData, sickLeaveUsed: undefined, silUsed: undefined }} />);
		expect(queryByText("Used")).toBeNull();
		rerender(<PayslipCard data={{ ...mockData, type: "part_time_teaching" }} />);
		expect(queryByText("Sick Leave")).toBeNull();
		expect(queryByText("SIL")).toBeNull();
		rerender(<PayslipCard data={mockData} />);

		// Check key elements are present
		expect(getByText("SANTOALLA, JAYMIE V.")).toBeDefined();
		expect(getByText("JULY 1-15, 2026")).toBeDefined();

		// Check that numeric formats work
		expect(getByText("6,300.00")).toBeDefined(); // Half salary formatted
		expect(getByText("350.00")).toBeDefined(); // Advisory
		expect(getByText("6,650.00")).toBeDefined(); // Total earnings
		expect(getByText("6,025.00")).toBeDefined(); // Net Pay

		const adminData = { ...mockData, type: "administrators", honorarium: "1200.25" };
		rerender(<PayslipCard data={adminData} />);
		expect(getByText("Honorarium")).toBeDefined();
		expect(getByText("1,200.25")).toBeDefined();
		expect(getByText("SIL")).toBeDefined();
		expect(queryByText("Vacation Leave")).toBeNull();
		const labels = Array.from(container.querySelectorAll("div")).map((element) => element.textContent);
		expect(labels.indexOf("Basic Salary")).toBeLessThan(labels.indexOf("Honorarium"));
		expect(labels.indexOf("Honorarium")).toBeLessThan(labels.indexOf("1st Half"));
		rerender(<PayslipCard data={{ ...adminData, honorarium: "0.00" }} />);
		expect(queryByText("Honorarium")).toBeNull();
		rerender(<PayslipCard data={{ ...adminData, type: "teaching" }} />);
		expect(queryByText("Honorarium")).toBeNull();
		for (const type of ["teaching", "non_teaching"]) {
			rerender(<PayslipCard data={{ ...mockData, type }} />);
			expect(getByText("SIL")).toBeDefined();
			expect(queryByText("Vacation Leave")).toBeNull();
		}
	});
});
