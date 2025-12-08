# 📦 Velos Inventory

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.18.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)

**A modern, full-featured velos inventory management system for all kinds of items**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Project Structure](#-project-structure) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Database Schema](#-database-schema)
- [Key Components](#-key-components)
- [API Routes](#-api-routes)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Velos Inventory** is a comprehensive, production-ready inventory management solution designed for managing any type of inventory. Built with modern web technologies, it provides a robust, scalable, and user-friendly platform for tracking inventory, managing products, monitoring stock levels, and maintaining detailed audit logs.
---
<img width="1828" height="903" alt="techparts-dark" src="https://github.com/user-attachments/assets/7bc25164-b4ae-4efa-849a-42f2350a20ad" />

---
### Key Highlights


- 🔐 **Secure Authentication** - Built-in authentication system using Better Auth
- 📊 **Real-time Dashboard** - Interactive charts and analytics for inventory insights
- 🎨 **Modern UI/UX** - Beautiful, responsive interface built with Shadcn UI and Tailwind CSS
- 🚀 **High Performance** - Optimized with Next.js 15 App Router and Turbopack
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- 🔍 **Advanced Filtering** - Powerful search and filter capabilities
- 📈 **Analytics & Reports** - Category breakdowns, manufacturer insights, and stock movement tracking
- 🏷️ **Tagging System** - Flexible categorization with tags and custom categories
- 📝 **Activity Logging** - Complete audit trail of all system changes

---

## 🚀 Features

### 🔐 Authentication & Security

- **Better Auth Integration** - Secure session management and authentication
- **Protected Routes** - Middleware-based route protection
- **User Management** - Multi-user support with user profiles
- **Session Tracking** - IP address and user agent logging

### 📦 Inventory Management

- **Product Management**

  - Create, update, and delete products
  - SKU tracking and management
  - Manufacturer and model information
  - Product specifications and compatibility notes
  - Image upload and management
  - Condition tracking (new, used, refurbished)
  - Location tracking
  - Warranty information

- **Stock Management**

  - Real-time quantity tracking
  - Low stock alerts and thresholds
  - Stock movement history
  - Batch tracking support
  - Stock adjustment capabilities

- **Category & Tagging**
  - Custom category creation
  - Hierarchical category structure
  - Flexible tagging system
  - Category-based filtering and analytics

- **Saved Filters**
  - Save complex filter combinations as presets
  - Quick access to frequently used filters
  - Set default filter that auto-applies on page load
  - User-scoped filter management
  - Persistent filter storage

### 📊 Analytics & Reporting

- **Dashboard Analytics**

  - Category breakdown charts
  - Manufacturer distribution
  - Stock level visualizations
  - Interactive data tables
  - Real-time statistics

- **Data Export**
  - Excel/CSV export capabilities
  - Custom report generation
  - Data table pagination and sorting

### 🎨 User Interface

- **Modern Design System**

  - Shadcn UI components
  - Tailwind CSS styling
  - Dark mode support
  - Responsive layouts
  - Accessible components

- **Interactive Components**
  - Drag-and-drop functionality (dnd-kit)
  - Sortable tables (TanStack Table)
  - Advanced filtering
  - Real-time search
  - Modal dialogs and forms

### 🔧 Developer Experience

- **Type Safety**

  - Full TypeScript implementation
  - Zod schema validation
  - Prisma type generation
  - End-to-end type safety

- **Code Quality**
  - ESLint configuration
  - Modern React patterns
  - Server and client components
  - Optimized bundle size

---

## 🧱 Tech Stack

### Core Framework

| Technology                                                                        | Version | Purpose                         |
| --------------------------------------------------------------------------------- | ------- | ------------------------------- |
| ![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black?logo=next.js)        | 15.5.6  | React framework with App Router |
| ![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)             | 19.1.0  | UI library                      |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript) | 5.0     | Type-safe development           |

### Backend & Database

| Technology                                                                       | Version | Purpose                  |
| -------------------------------------------------------------------------------- | ------- | ------------------------ |
| ![Prisma](https://img.shields.io/badge/Prisma-6.18.0-2D3748?logo=prisma)         | 6.18.0  | ORM and database toolkit |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql) | 16      | Primary database         |
| ![Better Auth](https://img.shields.io/badge/Better_Auth-1.3.34-000000)           | 1.3.34  | Authentication system    |

### UI & Styling

| Technology                                                                              | Version | Purpose                         |
| --------------------------------------------------------------------------------------- | ------- | ------------------------------- |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css) | 4.0     | Utility-first CSS framework     |
| ![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-3.5.0-000000)                       | 3.5.0   | Component library               |
| ![Radix UI](https://img.shields.io/badge/Radix_UI-Latest-161618)                        | Latest  | Accessible component primitives |
| ![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-0.548.0-FF6B6B)               | 0.548.0 | Icon library                    |

### Data & Forms

| Technology                                                                     | Version | Purpose              |
| ------------------------------------------------------------------------------ | ------- | -------------------- |
| ![Zod](https://img.shields.io/badge/Zod-4.1.12-3E63DD)                         | 4.1.12  | Schema validation    |
| ![React Hook Form](https://img.shields.io/badge/React_Hook_Form-7.66.0-EC5990) | 7.66.0  | Form management      |
| ![TanStack Table](https://img.shields.io/badge/TanStack_Table-8.21.3-FF4154)   | 8.21.3  | Data table component |

### Additional Libraries

- **@dnd-kit** - Drag and drop functionality
- **date-fns** - Date manipulation
- **recharts** - Charting library
- **sonner** - Toast notifications
- **motion** - Animation library
- **xlsx** - Excel file handling
- **better-upload** - File upload handling
- **@aws-sdk/client-s3** - AWS S3 integration

---

## 📂 Project Structure

```
Tech-Parts-Inve/
├── 📁 app/                          # Next.js App Router
│   ├── 📄 layout.tsx                # Root layout with theme provider
│   ├── 📄 page.tsx                  # Landing page
│   ├── 📄 globals.css               # Global styles and Tailwind config
│   ├── 📁 (auth)/                   # Authentication routes
│   │   ├── sign-in/                 # Sign in page
│   │   └── sign-up/                 # Sign up page
│   ├── 📁 dashboard/                # Protected dashboard routes
│   │   └── page.tsx                 # Main dashboard
│   ├── 📁 inventory/                # Inventory management
│   │   └── page.tsx                 # Inventory page
│   ├── 📁 add-product/              # Add product page
│   ├── 📁 settings/                 # User settings
│   ├── 📁 organization/             # Organization management
│   └── 📁 api/                      # API routes
│
├── 📁 components/                   # React components
│   ├── 📁 auth/                     # Authentication components
│   │   ├── sign-in-form.tsx
│   │   └── sign-up-form.tsx
│   ├── 📁 inventory/                # Inventory components
│   │   ├── inventory-data-table.tsx
│   │   ├── category-manager.tsx
│   │   ├── section-cards.tsx
│   │   └── chart components
│   ├── 📁 landing/                  # Landing page components
│   │   ├── hero-section.tsx
│   │   ├── features.tsx
│   │   ├── footer.tsx
│   │   └── team.tsx
│   ├── 📁 layout/                   # Layout components
│   │   ├── app-sidebar.tsx
│   │   ├── site-header.tsx
│   │   └── navigation components
│   ├── 📁 product/                  # Product components
│   │   └── add-product-form.tsx
│   ├── 📁 settings/                 # Settings components
│   │   ├── settings-tabs.tsx
│   │   ├── profile-settings.tsx
│   │   └── security-settings.tsx
│   ├── 📁 ui/                       # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   └── ... (50+ components)
│   └── 📁 provider/                  # Context providers
│       └── theme-provider.tsx
│
├── 📁 prisma/                       # Prisma configuration
│   ├── 📄 schema.prisma             # Database schema
│   ├── 📁 migrations/               # Database migrations
│   └── 📄 seed.ts                   # Database seeding script
│
├── 📁 lib/                          # Utility libraries
│   ├── 📁 auth/                     # Authentication utilities
│   ├── 📁 utils/                    # Helper functions
│   └── 📄 prisma.ts                 # Prisma client instance
│
├── 📁 hooks/                        # Custom React hooks
│
├── 📄 middleware.ts                 # Next.js middleware for route protection
├── 📄 next.config.ts                # Next.js configuration
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 components.json               # Shadcn UI configuration
├── 📄 package.json                  # Dependencies and scripts
└── 📄 README.md                     # This file
```

---

## ⚙️ Installation

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **PostgreSQL** database (or SQLite for development)
- **Git** for version control

### Step-by-Step Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/bry-ly/tech-parts-inventory-system.git
cd tech-parts-inventory-system
```

#### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

#### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tech_parts_inventory?schema=public"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here-minimum-32-characters"
BETTER_AUTH_URL="http://localhost:3000"

# AWS S3 (Optional - for image uploads)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="your-bucket-name"

# ImageKit (Optional - for image CDN)
IMAGEKIT_PUBLIC_KEY="your-imagekit-public-key"
IMAGEKIT_PRIVATE_KEY="your-imagekit-private-key"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your-id"

# Application
NODE_ENV="development"
```

#### 4. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed the database with sample data
npm run db:seed
```

#### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

---

## 🔧 Configuration

### Next.js Configuration

The project uses Next.js 15 with Turbopack for faster development builds. Configuration is in `next.config.ts`:

- **Image Optimization** - Configured for ImageKit, Tailus, and GitHub avatars
- **Turbopack** - Enabled for faster builds and hot reloading

### TypeScript Configuration

- **Strict Mode** - Enabled for type safety
- **Path Aliases** - `@/*` maps to project root
- **Module Resolution** - Bundler mode for modern ESM support

### Tailwind CSS

- **Tailwind CSS v4** - Latest version with new features
- **Custom Theme** - Extended with custom colors, shadows, and spacing
- **Dark Mode** - Full support with CSS variables

### Shadcn UI

- **Style**: New York
- **Icon Library**: Lucide React
- **Component Registry**: Multiple registries configured (Better Upload, Tailark, Kibo UI, Blocks)

---

## 🗄️ Database Schema

### Core Models

#### User

- User authentication and profile information
- Relationships with sessions, accounts, categories, tags, and activity logs

#### Product

- Complete product information including:
  - Basic info (name, SKU, manufacturer, model)
  - Inventory (quantity, low stock threshold, condition, location)
  - Pricing (price, cost)
  - Technical (specs, compatibility)
  - Business (supplier, warranty)
  - Media (image URL)
- Relationships with categories and tags

#### Category

- User-defined product categories
- Unique per user
- Relationship with products

#### Tag

- Flexible tagging system
- Many-to-many relationship with products
- Unique per user

#### ActivityLog

- Complete audit trail
- Tracks all changes to entities
- Includes actor information and change details

#### InventoryFilter

- Persistent filter presets for inventory views
- Stores filter combinations as JSON
- Supports default filter per user
- User-scoped with unique filter names
- Includes search, category, manufacturer, condition, and stock filters

#### Session & Account

- Better Auth session management
- OAuth provider account linking
- Token management

### Database Indexes

- `Product`: Indexed on `userId + categoryId`, `manufacturer`, `createdAt`
- `ActivityLog`: Indexed on `userId + createdAt`, `entityType + entityId`
- `Category`: Unique constraint on `userId + name`
- `Tag`: Unique constraint on `userId + name`
- `InventoryFilter`: Indexed on `userId + isDefault`, unique constraint on `userId + name`

---

## 🧩 Key Components

### Authentication Components

- **Sign In Form** (`components/auth/sign-in-form.tsx`)

  - Email/password authentication
  - Form validation with Zod
  - Error handling

- **Sign Up Form** (`components/auth/sign-up-form.tsx`)
  - User registration
  - Email verification support
  - Password strength validation

### Inventory Components

- **Inventory Data Table** (`components/inventory/inventory-data-table.tsx`)

  - Advanced data table with TanStack Table
  - Sorting, filtering, pagination
  - Column visibility controls
  - Bulk actions
  - Export functionality

- **Saved Filters Menu** (`components/inventory/saved-filters-menu.tsx`)

  - Save current filter combinations as reusable presets
  - Quick apply saved filters with one click
  - Set default filter that auto-applies on page load
  - Delete unwanted filter presets
  - Optimistic UI updates with toast notifications
  - User-scoped filter management

- **Category Manager** (`components/inventory/category-manager.tsx`)

  - Create and manage categories
  - Category breakdown charts
  - Product count per category

- **Section Cards** (`components/inventory/section-cards.tsx`)
  - Dashboard statistics cards
  - Quick overview metrics

### Landing Page Components

- **Hero Section** - Main landing page hero
- **Features** - Feature showcase
- **Content Section** - Additional content
- **Team Section** - Team information
- **Footer** - Site footer with links

### Layout Components

- **App Sidebar** - Main navigation sidebar
- **Site Header** - Top navigation bar
- **Navigation Components** - Various nav components

---

## 🔌 API Routes

The application uses Next.js API routes for backend functionality. Routes are organized under `app/api/`:

- **Authentication Routes** - Handled by Better Auth
- **Product Routes** - CRUD operations for products
- **Category Routes** - Category management
- **Upload Routes** - File upload handling

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:seed      # Seed database with sample data
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate   # Create and run migrations
npx prisma generate  # Generate Prisma Client
```

### Development Workflow

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**

   - Follow TypeScript and React best practices
   - Use existing component patterns
   - Add proper error handling

3. **Test Changes**

   ```bash
   npm run lint
   npm run build
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

### Code Style

- **TypeScript** - Strict mode enabled
- **React** - Functional components with hooks
- **Naming** - PascalCase for components, camelCase for functions
- **Imports** - Use path aliases (`@/components`, `@/lib`)
- **Formatting** - Follow ESLint configuration

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables

Ensure all production environment variables are set:

- `DATABASE_URL` - Production database connection
- `BETTER_AUTH_SECRET` - Strong secret key
- `BETTER_AUTH_URL` - Production URL
- AWS/ImageKit credentials if using file uploads

### Deployment Platforms

The application can be deployed to:

- **Vercel** (Recommended for Next.js)
- **Netlify**
- **Railway**
- **AWS Amplify**
- Any Node.js hosting platform

### Database Migration

Before deploying, ensure database migrations are run:

```bash
npx prisma migrate deploy
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all checks pass

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Bry-Ly**

- GitHub: [@bry-ly](https://github.com/bry-ly)
- Project: [Inventory System](https://github.com/bry-ly/tech-parts-inventory-system)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Better Auth](https://better-auth.vercel.app/) - Authentication library
- [Shadcn UI](https://ui.shadcn.com/) - Beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- All the amazing open-source contributors

---

<div align="center">

**Built with ❤️ using modern web technologies**

⭐ Star this repo if you find it helpful!

</div>
