# 🏗️ BuildBazaarX-v2

[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)](https://supabase.io/)
[![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=3399FF)](https://razorpay.com/)

![BuildBazaarX Hero](public/branding_hero.png)

**BuildBazaarX-v2** is a cutting-edge, all-in-one digital ecosystem for interior design and construction. From browsing premium designs to purchasing raw materials and calculating precise execution costs, BuildBazaarX streamlines the entire building process.

## 🌟 Key Features

- **🛍️ Design & Material Catalog**: Browse a curated selection of premium interior designs and high-quality construction materials (Cement, Paint, Tiles, etc.).
- **📊 Execution Cost Calculator**: Get instant, detailed pricing breakdowns for interior projects including materials, labor, and professional fees.
- **💳 Secure Checkout**: Seamless payment integration with **Razorpay** for a smooth purchasing experience.
- **🔐 Unified Authentication**: Secure user login and profile management powered by **Supabase Auth**.
- **📱 Responsive Design**: A fluid, modern UI built with **Tailwind CSS** and **shadcn/ui**, optimized for all devices.
- **⚡ Real-time Data**: Instant updates and efficient data fetching using **TanStack Query**.

## 🛠️ Tech Stack

- **Frontend**: Vite, React 18, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons, Framer Motion
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **State Management**: React Context & TanStack Query (v5)
- **Backend/Database**: Supabase
- **Payments**: Razorpay Integration
- **Form Handling**: React Hook Form + Zod Validation

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun
- Supabase Account (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/buildbazaarx-v2.git
   cd buildbazaarx-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory and add your Supabase and Razorpay credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_RAZORPAY_KEY_ID=your_razorpay_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```text
src/
├── components/       # Reusable UI & Feature components
│   ├── auth/         # Authentication logic
│   ├── cart/         # Shopping cart components
│   ├── design-detail/# Project-specific calculators & breakdowns
│   └── ui/           # shadcn/ui base components
├── contexts/         # React Context providers (Cart, etc.)
├── hooks/            # Custom React hooks
├── integrations/     # Supabase & external client configurations
├── pages/            # Main route pages (Home, Catalog, Checkout, etc.)
└── assets/           # Static resources, icons, and transformations
```

## 🖼️ Assets & Images

Images have been migrated from the local bundle to the Supabase Storage CDN to improve performance and reduce bundle size.
- **Product Images**: Live in the `product-images` Supabase bucket.
- **Design Images**: Live in the `design-images` Supabase bucket.

### How to add new images:
1. Upload the new image to the appropriate Supabase bucket (`product-images` or `design-images`).
2. Add the exported constant for the new image in `src/lib/cdnImages.ts` pointing to its CDN URL.
3. Import and use the constant across the codebase instead of importing local files.

## 🔌 Backend Architecture

The project leverages **Supabase Edge Functions** for secure server-side operations:
- `create-razorpay-order`: Securely generates Razorpay orders.
- `process-payment`: Handles payment verification and signature validation.
- `send-order-email`: Automates customer notifications upon successful purchase.

## 🧪 Testing

Run unit tests using Vitest:
```bash
npm run test
```

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ by the BuildBazaarX Team.
