# Next.js SaaS Starter Template

A comprehensive, production-ready SaaS starter template built with Next.js 15, featuring authentication, subscriptions, AI integration, and modern UI components. Perfect for quickly launching subscription-based applications with all the essential infrastructure in place.

## ✨ Features

### 🔐 Authentication & User Management
- **Better Auth v1.2.8** - Modern authentication system
- Google OAuth integration
- Session management with database persistence
- User profile management with image uploads
- Account linking for multiple providers

### 💳 Subscription & Billing
- **Polar.sh** integration for subscription management
- Configurable pricing tiers and plans
- Real-time webhook processing
- Customer portal for self-service billing
- Subscription status tracking (active, canceled, expired)
- Payment gating with elegant overlays

### 🤖 AI Integration
- **OpenAI** powered chatbot
- React Markdown rendering for rich responses
- Multi-step conversation support
- Integrated chat widget in dashboard

### 🎨 Modern UI/UX
- **Tailwind CSS v4** - Latest utility-first styling
- **shadcn/ui** components - Accessible, customizable
- **Radix UI** primitives - Unstyled, accessible components
- Dark/light theme support with smooth transitions
- Responsive design with mobile-first approach
- Loading skeletons and optimistic UI updates

### 🗄️ Database & Storage
- **Neon PostgreSQL** - Serverless database
- **Drizzle ORM** - Type-safe database toolkit
- **Supabase Storage** - Secure, scalable object storage with CDN
- Database migrations with Drizzle Kit
- Drag & drop file uploads with progress tracking

### 📊 Analytics & Monitoring
- **PostHog** integration for product analytics
- User behavior tracking
- Custom event monitoring
- Error tracking and insights

## 🚀 Tech Stack

- **Framework**: Next.js 15.3.1 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Authentication**: Better Auth v1.2.8
- **Payments**: Polar.sh
- **AI**: OpenAI SDK
- **Storage**: Supabase Storage
- **Analytics**: PostHog
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
├── app/
│   ├── (auth)/              # Authentication pages
│   ├── dashboard/           # Protected dashboard area
│   │   ├── _components/     # Dashboard components
│   │   ├── chat/           # AI chat interface
│   │   ├── upload/         # File upload with Supabase Storage
│   │   ├── payment/        # Subscription management
│   │   └── settings/       # User settings & billing
│   ├── pricing/            # Public pricing page
│   └── api/                # API routes
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── homepage/           # Landing page sections
├── lib/
│   ├── auth/              # Authentication config
│   ├── subscription.ts    # Subscription utilities
│   └── upload-image.ts    # Supabase Storage upload utilities
└── db/
    ├── schema.ts          # Database schema
    └── drizzle.ts         # Database connection
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- Supabase account for storage
- Polar.sh account for subscriptions
- OpenAI API key for AI features
- Google OAuth credentials (optional)

### Installation

1. **Use this template**
   - Click "Use this template" button on GitHub
   - Or clone: `git clone <your-repo-url>`
   - Or download as ZIP

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file with:
```env
# Database
DATABASE_URL="your-neon-database-url"

# Authentication
BETTER_AUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Polar.sh
POLAR_ACCESS_TOKEN="your-polar-access-token"
POLAR_WEBHOOK_SECRET="your-webhook-secret"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Polar.sh Pricing Tiers
NEXT_PUBLIC_STARTER_TIER="your-starter-product-id"
NEXT_PUBLIC_STARTER_SLUG="your-starter-slug"
```

4. **Database Setup**
```bash
# Generate and run migrations
npx drizzle-kit generate
npx drizzle-kit push
```

5. **Supabase Storage Setup**
- Create a Supabase project (or use existing)
- Create a storage bucket named "uploads"
- Configure bucket permissions (public or private)
- Enable RLS policies if needed

6. **Polar.sh Setup**
- Create products for your pricing tiers
- Set up webhook endpoints for subscription events
- Configure your pricing structure

7. **Start Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 🎯 Key Features Explained

### Subscription Management
- Automatic subscription status checking
- Payment gating for premium features
- Integration with Polar.sh customer portal
- Webhook handling for real-time updates

### AI Chat Integration
- Built-in chatbot with OpenAI
- Markdown rendering for rich responses
- Conversation history and context

### File Upload System
- **Supabase Storage integration** with secure upload API
- **Drag & drop interface** with visual feedback
- **File validation** - Type checking and size limits
- **Progress tracking** - Real-time upload progress
- **Image gallery** - View uploaded files with metadata
- **Copy URLs** - Easy sharing and integration

### Analytics & Tracking
- PostHog event tracking
- User behavior monitoring
- Custom analytics dashboard

## 🔧 Customization

### Adding New Features
1. Create components in `components/`
2. Add API routes in `app/api/`
3. Update database schema in `db/schema.ts`
4. Run `npx drizzle-kit generate` and `npx drizzle-kit push`

### Styling
- Modify `app/globals.css` for global styles
- Use Tailwind classes for component styling
- Customize theme in `tailwind.config.ts`

### Authentication
- Configure providers in `lib/auth/auth.ts`
- Add new OAuth providers as needed
- Customize user profile fields in database schema

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://better-auth.com)
- [Polar.sh Documentation](https://docs.polar.sh)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Manual Deployment
```bash
npm run build
npm start
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Next.js and modern web technologies.
