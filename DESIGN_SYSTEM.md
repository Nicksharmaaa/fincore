# FINCORE — Design System & Visual Identity

> Last updated: 2026-11-17  
> Status: **Implemented & Validated**  
> Technology: React 19 + TypeScript + Tailwind CSS v4 + React Router v6 + Lucide React

---

## 1. Brand Identity

| Token | Value | Purpose |
|---|---|---|
| **Brand Name** | **FINCORE** | Enterprise life insurance brokerage platform |
| **Brand Positioning** | *"Intelligent insurance. Simplified decisions."* | Hero and public communication |
| **Regulatory Stance** | Authorised Direct Life Insurance Broker (IRDAI) | Not an insurance company; neutral aggregator |
| **Tone of Voice** | Trustworthy, minimal, professional, intelligent, premium, human-friendly | Indian life insurance retail & enterprise audience |

---

## 2. Colour System & Tokens

The platform uses a deliberate, restrained financial technology palette. No unnecessary colors, purple/blue gradients, neon tones, or glassmorphism.

| Color Name | Token / CSS Variable | Hex | Usage |
|---|---|---|---|
| **Primary Navy** | `--color-primary` | `#142D4E` | Headers, brand anchor, employee workspace navigation |
| **Secondary Navy** | `--color-secondary` | `#1D3D5C` | Sidebar highlight, hover states, card headers |
| **Accent Emerald** | `--color-emerald` | `#16856D` | Primary action CTAs, verified badges, positive CSR |
| **Light Surface** | `--color-surface` | `#E9F1F5` | Form input backgrounds, table borders, subtle chips |
| **Main Background** | `--color-background` | `#F7F9FB` | Application canvas, page background |
| **White** | `--color-white` | `#FFFFFF` | Cards, elevated modals, data tables |
| **Primary Text** | `--color-text-primary` | `#182536` | Headings, labels, high-contrast numbers |
| **Secondary Text** | `--color-text-secondary` | `#687788` | Captions, descriptions, inactive states |
| **Border** | `--color-border` | `#E2E8EF` | 1px clean borders and dividers |
| **Error** | `--color-error` | `#C44545` | Validation errors, exclusions, declined status |
| **Warning** | `--color-warning` | `#C58A36` | Pending regulatory checks, alerts |

---

## 3. Typography

Strictly two primary font families:

| Hierarchy | Family | Weights | Usage |
|---|---|---|---|
| **Headings** | **Manrope** | 600, 700, 800 | Section titles, brand logo, key metric numbers |
| **Body & UI** | **Inter** | 400, 500, 600 | Data tables, form inputs, buttons, navigation items |
| **Monospace** | **Fira Code / Mono** | 400, 500 | Application IDs, PAN references, IRDAI registration numbers |

---

## 4. Spacing, Borders & Elevation

- **8px Base Spacing System**: 4px (`0.5`), 8px (`1`), 16px (`2`), 24px (`3`), 32px (`4`), 48px (`6`), 64px (`8`).
- **Border Radii**: Restrained 8–12px (`rounded-lg`, `rounded-xl`). Avoid excessive roundness or pill cards for complex data.
- **Shadows**: Subtle, restrained elevations (`shadow-xs`, `shadow-sm`, `shadow-md`). No glowing borders.
- **Icons**: Lucide React outline icons consistently sized at 14–16px (inline) and 20px (feature).

---

## 5. Two Distinct Layout Experiences

### 5.1 Public Customer Website (`PublicLayout`)
- **Tone**: Welcoming, editorial, clear, trustworthy, mobile-first.
- **Header**:
  - FINCORE logo with emerald emblem
  - Navigation: Home, Insurance, Compare, How it works, About, Contact
  - Regulatory IRDAI status banner
  - Customer Login and "Get Started" CTA
  - Mobile responsive drawer
- **Footer**:
  - Broker information (CIN, IRDAI Registration No. DB-984/2024)
  - Insurance categories & comparison links
  - Advisory support & grievance contact
  - Statutory disclosures and disclaimers

