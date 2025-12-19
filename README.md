# 📦 Velos Inventory

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.18.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)

**A modern, full-featured inventory management system for hardware, equipment, and products of all kinds**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Project Structure](#-project-structure) • [Documentation](#-features-deep-dive) • [API](#-api-endpoint-patterns)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-configuration)
- [Database Schema](#-database-schema)
- [Development Commands](#-development-commands)
- [Environment Variables](#-environment-variables)
- [Features Deep Dive](#-features-deep-dive)
- [API Endpoint Patterns](#-api-endpoint-patterns)
- [Business Rules](#-business-rules)
- [Deployment](#-deployment)
- [Code Conventions](#-code-conventions)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Velos Inventory** is a comprehensive, production-ready inventory management solution designed for managing hardware, equipment, and products of all kinds. Built with modern web technologies including Next.js 15 App Router, React 19, TypeScript, and PostgreSQL, it provides a robust, scalable, and user-friendly platform for:

- Tracking inventory across multiple locations
- Managing product catalogs with rich metadata
- Monitoring stock levels and low-stock alerts
- Processing sales with a POS-like workflow
- Generating detailed analytics and reports
- Maintaining complete audit trails
- Managing suppliers, customers, and purchase orders
- Handling batch/lot tracking and reorder automation

### Key Highlights

- 🔐 **Secure Authentication** - Built-in authentication using Better Auth with email/password + Google OAuth
- 📊 **Real-time Dashboard** - Interactive charts and analytics for inventory insights with KPI cards
- 🎨 **Modern UI/UX** - Beautiful, responsive interface built with Shadcn UI and Tailwind CSS v4
- 🚀 **High Performance** - Optimized with Next.js 15 App Router and Turbopack for lightning-fast development
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- 🔍 **Advanced Filtering & Search** - Powerful search, filtering, and column visibility controls
- 📈 **Analytics & Reports** - Comprehensive inventory analytics, category breakdowns, and stock movement tracking
- 🏷️ **Flexible Tagging System** - Hierarchical categories with custom tags and product relationships
- 📝 **Complete Audit Trail** - Full activity logging of all system changes with actor tracking
- 🛒 **POS Sales Workflow** - Full-featured sales module with cart, checkout, and receipt generation
- 📦 **Batch & Lot Tracking** - Support for batch tracking with expiry dates and manufacturing dates
- 🔄 **Stock Management** - Real-time stock adjustments, transfers, and movement history
- 🤝 **Supplier & Customer Management** - Track suppliers, customers, and purchase orders
- ⚙️ **Reorder Automation** - Automated reorder rules with preferred suppliers and reorder points

---

## 🚀 Features

### 🔐 Authentication & Security

- **Better Auth Integration** - Secure session management with email/password and OAuth providers
- **Multi-provider Support** - Google OAuth integration for seamless authentication
- **Protected Routes** - Middleware-based route protection with automatic redirects
- **User Management** - Multi-user support with user profiles and roles
- **Session Tracking** - IP address and user agent logging for security audit trails
- **Password Security** - Encrypted password storage and secure session handling

### 📦 Inventory Management

#### Product Management
- **Create & Edit Products** - Comprehensive product creation with rich metadata
- **SKU & Barcode Tracking** - Unique SKU and barcode support with barcode generation
- **Product Specifications** - Store detailed specs, compatibility notes, and technical details
- **Image Management** - Product image upload with ImageKit CDN integration
- **Manufacturer & Model Tracking** - Track manufacturer, model, and variant information
- **Condition Tracking** - Track product condition (new, used, refurbished)
- **Location Management** - Track physical storage locations with warehouse support
- **Warranty Information** - Record and track warranty periods and terms
- **Supplier Linking** - Associate products with preferred suppliers
- **Cost & Pricing** - Track both cost price and selling price

#### Stock Management
- **Real-time Inventory** - Up-to-the-minute quantity tracking
- **Multi-location Support** - Manage stock across multiple warehouses/locations
- **Low Stock Alerts** - Automatic alerts when inventory falls below thresholds
- **Stock Adjustments** - Quick adjustments for inventory corrections
- **Stock Movement History** - Complete audit trail of all stock changes
- **Batch/Lot Tracking** - Track product batches with expiry dates and manufacturing dates
- **Stock Transfers** - Move inventory between locations with tracking
- **Reorder Automation** - Automatic reorder point management with supplier integration

#### Category & Tag Management
- **Hierarchical Categories** - Organize products into logical categories
- **Custom Tagging** - Flexible tag system for additional organization
- **Collapsible Previews** - Quick product previews within category/tag management
- **Category Analytics** - See stock levels and counts per category
- **Search & Filter** - Quick search across categories and tags

### 📊 Analytics & Reporting

#### Dashboard Analytics
- **Key Performance Indicators** - Real-time KPI cards showing critical metrics
- **Category Breakdown Charts** - Visual representation of inventory by category
- **Manufacturer Distribution** - Analysis of products by manufacturer
- **Stock Level Visualizations** - Interactive charts showing stock trends
- **Interactive Data Tables** - Sortable, filterable inventory tables
- **Real-time Statistics** - Live inventory value and unit counts
- **Customizable Date Ranges** - URL-synced date filters for precise analysis

#### Data Export & Reporting
- **Excel/CSV Export** - Export inventory data in multiple formats
- **Inventory Analytics Report** - Comprehensive inventory health reports
- **Stock Movement Reports** - Detailed stock transaction reports
- **Sales Reports** - Revenue and sales analysis
- **Custom Report Generation** - Build custom reports from inventory data
- **Data Table Pagination & Sorting** - Advanced table controls

### 🎨 User Interface

#### Modern Design System
- **Shadcn UI Components** - 50+ production-ready components
- **Tailwind CSS v4** - Latest utility-first CSS framework with advanced features
- **Dark Mode Support** - Complete light/dark theme with CSS variables
- **Responsive Layouts** - Mobile-first design that works on all devices
- **Accessible Components** - WCAG-compliant UI components
- **Smooth Animations** - Motion library for polished interactions

#### Interactive Features
- **Drag & Drop** - dnd-kit integration for sortable lists
- **Advanced Tables** - TanStack Table for powerful data manipulation
- **Real-time Search** - Debounced product search with instant results
- **Modal Dialogs & Forms** - Rich form experiences with React Hook Form
- **Toast Notifications** - Sonner for beautiful, non-intrusive notifications
- **Command Palette** - Quick navigation with cmd+k interface
- **Theme Switching** - Next-themes integration for theme persistence

### 🛒 Sales Workflow

#### POS-like Experience
- **Product Search** - Debounced, real-time product search
- **Cart Management** - Add/remove/edit items in cart
- **Quantity Adjustment** - Quick quantity updates
- **Stock Availability Checks** - Real-time stock validation

#### Checkout & Calculations
- **Discount Application** - Apply discounts (fixed or percentage)
- **Tax Calculation** - Automatic tax calculation
- **Payment Methods** - Support multiple payment methods
- **Price Calculations** - Real-time total calculations

#### Sales Records & Receipts
- **Invoice Generation** - Unique invoice numbers and records
- **Customer Tracking** - Associate sales with customers or walk-in
- **Receipt Generation** - Printable receipts with QR codes
- **Sales History** - Complete sales records with timestamps
- **Inventory Decrement** - Automatic stock reduction on sale (transactional)
- **Sales Analytics** - Revenue tracking and reporting

### 📝 Activity Logging & Auditing

- **Complete Audit Trail** - Log all CRUD operations on inventory items
- **Actor Tracking** - Record which user performed each action
- **Change Tracking** - Log what was changed and previous values
- **Activity Filtering** - Search and filter activity logs
- **Bulk Actions** - Delete multiple activity log entries
- **Event Types** - Different action types (create, update, delete, adjust stock)

### 🔧 Developer Experience

#### Type Safety
- **Full TypeScript Implementation** - End-to-end type safety
- **Zod Schema Validation** - Runtime validation of data
- **Prisma Type Generation** - Auto-generated types from schema
- **Type-safe Forms** - React Hook Form with TypeScript
- **API Type Safety** - Consistent request/response types

#### Code Quality
- **ESLint Configuration** - Strict linting rules
- **Modern React Patterns** - Server and client components
- **Server Actions** - Next.js server actions for mutations
- **Optimized Bundle Size** - Code splitting and lazy loading
- **Error Handling** - Comprehensive error handling patterns

#### Developer Tools
- **Next.js DevTools** - NextTopLoader for page transitions
- **Prisma Studio** - Visual database inspector
- **Source Maps** - Full debugging capabilities
- **Hot Reload** - Turbopack-enabled fast refresh
- **Type Checking** - Strict TypeScript compilation

---

## 🧱 Tech Stack

### Core Framework

| Technology | Version | Purpose |
| --- | --- | --- |
| [Next.js](https://nextjs.org/) | 15.5.6 | React framework with App Router, server components, and optimizations |
| [React](https://react.dev/) | 19.1.0 | UI library with hooks and concurrent features |
| [TypeScript](https://www.typescriptlang.org/) | 5.0+ | Type-safe development with strict mode |

### Backend & Database

| Technology | Version | Purpose |
| --- | --- | --- |
| [Prisma](https://www.prisma.io/) | 6.18.0+ | ORM with migrations, type generation, and Prisma Studio |
| [PostgreSQL](https://www.postgresql.org/) | 16+ | Primary relational database |
| [Better Auth](https://better-auth.vercel.app/) | 1.3.34+ | Modern authentication with sessions and OAuth |
| [Prisma Accelerate](https://www.prisma.io/docs/data-platform/accelerate) | 3.0.1+ | Connection pooling and caching layer |
| [Prisma Adapter PG](https://www.prisma.io/docs/orm/reference/prisma-client-reference) | 7.1.0+ | PostgreSQL adapter for Prisma |

### UI & Styling

| Technology | Version | Purpose |
| --- | --- | --- |
| [Tailwind CSS](https://tailwindcss.com/) | 4.0+ | Utility-first CSS framework with advanced features |
| [Shadcn UI](https://ui.shadcn.com/) | 3.5.0+ | High-quality React components built on Radix UI |
| [Radix UI](https://www.radix-ui.com/) | Latest | Accessible component primitives and logic |
| [Lucide Icons](https://lucide.dev/) | 0.556.0+ | Beautiful, consistent icon library |
| [Tabler Icons](https://tabler-icons.io/) | 3.35.0+ | Additional icon library |

### Data & Forms

| Technology | Version | Purpose |
| --- | --- | --- |
| [Zod](https://zod.dev/) | 4.1.13+ | TypeScript-first schema validation |
| [React Hook Form](https://react-hook-form.com/) | 7.68.0+ | Performant form management with minimal re-renders |
| [TanStack Table](https://tanstack.com/table/) | 8.21.3+ | Headless data table component (formerly React Table) |

### Utilities & Libraries

| Technology | Purpose |
| --- | --- |
| **@dnd-kit** | Drag and drop functionality with sortable lists |
| **date-fns** | Date manipulation and formatting |
| **recharts** | React charting library for data visualization |
| **sonner** | Toast notification system |
| **motion** | Animation library for smooth interactions |
| **xlsx** | Excel/CSV file handling and export |
| **better-upload** | File upload handling |
| **@aws-sdk/client-s3** | AWS S3 integration for media storage |
| **next-themes** | Theme management with persistence |
| **nextjs-toploader** | Page transition progress indicator |
| **react-barcode** | Barcode generation for products |
| **embla-carousel** | Carousel component library |
| **cmdk** | Command menu/palette component |
| **vaul** | Drawer component |
| **react-resizable-panels** | Resizable layout panels |

---

## 📂 Project Structure

```
Velos-Inventory/
│
├── 📂 app/                              # Next.js App Router (server components)
│   ├── 📄 layout.tsx                    # Root layout with providers
│   ├── 📄 page.tsx                      # Landing page
│   ├── 📄 globals.css                   # Global styles and Tailwind config
│   │
│   ├── 📂 (auth)/                       # Authentication routes
│   │   ├── 📂 sign-in/                  # Sign in page with form
│   │   └── 📂 sign-up/                  # Sign up page with validation
│   │
│   ├── 📂 (dashboard)/                  # Protected dashboard routes
│   │   ├── 📂 dashboard/                # Main dashboard with KPI cards & charts
│   │   ├── 📂 inventory/                # Inventory management page
│   │   ├── 📂 inventory/[id]/           # Product detail page
│   │   ├── 📂 add-product/              # Add/edit product form
│   │   ├── 📂 categories/               # Category management
│   │   ├── 📂 tags/                     # Tag management
│   │   ├── 📂 sales/create/             # POS sales workflow
│   │   ├── 📂 sales/history/            # Sales records
│   │   ├── 📂 stock-alerts/             # Low stock alerts
│   │   ├── 📂 stock-adjustments/        # Stock adjustment workflow
│   │   ├── 📂 activity-log/             # Audit trail
│   │   ├── 📂 settings/                 # User settings
│   │   ├── 📂 suppliers/                # Supplier management
│   │   ├── 📂 customers/                # Customer management
│   │   ├── 📂 locations/                # Warehouse/location management
│   │   ├── 📂 purchase-orders/          # Purchase order management
│   │   ├── 📂 batches/                  # Batch/lot tracking
│   │   ├── 📂 reports/                  # Reports and analytics
│   │   └── 📂 onboarding/               # Initial setup wizard
│   │
│   ├── 📂 admin/                        # Admin-specific routes
│   │   └── 📂 users/                    # User management (admin only)
│   │
│   ├── 📂 api/                          # API routes
│   │   ├── 📂 auth/[...]/               # Better Auth API routes
│   │   ├── 📂 upload/                   # File upload endpoints
│   │   ├── 📂 products/                 # Product API routes
│   │   ├── 📂 sales/                    # Sales API routes
│   │   └── 📂 reports/                  # Report generation endpoints
│   │
│   ├── 📂 generated/                    # Auto-generated types and client
│   │   └── 📂 prisma/                   # Prisma generated client
│   │
│   └── 📂 demo/                         # Demo/onboarding pages
│
├── 📂 components/                       # Reusable React components
│   ├── 📂 auth/                         # Authentication components
│   │   ├── sign-in-form.tsx
│   │   └── sign-up-form.tsx
│   │
│   ├── 📂 inventory/                    # Inventory management components
│   │   ├── inventory-data-table.tsx     # Main data table with TanStack Table
│   │   ├── category-manager.tsx         # Category CRUD interface
│   │   ├── tag-manager.tsx              # Tag management
│   │   ├── section-cards.tsx            # KPI cards
│   │   ├── category-breakdown-chart.tsx # Recharts visualization
│   │   └── stock-level-chart.tsx        # Stock trend charts
│   │
│   ├── 📂 product/                      # Product components
│   │   ├── add-product-form.tsx         # Product creation/editing
│   │   ├── product-images.tsx           # Image upload & preview
│   │   └── product-preview.tsx          # Product information display
│   │
│   ├── 📂 sales/                        # Sales workflow components
│   │   ├── sales-form.tsx               # Sales creation
│   │   ├── product-search.tsx           # Debounced product search
│   │   ├── cart.tsx                     # Shopping cart
│   │   ├── checkout.tsx                 # Checkout with calculations
│   │   └── receipt.tsx                  # Printable receipt
│   │
│   ├── 📂 stock/                        # Stock management components
│   │   ├── stock-alert-dashboard.tsx    # Low stock alerts
│   │   ├── stock-adjustment-form.tsx    # Stock adjustment workflow
│   │   └── stock-movement-chart.tsx     # Movement history visualization
│   │
│   ├── 📂 layout/                       # Layout components
│   │   ├── app-sidebar.tsx              # Main navigation sidebar
│   │   ├── site-header.tsx              # Top navigation bar
│   │   ├── mobile-nav.tsx               # Mobile navigation
│   │   └── breadcrumbs.tsx              # Breadcrumb navigation
│   │
│   ├── 📂 activity-log/                 # Activity logging components
│   │   ├── activity-table.tsx           # Activity log display
│   │   └── activity-filters.tsx         # Filter controls
│   │
│   ├── 📂 settings/                     # Settings components
│   │   ├── settings-tabs.tsx            # Settings navigation
│   │   ├── profile-settings.tsx         # User profile
│   │   ├── notification-settings.tsx    # Notification preferences
│   │   └── security-settings.tsx        # Security options
│   │
│   ├── 📂 reports/                      # Report components
│   │   ├── inventory-analytics.tsx      # Inventory health report
│   │   └── sales-report.tsx             # Sales analysis
│   │
│   ├── 📂 suppliers/                    # Supplier components
│   │   ├── supplier-form.tsx
│   │   └── supplier-table.tsx
│   │
│   ├── 📂 customers/                    # Customer components
│   │   ├── customer-form.tsx
│   │   └── customer-table.tsx
│   │
│   ├── 📂 purchase-orders/              # Purchase order components
│   │   ├── purchase-order-form.tsx
│   │   └── purchase-order-table.tsx
│   │
│   ├── 📂 batches/                      # Batch tracking components
│   │   ├── batch-form.tsx
│   │   └── batch-table.tsx
│   │
│   ├── 📂 locations/                    # Location/warehouse components
│   │   ├── location-form.tsx
│   │   └── location-list.tsx
│   │
│   ├── 📂 ui/                           # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   ├── tabs.tsx
│   │   ├── select.tsx
│   │   ├── checkbox.tsx
│   │   ├── badge.tsx
│   │   └── ... (50+ components)
│   │
│   ├── 📂 provider/                     # Context & providers
│   │   └── theme-provider.tsx           # Theme provider with next-themes
│   │
│   └── 📂 landing/                      # Landing page components
│       ├── hero-section.tsx
│       ├── features.tsx
│       ├── footer.tsx
│       └── team.tsx
│
├── 📂 lib/                              # Utility & service libraries
│   │
│   ├── 📂 action/                       # Server actions (mutations)
│   │   ├── product.ts                   # Product CRUD operations
│   │   ├── category.ts                  # Category management
│   │   ├── tag.ts                       # Tag management
│   │   ├── sales.ts                     # Sales creation and management
│   │   ├── stock-movement.ts            # Stock adjustments and transfers
│   │   ├── supplier.ts                  # Supplier operations
│   │   ├── customer.ts                  # Customer operations
│   │   ├── location.ts                  # Location/warehouse operations
│   │   ├── batch.ts                     # Batch management
│   │   ├── purchase-order.ts            # Purchase order operations
│   │   ├── reorder.ts                   # Reorder rule management
│   │   ├── activity.ts                  # Activity log operations
│   │   ├── report.ts                    # Report generation
│   │   └── user.ts                      # User operations
│   │
│   ├── 📂 services/                     # Client-side service wrappers
│   │   ├── product-service.ts           # Product operations with toast
│   │   ├── category-service.ts          # Category operations with toast
│   │   ├── tag-service.ts               # Tag operations with toast
│   │   └── index.ts                     # Service exports
│   │
│   ├── 📂 types/                        # TypeScript type definitions
│   │   ├── product.ts                   # Product types
│   │   ├── sale.ts                      # Sale types
│   │   ├── inventory.ts                 # Inventory types
│   │   ├── api.ts                       # API response types
│   │   └── common.ts                    # Common utility types
│   │
│   ├── 📂 validations/                  # Zod validation schemas
│   │   ├── product.ts                   # Product validation
│   │   ├── sale.ts                      # Sale validation
│   │   ├── auth.ts                      # Auth validation
│   │   └── common.ts                    # Common validations
│   │
│   ├── 📂 constants/                    # Application constants
│   │   ├── config.ts                    # Configuration constants
│   │   ├── routes.ts                    # Route definitions
│   │   └── business-rules.ts            # Business logic constants
│   │
│   ├── 📂 auth/                         # Authentication utilities
│   │   ├── better-auth.ts               # Better Auth configuration
│   │   ├── session.ts                   # Session management
│   │   └── permissions.ts               # Permission checks
│   │
│   ├── 📂 logger/                       # Logging utilities
│   │   ├── activity-logger.ts           # Activity log helper
│   │   └── error-logger.ts              # Error logging
│   │
│   ├── 📂 prisma/                       # Prisma utilities
│   │   └── prisma.ts                    # Prisma client singleton
│   │
│   ├── 📂 server/                       # Server utilities
│   │   ├── action-utils.ts              # Server action helpers
│   │   ├── product-mapper.ts            # Form data parsing
│   │   ├── product-helpers.ts           # Product transaction logic
│   │   └── cache-helpers.ts             # Cache revalidation helpers
│   │
│   ├── 📄 utils.ts                      # Common utility functions (cn, etc.)
│   └── 📄 hooks.ts                      # Custom hook exports
│
├── 📂 hooks/                            # Custom React hooks
│   ├── use-inventory-filters.ts         # Inventory filtering & URL sync
│   ├── use-inventory-export.ts          # CSV/XLSX export functionality
│   ├── use-product-form.ts              # Product form state management
│   ├── use-image-upload.ts              # Image upload with preview
│   ├── use-mobile.ts                    # Mobile detection
│   ├── use-debounce.ts                  # Debounce hook
│   └── use-search.ts                    # Debounced search hook
│
├── 📂 prisma/                           # Prisma configuration
│   ├── 📄 schema.prisma                 # Database schema definition
│   ├── 📂 migrations/                   # Database migration history
│   └── 📄 seed.ts                       # Database seeding script
│
├── 📂 public/                           # Static assets
│   ├── 📂 images/                       # Image assets
│   ├── 📂 fonts/                        # Custom fonts
│   └── favicon.ico                      # Favicon
│
├── 📂 .vscode/                          # VS Code configuration
│   └── settings.json                    # Code editor settings
│
├── 📄 middleware.ts                     # Next.js middleware (auth guard)
├── 📄 next.config.ts                    # Next.js configuration
├── 📄 tsconfig.json                     # TypeScript configuration
├── 📄 tailwind.config.ts                # Tailwind CSS configuration
├── 📄 components.json                   # Shadcn UI configuration
├── 📄 eslint.config.mjs                 # ESLint configuration
├── 📄 postcss.config.mjs                # PostCSS configuration
├── 📄 .env.example                      # Environment variables template
├── 📄 .gitignore                        # Git ignore rules
├── 📄 package.json                      # Dependencies & scripts
├── 📄 package-lock.json                 # Dependency lock file
├── 📄 CONTRIBUTING.md                   # Contribution guidelines
├── 📄 CODE_OF_CONDUCT.md                # Community guidelines
├── 📄 SECURITY.md                       # Security policy
├── 📄 LICENSE                           # MIT License
└── 📄 README.md                         # This file
```

---

## ⚙️ Installation & Setup

### Prerequisites

- **Node.js** 18.x or higher (v20+ recommended)
- **npm** (v9+) or **pnpm** package manager
- **PostgreSQL** 14+ (or use a hosted service like Supabase, Railway, Vercel Postgres)
- **Git** for version control
- (Optional) **AWS Account** for S3 file uploads

### Step-by-Step Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/bry-ly/Velos-Inventory.git
cd Velos-Inventory
```

#### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

#### 3. Configure Environment Variables

Create a `.env` file in the root directory (see [Environment Variables](#-environment-variables) section):

```bash
cp .env.example .env
```

Then edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/velos_inventory?schema=public"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here-minimum-32-characters"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AWS S3 (Optional - for image uploads)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="your-bucket-name"

# Application
NODE_ENV="development"
```

#### 4. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations to create tables
npm run db:push

# (Optional) Seed database with sample data
npm run db:seed
```

#### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔧 Configuration

### Next.js Configuration (`next.config.ts`)

The project uses Next.js 15 with Turbopack for faster development:

```typescript
// Image optimization for multiple sources
images: {
  remotePatterns: [
    { hostname: 'ik.imagekit.io' },    // ImageKit CDN
    { hostname: 'lh3.googleusercontent.com' }, // Google avatars
    { hostname: 'github.com' }         // GitHub avatars
  ]
}

// Turbopack enabled for hot reloading
turbopack: { ... }
```

### TypeScript Configuration (`tsconfig.json`)

- **Strict Mode** - Enabled for maximum type safety
- **Path Aliases** - `@/*` maps to project root for cleaner imports
- **Module Resolution** - Bundler mode for modern ESM support
- **JSX** - React 19 with new JSX transform

### Tailwind CSS Configuration (`tailwind.config.ts`)

- **Tailwind CSS v4** - Latest version with advanced CSS features
- **Custom Colors** - Extended theme with application-specific colors
- **Dark Mode** - CSS variable-based theming with `next-themes`
- **Plugins** - Animations, forms, and typography plugins enabled

### Shadcn UI Configuration (`components.json`)

- **Style**: New York
- **Icon Library**: Lucide React
- **Component Registries**: Multiple registries configured
- **Color Scheme**: Automatically syncs with Tailwind theme

---

## 🗄️ Database Schema

### Core Models

#### User
```prisma
model User {
  id              String
  email           String (unique)
  name            String
  image           String?
  role            UserRole (user | admin)
  emailVerified   Boolean
  isDisabled      Boolean (soft delete)
  createdAt       DateTime
  updatedAt       DateTime
  
  // Relations
  sessions        Session[]
  accounts        Account[]
  categories      Category[]
  tags            Tag[]
  sales           Sale[]
  suppliers       Supplier[]
  customers       Customer[]
  locations       Location[]
  company         Company?
}
```

#### Product
```prisma
model Product {
  id              String
  userId          String
  categoryId      String?
  supplierId      String?
  name            String
  manufacturer    String
  model           String?
  sku             String (unique)
  barcode         String (unique)
  quantity        Int
  lowStockAt      Int?
  condition       String
  location        String?
  price           Decimal
  costPrice       Decimal?
  specs           String?
  compatibility   String?
  warrantyMonths  Int?
  imageUrl        String?
  createdAt       DateTime
  updatedAt       DateTime
  
  // Relations
  category        Category?
  supplier        Supplier?
  tags            ProductTag[]
  saleItems       SaleItem[]
  productStocks   ProductStock[]
  stockMovements  StockMovement[]
  batches         Batch[]
  reorderRule     ReorderRule?
}
```

#### Category
```prisma
model Category {
  id        String
  userId    String
  name      String
  createdAt DateTime
  updatedAt DateTime
  
  products  Product[]
  user      User
}
```

#### Tag
```prisma
model Tag {
  id        String
  userId    String
  name      String
  createdAt DateTime
  updatedAt DateTime
  
  products  ProductTag[]
  user      User
}
```

#### Sale & SaleItem
```prisma
model Sale {
  id              String
  userId          String
  customerId      String?
  invoiceNumber   String (unique)
  customer        String?
  subtotal        Decimal
  discount        Decimal
  tax             Decimal
  totalAmount     Decimal
  status          String
  paymentMethod   String?
  createdAt       DateTime
  updatedAt       DateTime
  
  items           SaleItem[]
  user            User
  customerRecord  Customer?
}

model SaleItem {
  id          String
  saleId      String
  productId   String?
  productName String
  quantity    Int
  unitPrice   Decimal
  costPrice   Decimal
  discount    Decimal
  totalPrice  Decimal
  
  sale        Sale
  product     Product?
}
```

#### Stock Management Models
```prisma
model ProductStock {
  id         String
  productId  String
  locationId String
  quantity   Int
  
  product    Product
  location   Location
}

model StockMovement {
  id            String
  userId        String
  productId     String
  locationId    String?
  batchId       String?
  type          String    // 'in' | 'out' | 'adjustment' | 'transfer'
  quantity      Int
  reference     String?   // PO number, Sale ID
  referenceType String?   // 'purchase_order' | 'sale' | 'adjustment'
  notes         String?
  createdAt     DateTime
}

model Batch {
  id                  String
  userId              String
  productId           String
  batchNumber         String
  quantity            Int
  costPrice           Decimal?
  expiryDate          DateTime?
  manufacturingDate   DateTime?
  purchaseOrderId     String?
}
```

#### Supplier & Customer
```prisma
model Supplier {
  id            String
  userId        String
  name          String
  email         String?
  phone         String?
  address       String?
  contactPerson String?
  notes         String?
}

model Customer {
  id        String
  userId    String
  name      String
  email     String?
  phone     String?
  address   String?
  notes     String?
}
```

#### Location & Warehouse
```prisma
model Location {
  id        String
  userId    String
  name      String
  address   String?
  isDefault Boolean
  notes     String?
}
```

#### Purchase Orders
```prisma
model PurchaseOrder {
  id            String
  userId        String
  supplierId    String
  orderNumber   String (unique)
  status        String    // draft | ordered | partial | received | cancelled
  orderDate     DateTime
  expectedDate  DateTime?
  receivedDate  DateTime?
  subtotal      Decimal
  tax           Decimal
  shippingCost  Decimal
  totalAmount   Decimal
  
  supplier      Supplier
  items         PurchaseOrderItem[]
  batches       Batch[]
}
```

#### Reorder Rules
```prisma
model ReorderRule {
  id              String
  userId          String
  productId       String (unique)
  reorderPoint    Int
  reorderQuantity Int
  supplierId      String?
  isActive        Boolean
  
  supplier        Supplier?
  product         Product
}
```

#### Activity Logging
```prisma
model ActivityLog {
  id         String
  userId     String
  actorId    String?
  entityType String    // 'product' | 'sale' | 'category' | etc.
  entityId   String?
  action     String    // 'create' | 'update' | 'delete' | 'adjust_stock'
  changes    Json?     // Detailed change object
  note       String?
  createdAt  DateTime
  
  actor      User?
  owner      User
}
```

### Database Indexes

Optimized indexes for common queries:

```prisma
// Product
@@index([userId, categoryId])
@@index([manufacturer])
@@index([createdAt])
@@index([supplierId])
@@index([barcode])

// Stock & Sales
@@index([userId, createdAt])
@@index([productId])
@@index([locationId])
@@index([referenceType, reference])

// Activity
@@index([userId, createdAt])
@@index([entityType, entityId])
```

---

## 💻 Development Commands

### Development Server

```bash
# Start development server with Turbopack (fast refresh)
npm run dev

# Server runs at http://localhost:3000
```

### Building & Production

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Database

```bash
# Generate Prisma Client
npm run db:generate

# Create/run migrations interactively
npm run db:migrate

# Push schema changes (without migrations)
npm run db:push

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (GUI for database)
npx prisma studio

# View migrations
npx prisma migrate status
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Format code with Prettier (configured in ESLint)
npx eslint . --fix
```

### Type Checking

```bash
# TypeScript check (run by next build)
npx tsc --noEmit
```

---

## 🔐 Environment Variables

### Required Variables

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# Better Auth
BETTER_AUTH_SECRET="minimum-32-character-secret-key"
BETTER_AUTH_URL="http://localhost:3000"  # Change to production URL
```

### Optional Variables

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# AWS S3 (for image uploads)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="your-bucket-name"

# Application Settings
NODE_ENV="development"  # or "production"
```

### Environment Setup by Platform

#### Supabase
```env
DATABASE_URL="postgresql://postgres:password@db.supabaseproject.ref.supabase.co:5432/postgres?schema=public"
```

#### Railway
```env
DATABASE_URL="postgresql://user:password@railway.internal:5432/railway"
```

#### Vercel Postgres
```env
DATABASE_URL="postgres://user:password@ep-name.region.postgres.vercel-storage.com/verceldb"
```

#### Local PostgreSQL
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/velos_inventory"
```

---

## 🎯 Features Deep Dive

### Dashboard & Analytics

The dashboard provides a comprehensive view of your inventory health:

**KPI Cards:**
- Total Products: Count of all products
- Total Stock Value: Sum of (quantity × price)
- Low Stock Items: Count of products below threshold
- Monthly Sales: Revenue from current month

**Charts & Visualizations:**
- **Category Breakdown** - Pie/bar chart showing distribution by category
- **Stock Level Trends** - Line chart showing stock over time
- **Top Products** - Best-selling or highest-value items
- **Manufacturer Distribution** - Product breakdown by manufacturer

**Features:**
- URL-synced date range filters
- Click-through from charts to filtered inventory
- Real-time metric updates
- Export data to CSV/Excel

```typescript
// Example: Dashboard with URL-synced date range
const [dateRange, setDateRange] = useState<DateRange>(() => {
  const params = new URLSearchParams(window.location.search);
  return {
    from: params.get('from') ? new Date(params.get('from')!) : undefined,
    to: params.get('to') ? new Date(params.get('to')!) : undefined
  };
});
```

### Inventory Operations

#### InventoryDataTable

The main table for browsing and managing products with advanced features:

**Features:**
- **Sorting** - Click column headers to sort
- **Filtering** - Advanced filters for category, condition, low stock, etc.
- **Column Visibility** - Show/hide columns with persistence
- **Pagination** - Navigate through large datasets
- **Inline Actions** - Quick edit/delete/adjust stock from table
- **Bulk Operations** - Select multiple items for batch actions
- **Search** - Full-text search across product name, SKU, manufacturer
- **Export** - Download filtered data as CSV or Excel
- **URL Sync** - Filters and sorting persist in URL

```typescript
// Example: Add product to InventoryDataTable
const [{ pageIndex, pageSize }, setPagination] = useState({
  pageIndex: 0,
  pageSize: 20,
});

const { data, isPending } = useQuery({
  queryKey: ['inventory', pageIndex, pageSize, filters],
  queryFn: () => getProducts({ skip: pageIndex * pageSize, take: pageSize })
});
```

#### Product Management

**Add/Edit Products:**
- Rich form with React Hook Form + Zod validation
- Image upload with preview
- Auto-fill SKU from barcode
- Product specifications and compatibility
- Supplier and warranty information
- Category and tag selection
- Cost and selling price tracking

**Product Details:**
- Full product information display
- Stock history timeline
- Related sales transactions
- Batch/lot information
- Reorder rules
- Activity log for product changes

```typescript
// Example: Product Form with Zod validation
const productSchema = z.object({
  name: z.string().min(1, "Product name required"),
  manufacturer: z.string().min(1),
  sku: z.string().optional(),
  quantity: z.coerce.number().min(0),
  price: z.coerce.number().min(0),
  categoryId: z.string().optional(),
  imageFile: z.instanceof(File).optional()
});
```

#### Category & Tag Management

**Category Manager:**
- Create/edit/delete categories
- View product counts per category
- Collapse/expand product previews
- Quick search across categories
- Automatic inventory aggregation

**Tag Manager:**
- Create/edit/delete tags
- Assign multiple tags to products
- View products by tag
- Tag-based filtering in inventory

### Stock Monitoring

#### Low Stock Alerts

**Alert Dashboard:**
- List of products below low-stock threshold
- Quantity on hand vs. low-stock threshold
- Days until estimated stockout
- Quick reorder actions
- Filter by category, supplier

**Automatic Alerts:**
- Email notifications (optional)
- In-app notifications
- Dashboard highlighted cards
- Activity log tracking

#### Stock Adjustment Workflow

**Stock Adjustment Form:**
- Select product by name, SKU, or barcode
- View current quantity
- Choose adjustment type: Add, Remove, or Set
- Enter quantity and notes
- Optional reference number (e.g., PO number)

**Validation:**
- Prevent negative inventory (for Remove type)
- Verify product exists
- Log all adjustments with actor information
- Automatic cache revalidation

```typescript
// Example: Stock adjustment server action
export async function adjustStock(
  productId: string,
  quantity: number,
  type: 'add' | 'remove' | 'set'
): Promise<ActionResult> {
  // Validate user auth
  const user = await requireAuthedUser();
  
  // Get current product
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });
  
  // Calculate new quantity
  const newQuantity = type === 'set' 
    ? quantity 
    : product.quantity + (type === 'add' ? quantity : -quantity);
  
  // Prevent negative inventory
  if (newQuantity < 0) {
    return failureResult("Cannot remove more than available stock");
  }
  
  // Update with transaction
  const updated = await prisma.product.update({
    where: { id: productId },
    data: { quantity: newQuantity }
  });
  
  // Log activity
  await logActivity({
    userId: user.id,
    entityType: 'product',
    entityId: productId,
    action: 'adjust_stock',
    changes: { 
      from: product.quantity, 
      to: newQuantity,
      type,
      notes: '' 
    }
  });
  
  revalidatePath('/inventory');
  return successResult("Stock adjusted successfully");
}
```

### Sales Workflow

#### POS-like Experience

**Product Search:**
- Debounced real-time search
- Search by name, SKU, or barcode
- Instant results with price display
- Out-of-stock indication
- Stock availability checks

**Shopping Cart:**
- Add products with quantity
- Edit quantities inline
- Remove items
- View running subtotal
- See unit and line item prices

#### Checkout & Calculations

**Discount Application:**
- Fixed amount discounts (e.g., $10 off)
- Percentage discounts (e.g., 10% off)
- Display discount amount
- Recalculate totals

**Tax Calculation:**
- Configurable tax rate per location
- Automatic calculation
- Display tax amount
- Include in total

**Payment Methods:**
- Cash
- Credit/Debit Card
- Check
- Other (configurable)

**Calculations:**
```
Subtotal = Sum of (quantity × unitPrice) for all items
Discount = Fixed amount or (Subtotal × discountPercent)
Subtaxable = Subtotal - Discount
Tax = Subtaxable × taxRate
Total = Subtaxable + Tax
```

#### Sales Records & Receipts

**Receipt Generation:**
- Unique invoice numbers
- Customer information (optional)
- Item list with prices
- Subtotal, discount, tax, total
- Payment method
- Date/time and cashier name
- Printable format
- QR code for reference

**Sales History:**
- Browse past sales
- Filter by date range, customer, payment method
- View receipt details
- Calculate revenue metrics
- Export sales data

**Inventory Decrement:**
- Automatic stock reduction on sale
- Transactional consistency
- Stock movement logged
- Prevents overselling

```typescript
// Example: Create sale server action
export async function createSale(
  items: SaleItemInput[],
  discount: number,
  tax: number,
  paymentMethod: string,
  customerId?: string
): Promise<ActionResult> {
  return await prisma.$transaction(async (tx) => {
    // Create sale record
    const sale = await tx.sale.create({
      data: {
        userId,
        customerId,
        invoiceNumber: generateInvoiceNumber(),
        subtotal: calculateSubtotal(items),
        discount,
        tax,
        totalAmount: calculateTotal(items, discount, tax),
        paymentMethod,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            costPrice: item.costPrice
          }))
        }
      }
    });
    
    // Decrement stock for each item
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { 
          quantity: { decrement: item.quantity }
        }
      });
      
      // Log stock movement
      await tx.stockMovement.create({
        data: {
          userId,
          productId: item.productId,
          type: 'out',
          quantity: -item.quantity,
          referenceType: 'sale',
          reference: sale.id
        }
      });
    }
    
    return successResult("Sale created successfully", { saleId: sale.id });
  });
}
```

### Reporting & Auditing

#### Inventory Analytics Report

**Metrics:**
- Total inventory value (sum of quantity × cost price)
- Average inventory age
- Inventory turnover ratio
- Stock-out incidents this month
- Slow-moving items (not sold in 90 days)
- Fast-moving items (high sales volume)

**Breakdowns:**
- By category
- By manufacturer
- By condition (new, used, refurbished)
- By location/warehouse
- By supplier

**Trends:**
- Stock level changes over time
- Sales volume trends
- Inventory value trends

#### Activity Logs

**Log Entry Details:**
- Timestamp
- User/actor name
- Entity type (product, sale, category, etc.)
- Action (create, update, delete, adjust_stock)
- Change details (before/after values)
- Notes/comments

**Features:**
- Filter by date range, entity type, action
- Search by product name, user
- Sort by date, action, entity
- Bulk delete old entries
- Export logs to CSV

**Business Rules:**
- All product changes logged
- All stock adjustments logged
- All sales transactions logged
- Cannot delete log entries (soft delete only)
- Automatic cleanup of old entries (configurable)

### Authentication & Authorization

#### Better Auth Integration

**Supported Methods:**
- Email/password registration and login
- Google OAuth sign-in
- Session management
- Automatic token refresh
- Secure password hashing

**Session Features:**
- IP address tracking
- User agent tracking
- Session expiration
- Multi-device session management
- Logout all devices option

**Roles & Permissions:**
- User role (standard)
- Admin role (management)
- Permission checks on protected routes
- Activity log tracking of privileged actions

```typescript
// Example: Better Auth configuration
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }
  },
  
  plugins: [
    sessionActivity({
      storeIP: true,
      storeUserAgent: true
    })
  ]
});
```

### Settings & Preferences

**User Profile:**
- Name
- Email
- Profile picture
- Bio/about

**Notification Preferences:**
- Email notifications for low stock
- In-app toast notifications
- Stock alert frequency
- Daily/weekly digest option

**Security Settings:**
- Change password
- View active sessions
- Logout from other devices
- Two-factor authentication (optional)

---

## 📡 API Endpoint Patterns

### Convention

The API follows RESTful conventions with Next.js App Router:

- `GET /api/resource` - List resources (query params for filters/pagination)
- `GET /api/resource/[id]` - Get single resource
- `POST /api/resource` - Create resource
- `PATCH /api/resource/[id]` - Update resource
- `DELETE /api/resource/[id]` - Delete resource

### Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "product-123",
    "name": "Product Name",
    "quantity": 50
  },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": {
    "field": ["Error detail"]
  }
}
```

### Validation

All endpoints validate input using Zod schemas:

```typescript
// Example: Create product validation
const createProductSchema = z.object({
  name: z.string().min(1, "Product name required").max(255),
  manufacturer: z.string().min(1).max(255),
  sku: z.string().optional().refine(
    (val) => !val || /^[A-Z0-9-]+$/.test(val),
    "SKU must contain only uppercase letters, numbers, and hyphens"
  ),
  quantity: z.coerce.number().int().min(0),
  price: z.coerce.number().positive("Price must be greater than 0"),
  categoryId: z.string().optional()
});
```

### Authentication

Protected endpoints require valid session cookie:

```typescript
export async function getProducts(request: Request) {
  const session = await getSession(request);
  
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Fetch user-scoped products
  const products = await prisma.product.findMany({
    where: { userId: session.userId }
  });
  
  return Response.json(products);
}
```

### Error Handling

Consistent error handling across API:

```typescript
type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string; details?: Record<string, string[]> }

function successResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

function errorResponse(error: string, details?: Record<string, string[]>): ApiResponse<never> {
  return { success: false, error, details };
}
```

---

## 💼 Business Rules

### Inventory Rules

1. **Stock Constraints:**
   - Stock quantity cannot be negative
   - Minimum stock threshold prevents sales of low-stock items (optional enforcement)
   - Stock adjustments require notes for audit trail

2. **Low Stock Alerts:**
   - Alert triggered when quantity < `lowStockAt` threshold
   - Alerts persist until stock is replenished above threshold
   - Configurable alert frequency

3. **Product Uniqueness:**
   - SKU must be unique per user
   - Barcode must be unique per user
   - Category and tag names must be unique per user

### Sales Rules

1. **Transaction Constraints:**
   - Sale must include at least one item
   - Item quantity must be > 0
   - Sale price must be > 0 (or >= 0 with discount)
   - Discount cannot exceed subtotal

2. **Stock Depletion:**
   - Sales are transactional - all items or nothing
   - Stock is decremented immediately upon sale creation
   - Cannot sell items not in stock (strict enforcement)
   - Stock movement created for each sale item

3. **Pricing:**
   - Unit price on sale is current product price
   - Cost price is tracked for profit calculation
   - Discount applied before tax
   - Tax calculated on (subtotal - discount)

4. **Invoice Numbers:**
   - Must be unique
   - Auto-generated format: `INV-YYYY-MM-DD-XXXXX`
   - Timezone-aware for date component

### Stock Adjustment Rules

1. **Adjustment Types:**
   - **Add**: Increase stock (e.g., new purchase received)
   - **Remove**: Decrease stock (e.g., damaged, lost)
   - **Set**: Set to specific quantity (e.g., physical count correction)

2. **Audit Trail:**
   - All adjustments logged to ActivityLog
   - Reason/notes field required
   - Previous and new quantities recorded
   - Actor (user) tracked

3. **Location-aware Stock:**
   - Stock can be tracked per location
   - Transfers between locations logged
   - Default location required for products

### Batch & Lot Rules

1. **Batch Tracking:**
   - Batch number must be unique per product
   - Batch includes expiry date (optional)
   - Manufacturing date tracked
   - Cost per unit can vary by batch

2. **Expiry Management:**
   - Batches with past expiry dates flagged
   - Cannot sell expired batches (system warning)
   - FIFO (First In, First Out) recommended

### Supplier & Reorder Rules

1. **Reorder Automation:**
   - Reorder point triggers purchase suggestion
   - Reorder quantity suggests order amount
   - Preferred supplier set for each product
   - Reorder rules can be enabled/disabled

2. **Purchase Orders:**
   - PO number must be unique
   - PO states: draft → ordered → partial → received → cancelled
   - Can only delete draft POs
   - Received quantity tracked per item

### User & Permission Rules

1. **Data Isolation:**
   - Each user only sees their own inventory
   - Categories, tags, products scoped to user
   - Activity logs filtered by user

2. **Admin Privileges:**
   - Can view all users' activity
   - Can manage user accounts (future)
   - Can access system reports

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in `.next` directory.

### Environment Configuration

Ensure all required environment variables are set in production:

```env
# Critical
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="<strong-32+-character-key>"
BETTER_AUTH_URL="https://yourdomain.com"

# Optional but recommended
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
```

### Database Migration

Before deploying, run migrations on production database:

```bash
npx prisma migrate deploy
```

Or use manual deployment:

```bash
npx prisma migrate resolve --applied <migration_name>
```

### Deployment Platforms

#### Vercel (Recommended for Next.js)

```bash
npm i -g vercel
vercel
```

Automatic deployment from Git. Supports serverless functions and edge functions.

#### Railway

1. Create Railway project
2. Connect GitHub repository
3. Add PostgreSQL database
4. Configure environment variables
5. Deploy

#### AWS Amplify

```bash
amplify init
amplify add hosting
amplify publish
```

#### Netlify

```bash
npm i -g netlify-cli
netlify deploy
```

#### Self-hosted (VPS)

```bash
# On your server
git clone <repo>
npm install
npm run build

# Run with PM2 or systemd
pm2 start npm --name "inventory" -- start
```

### Performance Optimization

- **Enable Vercel Analytics** for performance monitoring
- **Configure Prisma Accelerate** for connection pooling
- **Use S3/CloudFront** for image CDN
- **Enable Next.js Image Optimization** 
- **Configure Redis** for session caching (optional)

### Health Checks

Deploy a health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: 'ok', timestamp: new Date() });
  } catch (error) {
    return Response.json({ status: 'error' }, { status: 503 });
  }
}
```

---

## 📝 Code Conventions

### Error Handling

**Server Actions:**
```typescript
import { successResult, failureResult, ActionResult } from '@/lib/server/action-utils';

export async function myAction(data: unknown): Promise<ActionResult> {
  try {
    const user = await requireAuthedUser();
    
    // Validate input
    const parsed = mySchema.parse(data);
    
    // Perform action
    const result = await prisma.resource.create({ data: parsed });
    
    // Invalidate cache
    revalidatePath('/path');
    
    return successResult("Success message", result);
  } catch (error) {
    if (error instanceof ZodError) {
      return failureResult("Validation failed", error.flatten().fieldErrors);
    }
    
    console.error('[myAction] Error:', error);
    return failureResult("An unexpected error occurred");
  }
}
```

**Client Components:**
```typescript
// Use toast notifications for user feedback
import { toast } from 'sonner';

async function handleAction() {
  try {
    const result = await myAction(data);
    
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    
    toast.success(result.message);
  } catch (error) {
    console.error('Error:', error);
    toast.error("An unexpected error occurred");
  }
}
```

### Validation Approach

**Use Zod for all validation:**

```typescript
// lib/validations/product.ts
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string()
    .min(1, "Name required")
    .max(255, "Name too long"),
  
  quantity: z.coerce.number()
    .int("Must be whole number")
    .min(0, "Cannot be negative"),
  
  price: z.coerce.number()
    .positive("Must be greater than 0")
    .refine(
      val => val.toFixed(2).length <= 12,
      "Invalid price format"
    ),
  
  categoryId: z.string().uuid().optional()
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
```

**Use in components:**

```typescript
function ProductForm() {
  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: { quantity: 0, price: 0 }
  });
  
  async function onSubmit(data: CreateProductInput) {
    const result = await createProduct(data);
    // Handle result...
  }
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </form>
  );
}
```

### Prisma Best Practices

**1. Always use transactions for multi-step operations:**

```typescript
const result = await prisma.$transaction(async (tx) => {
  // All queries here are atomic
  const product = await tx.product.update({ ... });
  const movement = await tx.stockMovement.create({ ... });
  return { product, movement };
});
```

**2. Select only needed fields:**

```typescript
// Good - select only fields you need
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    quantity: true,
    category: { select: { name: true } }
  }
});

// Avoid - selects all fields including large JSON
const products = await prisma.product.findMany();
```

**3. Use indexes for frequently queried fields:**

```prisma
model Product {
  @@index([userId, categoryId])
  @@index([createdAt])
  @@index([barcode])
}
```

**4. Handle null values explicitly:**

```typescript
const product = await prisma.product.findUnique({
  where: { id: productId }
});

if (!product) {
  return failureResult("Product not found");
}

// Now product is guaranteed non-null
console.log(product.name);
```

### Type Safety

**Leverage TypeScript generics:**

```typescript
// Reusable list component
interface ListProps<T> {
  items: T[];
  onSelect: (item: T) => void;
  renderItem: (item: T) => React.ReactNode;
}

function List<T extends { id: string }>({ 
  items, 
  onSelect, 
  renderItem 
}: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id} onClick={() => onSelect(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}
```

**Use branded types for security:**

```typescript
type UserId = string & { readonly __brand: "UserId" };

function createUserId(id: string): UserId {
  return id as UserId;
}

async function getProductsByUser(userId: UserId) {
  // Type system ensures only properly branded IDs accepted
  return await prisma.product.findMany({
    where: { userId }
  });
}
```

### Component Organization

**Separate concerns:**

```typescript
// ✓ Good: Separate form logic, display, and server calls
// components/product/product-form.tsx
export function ProductForm({ onSuccess }: { onSuccess?: () => void }) {
  const form = useForm<CreateProductInput>({ ... });
  
  async function onSubmit(data: CreateProductInput) {
    const result = await createProduct(data);
    if (result.success) {
      toast.success(result.message);
      onSuccess?.();
    }
  }
  
  return <Form> ... </Form>;
}

// pages/add-product/page.tsx
export default function AddProductPage() {
  const router = useRouter();
  
  return (
    <ProductForm 
      onSuccess={() => router.push('/inventory')}
    />
  );
}

// ✗ Avoid: Mixing concerns
export function BadProductForm() {
  // Direct server actions, routing, form state all mixed
}
```

### Naming Conventions

- **Components** - PascalCase (e.g., `ProductForm`, `InventoryDataTable`)
- **Functions** - camelCase (e.g., `createProduct`, `adjustStock`)
- **Constants** - UPPER_SNAKE_CASE (e.g., `MAX_UPLOAD_SIZE`)
- **Types** - PascalCase (e.g., `Product`, `CreateProductInput`)
- **Files** - kebab-case (e.g., `product-form.tsx`, `stock-movement.ts`)
- **Folders** - kebab-case (e.g., `lib/actions`, `components/inventory`)

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit with conventional messages: `git commit -m 'feat: add amazing feature'`
5. Push to your fork: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Development Workflow

```bash
# Clone and install
git clone https://github.com/yourusername/Velos-Inventory.git
cd Velos-Inventory
npm install

# Create feature branch
git checkout -b feature/your-feature

# Start development server
npm run dev

# Make changes, test, and commit
git add .
git commit -m "feat: your feature description"

# Push and create PR
git push origin feature/your-feature
```

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Bry-Ly**

- GitHub: [@bry-ly](https://github.com/bry-ly)
- Repository: [Velos-Inventory](https://github.com/bry-ly/Velos-Inventory)

---

## 🙏 Acknowledgments

We're grateful to these amazing projects and communities:

- [Next.js](https://nextjs.org/) - The React framework for production
- [Prisma](https://www.prisma.io/) - Next-generation ORM with type safety
- [Better Auth](https://better-auth.vercel.app/) - Modern authentication library
- [Shadcn UI](https://ui.shadcn.com/) - Beautiful, accessible React components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [React Hook Form](https://react-hook-form.com/) - Performant form management
- [TanStack](https://tanstack.com/) - Data utilities and components
- [Vercel](https://vercel.com/) - Hosting and deployment platform
- All open-source contributors

---

<div align="center">

**Built with ❤️ using modern web technologies**

⭐ Star this repo if you find it helpful!

[Report a Bug](https://github.com/bry-ly/Velos-Inventory/issues/new?labels=bug) • [Request a Feature](https://github.com/bry-ly/Velos-Inventory/issues/new?labels=enhancement) • [Discuss Ideas](https://github.com/bry-ly/Velos-Inventory/discussions)

</div>
