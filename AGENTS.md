## AGENT GOAL
Generate all the code required to build a professional Investment Analysis SaaS using Next.js 14 (App Router) + Shadcn/UI + TailwindCSS + Prisma + Postgres.  
The platform must support authentication, initial investment section setup, asset management with allocation by type, a complete dashboard with charts, and a user settings page.  
Visual design should follow a clean, corporate look inspired by XP Investimentos.

---

## PROJECT REQUIREMENTS

### 1. Visual Design & UX
- Professional, mature, corporate look inspired by XP Investimentos.
- Primary colors: navy blue, graphite gray, white.
- Use Shadcn/UI + TailwindCSS + Lucide icons for the UI.
- Clean, simple, readable layout.
- Fully responsive.
- Dashboard focused on clarity and user-friendly experience.

---

## 2. Authentication
Build screens and logic for:
- `/login`
- `/register`
- `/forgot-password`

Requirements:
- NextAuth using Credentials Provider.
- Passwords hashed with bcrypt.
- Protected routes via middleware.
- Session-based authentication with automatic route redirection.

---

## 3. Database Entities (Prisma Schema)

### User
- id (PK)
- name
- email (unique)
- passwordHash
- createdAt

### InvestmentSection (max 4 per user)
- id (PK)
- userId (FK → User.id)
- name
- targetPercentage (0–100) ← % target for the section
- createdAt

### Asset
- id (PK)
- sectionId (FK → InvestmentSection.id)
- name
- ticker
- type ← used for internal type-based allocation
- description (optional)
- currentValue ← random for now
- targetPercentage (0–100) ← % target of the asset inside the section
- createdAt

---

## 4. Business Logic

### A) Initial Setup `/setup`
1. After first login, redirect the user to the setup page.
2. User may create up to **4 investment sections**.
3. Each section requires:
   - Name
   - `targetPercentage` (0–100)
4. Display running total of section percentages.
5. If the total exceeds 100%, disable the Save button and show an error.
6. After saving, redirect the user to `/dashboard`.

---

### B) Dashboard `/dashboard`
The dashboard must show:
- total investiments sumarized of all assets
- All investment sections with: 
  - section name
  - section target %
  - section real % (random placeholder for now, can be more than)
- All assets grouped under their respective section.
- two pie charts:
  - target % per section
  - real % per section

---

### C) Asset Logic (Allocation by Type)

Each asset belongs to a section and a type.  
Inside each **section**, assets must be grouped by `type`.
11111
Rules:
- Each asset has a `targetPercentage` (0–100).
- For each `(section, type)` group:
  - Sum all asset targetPercentage values.
  - Display a progress bar:
    **"X% allocated out of 100% for type <Type>"**
  - If allocation exceeds 100%:
    - Show a visual warning (e.g., red text or badge).
    - **Do NOT block saving.**
- Example:
Section: Variable Income
Type: Stocks
Assets:
PETR4 → 30%
VALE3 → 40%
ITUB4 → 50%
Total = 120%
Show warning, saving still allowed.

---

### D) Settings Page `/settings`
User must be able to:
- Rename sections
- Edit section target percentages
- Add/edit/remove assets
- See allocation progress bars per asset type
- See warnings if type allocation > 100%

---

## 5. Navigation Flow

1. Not authenticated → Login / Register / Forgot Password  
2. First login → Redirect to `/setup`  
3. After setup → Redirect to `/dashboard`  
4. User avatar menu → `/settings`- settings can back to setup page

Protected Routes:
- `/setup`
- `/dashboard`
- `/settings`

---

## 6. Architecture (Next.js 14 — App Router)

### Recommended folder structure:
app/
login/
register/
forgot-password/
setup/
dashboard/
settings/
api/
components/
lib/
prisma/
styles/

### Backend
- Implement server-side logic using Next.js **Server Actions**.
- Use API Routes only when necessary.
- Prisma client located in `lib/prisma.ts`.

---

## 7. Components to Generate
- All form components using Shadcn/UI
- Modal for adding/editing assets
- Section card component
- Header with user avatar and dropdown
- Type allocation progress bar (100% recommended target)
- PieChart component using Recharts or Tremor

---

## 8. Pie Chart Requirements
- Compare section target % vs real %.
- Real % values should be randomly generated server-side for now.
- Chart must be clean, corporate, and responsive.

---

## 9. Validation Rules

### Sections
- Max: 4 sections per user.
- Sum of all `targetPercentage` ≤ 100%.
- If >100%:
  - block saving
  - show error
- If <100%, allow saving but show “remaining %”.

### Assets
- `targetPercentage` must be between 0–100.
- For each `(section, type)`:
  - Show total allocation.
  - If >100%:
    - Only show warning.
    - Do NOT block saving.
- Required fields:
  - section name
  - section percentage
  - asset name
  - asset ticker
  - asset percentage

---

## 10. What the Agent Must Generate
The agent must output:

- Full Next.js 14 App Router project
- Prisma schema + SQL migrations
- All Server Actions for CRUD
- Fully styled Shadcn/UI components
- Dashboard with pie chart
- Setup page with validation
- Settings page with asset management
- Type-based allocation progress bars
- Authentication flow fully implemented
- All pages fully functional and responsive
- Clean, commented, modular code
- Visual styling aligned with XP Investimentos

---

## AGENT MESSAGE STYLE
Always:
- Provide complete and functional code.
- Provide explanation of what was generated.
- Keep structure modular, clean, and documented.
- Never omit critical parts.
- Ensure all front-end and back-end logic matches this specification.

---

## END OF AGENT SPECIFICATION

## ROADMAP: Adding New Strategy Import Modules

1. **Module scaffold**
   - Add a new file under `app/dashboard/modules/` implementing `StrategyModule` (`id`, `name`, `supportedExtensions`, `extract`).
   - `extract` receives `{ file: { buffer, filename }, options? }` and must return rows with `{ asset, percentage, action? }` where `action` is `comprar` | `vender` | `manter` (default to `manter` if the source doesn’t provide it).

2. **Action extraction**
   - Parse per-asset action from the source (Excel/CSV columns or PDF surrounding text).
   - Do not hardcode a single action for all assets unless explicitly desired by the module; if absent, default each asset’s action to `manter`.

3. **Registry**
   - Register the module in `app/dashboard/modules/index.ts` so the UI can list it.
   - Expose only metadata (id, name, extensions) to the client; keep parsing code server-only.

4. **UI wiring**
   - `StrategyUploader` receives `modules` from the server; module selection is required before upload.
   - If the module needs extra options (e.g., PDF page, equal targets), add them conditionally in the uploader and pass them via `FormData` to `parseStrategy`.

5. **Server action**
   - `parseStrategy` resolves the module via `getModuleById` and calls `module.extract`.
   - Handle errors with user-friendly messages; keep bodySizeLimit in `next.config.js` if needed.

6. **Assets creation**
   - Imported rows create assets with `asset` as name/ticker, `percentage` as target, and `action` stored in `Asset.action`.
   - Prevent duplicate tickers per section; default priceUnit/quantity can remain 0 unless the module provides them.

7. **Testing**
   - Verify the new module with a sample file for its expected format and confirm actions/percentages are parsed correctly and rendered in the dashboard list.

