# Brechó Desktop App — Roadmap

**Status:** Planning phase
**Target platform:** macOS desktop app, runs fully locally (no cloud dependency assumed unless decided otherwise)
**Purpose of this doc:** Single source of truth for decisions made during planning. Meant to be handed to Claude Code to drive the build.

---

## 1. Business Context

The brechó is co-owned by **two owners ("donas")**. Each owner:
- Sells her own actively-sourced pieces ("garimpadas") — items she personally acquired, not tied to a supplier.
- Has her own network of suppliers ("fornecedoras") who consign pieces to be sold in the store.

So every item in the store belongs to one of three categories:
1. **Garimpada — Owner A's own piece**
2. **Garimpada — Owner B's own piece**
3. **Fornecedora piece** — consigned by a supplier, and each supplier is affiliated with one specific owner (A or B)

> **Supplier-owner affiliation is immutable in the app.** A supplier is tied to whichever owner she first supplied, permanently — there's no "reassign owner" feature. If a supplier ever genuinely starts supplying the other owner instead, that's an exceptional real-world situation resolved directly by the support/back-office team (e.g. a manual database correction), not something the app exposes as a normal edit.

## 2. Revenue Split Rules (as defined so far)

> ⚠️ These are the rules as described in planning conversation. Flagged as **[CONFIRM]** where it would be good to double check the read-back is 100% correct before building.

- **Owner A** (the owner who gets the special cut — name TBD) receives:
  - **100%** of the sale value of her own garimpada pieces.
  - **20%** of the *full sale price* of every other piece sold that belongs to **Owner B's side** — whether that's Owner B's own garimpada piece, or a piece from one of Owner B's suppliers.
  - This cut is **one-directional** — Owner B does *not* get a symmetrical cut of Owner A's sales.
- **Owner B** receives whatever remains after the applicable cuts on her side's sales (her garimpada pieces, minus Owner A's 20% cut; or her suppliers' pieces, minus Owner A's 20% cut and minus the supplier's commission).
- **Suppliers (fornecedoras)** receive a **commission %** of the full sale price of their own pieces sold. This percentage is **not hardcoded** — must be configurable per supplier (possibly per item).
- If a supplier's piece is **not sold**, the supplier can **withdraw it at any time, at no cost**.
- **Owner departure (rare event):** if one owner leaves the business, the remaining owner (who also owns the building) receives the **full remainder of every sale going forward**, regardless of which owner's side the item was nominally on — she absorbs what would have been the departed owner's share. Suppliers are unaffected and still get paid their commission % as usual. Implemented as a manual "deactivate owner" action, not a self-serve UI control — it's a back-office/support action, same treatment as the supplier-reassignment case above. Existing recorded sales/splits are historical and never recomputed.

### Worked example (for a supplier piece belonging to Owner B's side, sale price = P):
- Owner A's cut: `0.20 × P`
- Supplier's commission: `supplier_pct × P`
- Owner B's remainder: `P − (0.20 × P) − (supplier_pct × P)`

### Worked example (Owner B's own garimpada piece, no supplier, sale price = P):
- Owner A's cut: `0.20 × P`
- Owner B's remainder: `0.80 × P`

### Worked example (Owner A's own garimpada piece, sale price = P):
- Owner A: `100% × P`
- (Presumed) Owner A's own suppliers' pieces: supplier commission subtracted, Owner A keeps the rest, **no 20% cut applies** since it's her own side — **[CONFIRM]**

## 3. Tech Stack — DECIDED

- **Backend:** Python
- **Frontend:** modern, beautiful, intuitive UI — explicitly **not** Tkinter or anything dated-looking
- **Recommended approach:** Python backend (FastAPI) serving a local HTML/CSS/JS frontend, wrapped in a native macOS window with **pywebview** (or packaged with PyInstaller into a proper `.app`). This gives full visual design control (no framework look-and-feel constraints) while keeping everything in Python + web tech, fully local, no server/internet required.
  - Alternative considered: **Flet** (Python + Flutter) — single-language, faster to scaffold, but less design flexibility than raw HTML/CSS.
  - *Open to switching if you'd rather see both options prototyped before committing.*
