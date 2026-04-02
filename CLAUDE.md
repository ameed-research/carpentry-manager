# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A fullstack carpentry management system with a React frontend and Spring Boot backend. The UI is in Hebrew (RTL layout). Key features include customer/supplier management, inventory tracking, expense recording, document storage with AI-powered analysis (Google Gemini), and real-time notifications via WebSockets.

## Commands

### Frontend (`cd frontend`)
```bash
npm run dev       # Dev server on http://localhost:5173 (proxies /api and /ws to :8080)
npm run build     # TypeScript check + Vite build
npm run lint      # ESLint
```

### Backend (`cd backend`)
```bash
mvn spring-boot:run         # Run on port 8080
mvn clean package -DskipTests  # Build JAR
mvn test                    # Run all tests
mvn test -Dtest=ClassName   # Run single test class
```

### Production Packaging (`package.ps1`)
Runs the PowerShell script which builds frontend, copies dist to `backend/src/main/resources/static`, then packages the backend into `backend/target/manager-1.0.jar`.

### Prerequisites
- MongoDB running on `localhost:27017` (database: `carpentry_manager_001000`)
- `GEMINI_API_KEY` environment variable set for AI document analysis
- Document storage directory: `D:\tmp\carpentry-manager-docs`

## Architecture

### Monorepo Structure
```
/
├── frontend/          # React 19 + Vite + TypeScript
├── backend/           # Spring Boot 4.0.5 + Java 25
├── package.ps1        # Production build script
└── developer-instructions.md  # Development standards
```

### Frontend Architecture
- **State**: Redux Toolkit — `authSlice` (JWT token, roles in localStorage), `notificationSlice` (unread count, max 20 notifications)
- **API**: Axios instance in `services/api.ts` with base URL `/api`. Request interceptor injects JWT; response interceptor triggers logout on 401
- **Routing**: React Router v7 in `App.tsx`. Protected routes check `isAuthenticated`; admin routes check `roles.includes('ADMIN')`
- **Real-time**: SockJS + Stomp connecting to `/ws`, subscribing to `/topic/notifications`
- **UI**: Material-UI 7 with RTL (`stylis-plugin-rtl`), Hebrew locale (`heIL`). Never use raw `<div>` when an MUI component exists. No hardcoded colors — use theme tokens

### Backend Architecture
Standard layered architecture per domain module: `controller → service → repository`. Domains: `customer`, `supplier`, `inventory`, `expense`, `document`, `report`, `dashboard`, `notification`, `ai`, `security`.

- **Auth**: JWT (jjwt) via `JwtAuthenticationFilter`, stateless Spring Security. `@PreAuthorize` at controller layer for method security
- **DTOs**: MapStruct mappers (`@Mapper(componentModel = "spring")`). Methods named `toDto` / `toEntity`
- **Database**: MongoDB with Spring Data. Auditing enabled for `createdDate`/`lastModifiedDate`
- **AI**: `GeminiService` calls Gemini API via `RestClient`, base64-encodes files, parses JSON — supports `INVOICE`, `DELIVERY_NOTE`, `PAYMENT_CHECK`, `BANK_TRANSFER` document types
- **WebSocket**: Spring WebSocket config; `NotificationService` publishes to `/topic/notifications`
- **SPA routing**: `WebConfig` serves `index.html` as fallback for non-API routes

## Business Logic

### Domain Rules
- **Currency**: ILS (shekels). **VAT rate**: 17%. **Date format**: `dd/MM/yyyy`. **Time format**: 24-hour.
- **Phone validation**: Israeli phone number patterns only (customers and suppliers).
- **Closing a customer file**: makes all customer data read-only — no further edits allowed.

### Inventory
- Every item has: name (≤150 chars), category (default: "כללי"), quantity (≥0), price excl. VAT (≥0), supplier, universal catalog number (SKU), source document ID, update date, updating user, and `version` (starts at 0, increments on each update).
- **History**: before updating an inventory item, copy the current record to the history collection with a reference (`objectId`) to the source record. Keep up to 10 history records per item.
- **Bulk upload**: uploading an invoice or delivery note auto-creates/updates inventory items (with history). The uploading user becomes the `updatingUser`. If a price changes as a result, send a notification to the user.
- **Category deletion**: blocked on the backend if any items reference that category — return a descriptive error message.
- **Purchase orders**: for a list of items, select the supplier offering the best price per item, then generate one purchase order per supplier.

### Customer Financial Logic
- **Work items tab**: list of items to work on (description ≤150 chars, price, date). Shows subtotal before discount, a lockable discount field, and total to pay.
- **Payments tab**: list of received payments. Each payment has: date, amount, method (cash / check / bank transfer), and method-specific details.
  - Check: bank, branch, account, check number, due date.
  - Bank transfer: reference number.
- **Customer debt** = total to pay (work items) − total payments received.
- A payment can be entered manually or by uploading a document (which triggers async AI analysis).

### Supplier Payments
- Same structure as customer payments tab, without the "total received" and "debt" summary fields.
- **Supplier debt** is displayed in the suppliers list table.

### Document Processing (AI Pipeline)
- Supported formats: images and PDF. Multiple files can be uploaded at once.
- Upload flow: client sends file → backend saves it and returns status `PENDING` → backend starts async Gemini analysis → result triggers a WebSocket notification (success or error).
- **Anomaly detection**: reject documents already processed before (even in a different format) or not addressed to the business.
- A document can carry multiple data types — e.g., a supplier invoice with line items should update both the supplier's payment records **and** inventory.
- Document types recognized by Gemini: `INVOICE` (with/without detail), `DELIVERY_NOTE`, `PAYMENT_CHECK`, `BANK_TRANSFER`.

### Reports
- **Monthly income/expenses**: debits = supplier invoices + expense invoices; credits = customer payments received + checks due this month.
- **Inventory by supplier** and **full inventory** reports are also available.

### Notifications
- Triggered by: document processing success/failure, checks due soon, inventory price changes from document upload.
- Bell icon shows unread count (badge). Clicking opens last 20 notifications; closing resets unread count.
- Unread state is managed client-side in `localStorage`. Notification data is fetched from the backend `notification` collection.
- Three visual types: message (info icon), error (error icon), warning (warning icon).

### Tables / UI Conventions (applies to all list screens)
- Client-side filtering — no server round-trip when filtering.
- Row count display: "Y מתוך X" (Y of X) when a filter is active.
- Pagination when >10 rows.
- Confirm dialog before any delete.
- Empty state message when table has no rows.

## Code Standards (from `developer-instructions.md`)

### Java
- Explicit types — avoid `var`
- No `else` when early return suffices; prefer early returns
- No `throws` in method signatures — use unchecked exceptions
- No comments except CRON expressions, RegEx, TODOs, and given/when/then test separators
- Max 120 character line length
- `@RequiredArgsConstructor` for constructor injection (never `@Autowired` in production code)
- `@Slf4j` for logging with `{}` placeholders
- `@Getter`/`@Setter` instead of `@Data`; `@Builder` for complex object creation
- `@Transactional` at class level on Service only
- `@ConfigurationProperties` when binding 3+ related properties

### Testing
- JUnit + Mockito; `given/when/then` structure
- `@WebMvcTest` for controllers, `@SpringBootTest` for integration tests
- Test method naming: `get_user_by_id_ok` / `get_user_by_id_not_found_ko`
- No reflection, no business logic in tests

### Frontend
- Function components only; TypeScript interfaces for all props
- PascalCase component names matching file names
- No hardcoded colors — use MUI theme
- No raw `<div>` elements when MUI components exist
