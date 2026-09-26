# StockSense QA Report (Phase 6)

Date: 2026-09-26. Tested by Developer 3.

## Test environment

- API (`server/`) running against a local, throwaway **MongoDB 8.2 single-node replica set**. That's
  the same topology as Atlas, so transactions ran exactly as they will in production.
- Seeded with `npm run seed` (admin01 / Admin@12345).
- The UI checks rendered the real client (`client/src/App.jsx`, loaded through Vite) in a simulated
  browser (jsdom), calling the running API over HTTP with CORS. They typed into forms, clicked
  buttons and confirmation dialogs, and read the page. That harness isn't part of the repo because it
  needs extra dev-only tools.
- **Not covered:** a manual click-through in a real browser, and a run against the team's Atlas
  cluster. Do both once `MONGODB_URI` is set.

## How to re-run the automated checks

```bash
npm run dev                      # API + web
npm run seed --prefix server     # first time only
npm run smoke --prefix server    # 34 end-to-end API checks
```

## Required scenarios

The smoke test creates its own warehouse with a default "Stock" location (the main store) and a
"Production Rack" location.

| # | Scenario | Expected | Result |
|---|---|---|---|
| 1 | Product "Steel Rod", initial stock 0 → receipt of 100 → To Do → Validate | stock = 100 | ✅ 100 |
| 2 | Transfer 20 from Main (Stock) → Production Rack → Validate | Main = 80, Rack = 20, total = 100 | ✅ 80 / 20 / 100 |
| 3 | Delivery of 20 → To Do → Validate | total = 80 | ✅ 80 |
| 4 | Adjustment at Main, counted 77 (80 recorded) → Validate | stock = 77, difference = −3, ledger entry | ✅ 77, −3, 4 ledger entries in total |

## Other checks (all passing)

| Area | What was checked |
|---|---|
| Guard rails | Validating twice is rejected. A delivery larger than stock goes to *waiting* on To Do, and validating it is rejected with stock unchanged. Source = destination is rejected. Negative quantity is rejected |
| Dashboard | The KPIs (in stock, low, out) match the product list for the same warehouse filter. Pending/waiting delivery counts are right. The category filter affects both products and operations. The low-stock alert list follows the reordering rule. The UI tiles show exactly the API numbers |
| Filters and search | SKU search. Category filter. Receipt search by reference. Dashboard operations filter by type and status. Ledger filter by warehouse and direction. The dashboard's "Document type" dropdown filters the table |
| Auth | A protected route redirects to /login. A wrong password shows "Invalid Login Id or Password". Signup client validation (login ID length, password rules, re-enter match). Login lands on the dashboard, and a logged-in user is sent away from /login. An invalid or expired token logs out with a "session expired" toast. The API returns 401 without a token |
| Pages | Stock list, categories, receipts/deliveries/transfers/adjustments lists, kanban view, move history, warehouses, locations, profile and 404 all render with seeded data |
| UI workflows | Receipt created from the form → To Do confirmation → Ready → Validate confirmation → Done, with stock +10 on the API, and Print. A delivery with too much quantity shows the red line and alert, then goes to Waiting on To Do. An adjustment shows a live difference of −3, and Apply sets stock to the counted quantity |

Totals: **34/34 API smoke checks** and **40/40 UI checks**. Both were run twice, and the UI run
produced no React console errors.

## Bugs found and fixed in this phase

| Bug | Impact | Fix |
|---|---|---|
| New adjustment lines had no `countedQuantity` value | React warned about an uncontrolled → controlled input | `LinesEditor` creates lines with the edited quantity field and treats a missing value as `''` |
| `LinesEditor` built updates from the `lines` array of the previous render | Quick successive edits (add line → pick product → type quantity) could overwrite each other and save a document without lines | All line edits use functional state updates |
| Operation and adjustment forms copied the loaded document into form state in an effect | For one render the document was shown with an empty form, so clicking To Do or Validate right then reported "Add at least one product line first" | The document is copied into the form during render, so the form is never shown out of sync |

## Known limitations (not bugs)

- With a warehouse filter, the dashboard counts products that have no stock in that warehouse as
  "out of stock" (documented in `docs/API.md` §11).
- Waiting deliveries don't switch to ready automatically when stock arrives. "Check availability"
  re-checks.
- Product pickers load the first 100 active products.