- **Architecture:** single Mac, used in-store by both owners — no networking/sync/multi-device support needed. This simplifies things a lot (no auth, no conflict resolution, no cloud).
- **Data storage:** local **SQLite** database (fits a single-machine local app well) — flagged for final confirmation.

## 5. Resolved Decisions (latest round)

- **v1 scope:** all four core areas are priorities for v1 — inventory/stock tracking, sales & checkout, consignor management & payouts, and reports & analytics.
- **Owner A's own supplier pieces:** confirmed — no 20% cut applies; only supplier commission is subtracted, Owner A keeps the rest.
- **Item intake fields:** photo(s), size, condition, category, price, and a **SKU** (auto-generated preferred).
- **Storage:** SQLite — confirmed.
- **Currency/locale:** BRL (R$) formatting — confirmed.
- **SKU scheme:** auto-generated, simple sequential (exact format TBD during build) — confirmed.
- **Withdrawals:** when a supplier takes back an unsold piece, it is **not deleted** — it's kept as a **greyed-out / "withdrawn" entry** in inventory history. This enables tracking **recurring short-term withdrawal patterns per supplier**, to help flag unreliable suppliers over time (v1 feature: supplier reliability view/report).
- **Supplier-owner affiliation is immutable in the app:** editable fields on a supplier are name and commission % only. If a supplier's owner affiliation genuinely needs to change, that's a back-office/support correction outside the app, not an in-app edit.
- **Owner departure:** implemented as an `active` flag per owner (`PATCH /api/owners/{id}`, no UI button). When exactly one owner is active, every sale routes its full remainder to that owner regardless of the item's nominal side; supplier commission still applies. Can't deactivate the last active owner. Reversible — reactivating an owner immediately restores the normal 20%-cut split.

## 6. Open Questions / Decisions Still Needed

*(none blocking — remaining details can be resolved during build)*

- [ ] Exact SKU format (e.g. prefix by category/owner + sequence number)
- [ ] Threshold/definition for "recurrent short-term withdrawal" (e.g. withdrawn within N days of intake, X times) — worth defining once real data patterns are visible

## 4. Decisions Log

| Date | Decision |
|------|----------|
| 2026-07-31 | App will be a local macOS desktop app for managing the brechó |
| 2026-07-31 | Mixed inventory model: owned stock + consignment stock |
| 2026-07-31 | Two owners, each with own garimpada items and own suppliers |
| 2026-07-31 | One owner gets 100% of her garimpada sales + 20% (one-directional) of all sales belonging to the other owner's side |
| 2026-07-31 | Supplier commission % is fully configurable, not hardcoded |
| 2026-07-31 | Unsold supplier items can be withdrawn free, any time |
| 2026-07-31 | Backend: Python. Frontend: modern/beautiful, not Tkinter — recommended FastAPI + local web frontend wrapped via pywebview |
| 2026-07-31 | Single Mac, single device, used by both owners — no sync/multi-device needed |
| 2026-07-31 | v1 includes all four core areas: inventory, sales/checkout, consignor payouts, reports |
| 2026-07-31 | Confirmed: Owner A's own supplier pieces get no 20% cut, only supplier commission subtracted |
| 2026-07-31 | Item intake captures: photo(s), size, condition, category, price, SKU |
| 2026-07-31 | Storage: SQLite. Currency: BRL. SKU: auto-generated sequential |
| 2026-07-31 | Withdrawn supplier pieces kept as greyed-out history entries (not deleted), to enable supplier-reliability tracking (flag recurring short-term withdrawals) |
| 2026-07-31 | Supplier-owner affiliation is immutable in the app once set; a real change is a back-office/support correction, not an in-app edit feature |
| 2026-07-31 | If an owner leaves the business, the remaining (building-owning) owner gets full value of every sale going forward; suppliers still get paid; toggled via a back-office `active` flag, not a UI button |

---
*This file is meant to be updated throughout planning. Add new decisions to the log and check off open questions as they're resolved.*