### 5.2 Internal Employee Workspace (`AppLayout`)
- **Tone**: Dense, productivity-focused enterprise CRM, desktop-first.
- **Persistent Left Sidebar**:
  - Logo + CRM indicator
  - Current role capsule with department
  - Collapsible navigation groups: Core CRM, Policy Lifecycle, Intelligence & Registry, System
  - Badge counts on active queues (Leads, Quotations, Applications, Tasks)
  - Quick link to customer-facing website
  - Collapse / expand toggle
- **Top Navigation**:
  - Dynamic breadcrumb path
  - Global search (`Search leads, customers, policy ref, PAN...`)
  - Notification popover with unread indicators
  - User profile menu with **Quick Role Switcher** for real-time testing of route guards

---

## 6. Role-Based Access Control (RBAC) & Route Guards

Access to the internal employee application (`/app`) is protected by `RouteGuard`:
- **Customers are strictly restricted**: If a user with role `customer` attempts to access `/app`, they are shown an explicit "Restricted Employee Zone" security screen and redirected back to the customer portal.
- **Role Permissions**:

| CRM Route | Sales | Manager | Admin | Operations | Finance | Compliance | Customer |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `/app` (Overview) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/app/leads` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/app/customers` | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| `/app/assessments` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| `/app/quotations` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/app/applications` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/app/tasks` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/app/documents` | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| `/app/insurers` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/app/products` | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| `/app/analytics` | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `/app/settings` | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |

---

## 7. Folder Architecture

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── PublicLayout.tsx       # Customer layout wrapper
│   │   │   ├── PublicHeader.tsx       # Public header + mobile drawer
│   │   │   ├── PublicFooter.tsx       # Comprehensive broker footer
│   │   │   ├── AppLayout.tsx          # Employee CRM layout wrapper
│   │   │   ├── AppSidebar.tsx         # Responsive enterprise sidebar
│   │   │   └── AppTopNav.tsx          # Dynamic breadcrumbs, search, user menu
│   │   ├── shared/
│   │   │   └── Logo.tsx               # FINCORE brand emblem
│   │   └── ui/                        # Reusable design system primitives
│   │       ├── button.tsx
│   │       ├── badge.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── table.tsx
│   │       └── modal.tsx
│   ├── context/
│   │   └── AuthContext.tsx            # Multi-role authentication & role switcher
│   ├── portals/
│   │   ├── customer/
│   │   │   ├── data/
│   │   │   │   └── products.ts        # Versioned life insurance catalog
│   │   │   └── pages/
│   │   │       ├── HomePage.tsx
│   │   │       ├── AboutPage.tsx
│   │   │       ├── InsuranceCatalogPage.tsx
│   │   │       ├── ProductDetailPage.tsx
│   │   │       ├── ComparePage.tsx
│   │   │       ├── AssessmentPage.tsx
│   │   │       ├── ContactPage.tsx
│   │   │       ├── LoginPage.tsx
│   │   │       └── RegisterPage.tsx
│   │   └── employee/
│   │       └── pages/
│   │           ├── OverviewPage.tsx
│   │           ├── LeadsPage.tsx
│   │           ├── CustomersPage.tsx
│   │           ├── AssessmentsPage.tsx
│   │           ├── QuotationsPage.tsx
│   │           ├── ApplicationsPage.tsx
│   │           ├── TasksPage.tsx
│   │           ├── DocumentsPage.tsx
│   │           ├── InsurersPage.tsx
│   │           ├── ProductsPage.tsx
│   │           ├── AnalyticsPage.tsx
│   │           └── SettingsPage.tsx
│   ├── routes/
│   │   ├── AppRoutes.tsx              # Centralized route tree
│   │   ├── RouteGuard.tsx             # RBAC and employee security boundary
│   │   └── navigation.ts              # Nav item configs & permissions
│   ├── pages/
│   │   ├── DesignSystemPage.tsx       # Visual design system showcase
│   │   └── NotFoundPage.tsx           # 404 handler
│   ├── index.css                      # Tailwind v4 theme & Google Fonts
│   └── App.tsx                        # Root router & auth provider
```
