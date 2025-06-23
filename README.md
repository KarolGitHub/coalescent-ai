# CoalescentAI

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.3-black.svg)](https://nextjs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.0-green.svg)](https://www.fastify.io/)
[![tRPC](https://img.shields.io/badge/tRPC-11.4-blue.svg)](https://trpc.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Project Description

**CoalescentAI** is an AI-powered team collaboration hub designed for seamless, real-time teamwork and productivity. By merging advanced collaboration tools with intelligent AI features, CoalescentAI empowers distributed teams to brainstorm, organize, and execute projects efficiently—all in one unified platform.

## Key Features

- **Real-Time Collaborative Whiteboard**  
  Draw, annotate, and brainstorm together with live updates, multi-user cursors, and drag-and-drop elements.

- **AI-Powered Meeting Summaries**  
  Automatically transcribe meetings and generate concise, actionable summaries using integrated AI services.

- **Video Conferencing**  
  Built-in video chat with screen sharing and collaborative note-taking.

- **Smart File Organization**  
  AI-driven tagging and categorization of uploaded files for effortless retrieval and management.

- **Predictive Scheduling**  
  Intelligent calendar assistant that suggests optimal meeting times based on team availability and past activity.

- **Task & Action Item Management**  
  Assign, track, and prioritize tasks with real-time updates and AI-generated suggestions.

- **Integrated Chat & Notifications**  
  Contextual chat channels, direct messages, and smart notifications to keep everyone in sync.

- **Secure Authentication & User Management**  
  Modern, secure login with role-based access control.

## Technology Stack (2025)

### Frontend

- **Core Framework:** Next.js 15 (React 19, React Server Components)
- **Language:** TypeScript 5.4+
- **Build Tool:** Next.js with Turbopack
- **Styling & UI:**
  - Tailwind CSS
  - ShadCN/UI (Radix UI)
  - Framer Motion
- **State Management:**
  - Zustand (client state)
  - TanStack Query (server state)
- **Real-Time Features:** Socket.IO client

### Backend

- **Runtime & Language:** Node.js 20+ with TypeScript
- **Framework:** Fastify 5.0
- **Database & ORM:**
  - Supabase (PostgreSQL)
  - Prisma (Type-safe ORM)
- **Authentication:** JOSE (JWT handling)
- **Validation:** Zod
- **Real-Time Communication:** Socket.IO
- **API Layer:** tRPC 11 (end-to-end type safety)
- **Caching & Performance:** Redis

### Development & Deployment

- **Code Editor:** Cursor (AI-powered)
- **Testing:**
  - Vitest (Unit & Integration)
  - Playwright (E2E)
  - React Testing Library (Component)
- **Monitoring:** Sentry
- **Deployment:**
  - Frontend: Vercel
  - Backend: Railway or Render
- **AI Integration:** OpenAI API (GPT-4, Whisper)

## Getting Started

### Prerequisites

- Node.js 20+ (LTS recommended)
- pnpm 8+ (`npm install -g pnpm`)
- Git
- Redis (for caching and real-time features)
- PostgreSQL 15+ (via Supabase or local)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/coalescent-ai.git
   cd coalescent-ai
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   # Root .env
   cp .env.example .env

   # Client .env
   cp packages/client/.env.example packages/client/.env.local

   # Server .env
   cp packages/server/.env.example packages/server/.env
   ```

### Environment Variables

#### Client (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

#### Server (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/db
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
```

### Development

1. Start the development servers:

   ```bash
   # Start all services
   pnpm dev

   # Or start individual services
   pnpm dev --filter client  # Frontend on http://localhost:3000
   pnpm dev --filter server  # Backend on http://localhost:3001
   ```

2. Run tests:

   ```bash
   # Run all tests
   pnpm test

   # Run specific package tests
   pnpm test --filter client
   pnpm test --filter server
   ```

## Project Structure

```
coalescent-ai/
├── packages/
│   ├── client/                # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/          # App router pages
│   │   │   │   └── lib/         # Utilities and hooks
│   │   │   └── public/          # Static assets
│   │   └── server/              # Fastify backend
│   │       ├── src/
│   │       │   ├── routes/     # API routes
│   │       │   ├── services/   # Business logic
│   │       │   └── utils/      # Helper functions
│   │       └── prisma/        # Database schema
│   └── common/            # Shared types and utilities
├── package.json          # Workspace configuration
└── pnpm-workspace.yaml   # Workspace definition
```

## Contributing

We use [Conventional Commits](https://www.conventionalcommits.org/) for clear communication.

1. Fork the repository
2. Create your feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Make your changes following our coding standards:

   - Use TypeScript strict mode
   - Follow ESLint rules
   - Write tests for new features
   - Keep components small and focused
   - Use React Server Components where possible

4. Commit your changes:

   ```bash
   git commit -m 'feat: add some amazing feature'
   ```

   Commit types:

   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation
   - `style`: Formatting
   - `refactor`: Code restructuring
   - `test`: Tests
   - `chore`: Maintenance

5. Push to your branch:

   ```bash
   git push origin feature/amazing-feature
   ```

6. Open a Pull Request with:
   - Clear description of changes
   - Screenshots/videos if relevant
   - Test coverage report
   - Breaking changes noted

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - React Framework
- [Fastify](https://www.fastify.io/) - Web Framework
- [tRPC](https://trpc.io/) - End-to-end Type Safety
- [Supabase](https://supabase.com/) - Open Source Firebase Alternative
- [ShadcnUI](https://ui.shadcn.com/) - UI Components

---

Built with ❤️ using modern web technologies.
