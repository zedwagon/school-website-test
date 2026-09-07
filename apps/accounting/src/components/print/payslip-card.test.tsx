/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { PayslipCard } from "./payslip-card";

describe("PayslipCard", () => {
  it("should render without crashing", () => {
    const mockData = {
      periodName: "JULY 1-15, 2026",
      staffName: "SANTOALLA, JAYMIE V.",
      employeeType: "teaching",
      baseSalary: "12600.00",
      halfSalary: "6300.00",
      transpoAllowance: "0.00",
      positionPay: "0.00",
      advisoryPay: "350.00",
      totalEarnings: "6650.00",
      sssEe: "625.00",
      philhealthEe: "0.00",
      pagIbigEe: "0.00",
      loanDeduction: "0.00",
      totalDeductions: "625.00",
      netPay: "6025.00",
    };

    const { getByText } = render(<PayslipCard record={mockData} period={{}} />);
    
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
