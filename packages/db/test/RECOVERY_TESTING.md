# Database recovery verification

## Accounting and school-year integrity regression tests

```sh
source /home/alfred/.nvm/nvm.sh
nvm use
RUN_ACCOUNTING_ATOMICITY=1 node node_modules/vitest/vitest.mjs run packages/db/test/accounting-atomicity.integration.test.ts
```

Uses an isolated PostgreSQL cluster on loopback port 55440, the real Neon WebSocket driver, Drizzle migrations, and actual accounting actions/queries. Only authentication and Next.js cache infrastructure are replaced. No configured Neon database is accessed. Checks concurrent daily receipt saves, overlapping bulk saves, receipt/ledger batch rollback, exact final-cent repayment, consistent odd-cent payroll totals after editing, payment/status rollback, concurrent overpayment rejection, concurrent exact-balance repayment, payroll replacement rollback, serialized regeneration, inactive-workforce clearing, finalized-period protection, the edit/finalization race, unique/concurrent payroll-period creation, valid date ordering, atomic and repeat-safe school-year rollover, and concurrent activation/archival with database invariants. The cluster is stopped afterward; diagnostic files remain under `/tmp/mpps-atomicity-pg-*`. Requires the same PostgreSQL binaries as below.

## Controlled real-driver integration test

Run from the repository root in WSL after loading NVM:

```sh
source /home/alfred/.nvm/nvm.sh
nvm use
RUN_DB_RECOVERY_INTEGRATION=1 node node_modules/vitest/vitest.mjs run packages/db/test/recovery.integration.test.ts
```

Requires PostgreSQL binaries (default `/usr/lib/postgresql/18/bin`; override with `PG_BIN`). Uses an isolated temporary cluster on loopback port 55439 and a local WebSocket-to-PostgreSQL proxy. It never connects to the configured Neon database. Plaintext/trust authentication is confined to this disposable loopback test cluster. The cluster is stopped after the suite; generated files remain under the reported `/tmp/mpps-recovery-pg-*` directory for diagnosis.

The real Neon driver, real pool, real PostgreSQL, and Drizzle run without mocking connection/query methods. The proxy introduces temporary and sustained connection failures, stalled handshakes, idle disconnects, and loss of a response after a committed INSERT. The suite compares the ordinary pool's failure with recovery, checks three attempts and the 0.5/1-second waits, verifies a fully stalled acquisition ends around 13.5 seconds, verifies concurrent reads release clients, and asserts the write was committed exactly once. Runtime is about 20 seconds; this suite is opt-in.

## Live read-only smoke test

The database transport uses `DatabaseWebSocket`, which sets a two-second TCP address-family attempt allowance on database sockets only. It retains IPv4/IPv6 selection and default certificate verification and does not change Node's global networking defaults. The reproduced local failure was the default 250ms allowance timing out on this network path; both direct and pooled endpoints worked after this scoped adjustment. This finding does not establish the cause of production errors or measure genuine Neon compute wake-up time.

Run the opt-in live SELECT-only matrix without global network flags:

```sh
RUN_LIVE_NEON_RECOVERY=1 node node_modules/vitest/vitest.mjs run packages/db/test/live-network.integration.test.ts
```

The matrix verifies:

- Pooled and direct endpoints succeed on their first WebSocket connection attempt.
- Five fresh pools connect successfully.
- Eight concurrent reads succeed and return all checked-out clients.
- Warm queries reuse a connection and reconnect after idle cleanup.
- Node's global address-selection timeout stays unchanged.

```sh
node apps/website/node_modules/tsx/dist/cli.mjs packages/db/test/live-recovery-probe.ts
```

Reads `apps/accounting/.env` by default (override with `RECOVERY_ENV_FILE`). Executes only `SELECT 1`; output contains no credentials. This shows reachability, not proof of an actual Neon suspension/wake cycle.

## Manual application verification (no Playwright)

1. Open accounting payroll and the permitted website enrolment view while signed in.
2. On database failure, confirm the friendly fallback instead of a raw Server Components message.
3. Click Try again and verify a fresh page request/loading state. Do not resubmit a financial or enrolment mutation blindly.
4. Once database access returns, verify actual records load on both applications.
5. For a genuine Neon cold-start check, use an explicitly designated non-production database and wait until Neon reports its compute suspended. Then request each app and record successful loading plus timing. Do not suspend production for testing.

A successful controlled proxy test is not proof of Neon control-plane wakeup, deployment request limits, or every application mutation. Established-query failures are deliberately not replayed; a failed write response requires checking whether the record committed.

Connection acquisition now permits three attempts capped at four seconds each, with 0.5/1-second backoff: at most 13.5 seconds of configured acquisition waiting plus scheduling overhead. Shorter caller timeouts are retained; zero/unlimited and longer caller timeouts are capped. Only recognized transient network/temporary database errors are retried, including nested WebSocket ErrorEvents and AggregateError causes. Authentication, certificate, SQL, invalid hostname, and unknown errors fail immediately. This is a per-acquisition budget, not a whole-page or SQL-execution deadline; pages with multiple acquisitions can still take longer. Deployment request limits must leave room for query execution and rendering.
