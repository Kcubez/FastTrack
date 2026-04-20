# ⚡ FastTrack: Premium AI Content Writer

FastTrack is a high-performance, multimodal AI platform designed to transform your creative workflow. Whether you're generating social media posts from scratch or using visual context from product images, FastTrack delivers high-quality, brand-aware content in seconds.

![FastTrack Dashboard](/api/placeholder/dashboard)

## 🚀 Built With

- **Framework**: Next.js 15 (App Router)
- **AI Engine**: Gemini 2.0/3.1 (Multimodal Vision)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: Better Auth (RBAC)
- **UI Components**: Shadcn UI + Tailwind CSS v4
- **Analytics**: Recharts

## ✨ Key Features

### 🎨 Multimodal Generation
- **Image-to-Content**: Upload product images directly. FastTrack's AI "sees" your product details and writes content that perfectly matches the visual context.
- **16+ Smart Inputs**: Fine-tune your posts with 16+ granular options including Tone, Content Goal, Target Audience, and Keywords.
- **Negative Constraints**: Tell the AI exactly what to avoid for perfect brand compliance.

### 📚 Content Library
- **Centralized Hub**: Manage every post you've ever generated in one beautiful interface.
- **Advanced Filtering**: Quickly find content by Platform, Status (Draft/Published), Language, or Date Range.
- **Bulk Actions**: Publish or delete multiple items with a single click.

### 📊 Real-time Analytics
- **Live KPIs**: Track your content production lifecycle at a glance.
- **Interactive Visualizations**: Monitor platform popularity, publication trends, and user activity through dynamic charts.

### 🔐 Enterprise Security & Personalization
- **Per-User API Keys**: Users can securely save their own Gemini API keys for independent resource management.
- **Role-Based Access (RBAC)**: Distinct portals for Administrators and Content Generators.
- **Custom UI System**: No generic browser popups—everything runs through a sleek, custom-designed modal and toast system.

## 🛠️ Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Setup Environment**: Copy `.env.example` to `.env` and provide your Supabase/Gemini credentials.
4. **Initialize Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. **Run Development Server**: `npm run dev`

## 👨‍💻 Admin Setup

To set up the initial Admin user:
1. Register a standard account via `/register`.
2. Access your Supabase Dashboard and update the `role` field in the `user` table to `admin`.
3. Use the **User Management** panel to manage other accounts, ban/unban users, and oversee the platform.

---

Built with ❤️ for professional content creators.
