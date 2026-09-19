# Monorepo and Feature Development Plan

## Phase 1: Staging/Internal Testing
1. **Test Monorepo Transfer in Zedwagon**
   - Deploy and verify the monorepo setup in the Zedwagon environment.
   - Specifically test the **accounting** application deployment (ensure the `apps/accounting` builds and runs as expected, as this hasn't been fully tested in this environment yet).
   - Verify the main **website** continues to deploy properly.

## Phase 2: Production/Client Turnover
2. **Test Monorepo Setup in Client's Account (Prod)**
   - Deploy the monorepo structure to the client's production environment.
   - **Crucial:** Only deploy the **website** application to this environment.
   - The accounting portal is not yet turned over, so it should not be exposed or built on the client's production server.

## Phase 3: Continuous Development (Accounting App)
3. **Accounting Features Implementation**
   - **3.1 Printing Module**: Implement the printing functionality for payslips and the overall payroll summary.
   - **3.2 Cashflow Module**: Build out cashflow features (specific requirements and details to be provided by the team after the printing module is completed).
