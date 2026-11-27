<p align="center">
  <img src="public/logo.png" alt="PullPanda Logo" width="96" height="96" />
</p>

<h1 align="center">PullPanda</h1>

<p align="center">
  <strong>AI-powered GitHub Pull Request code reviewer with full codebase RAG context.</strong>
</p>

<p align="center">
  Built with Next.js 16, React 19, Prisma 7, Better Auth, Inngest, Pinecone, and OpenRouter.
</p>

---

## Overview

**PullPanda** connects to your GitHub repositories via a GitHub App, indexes your codebase into Pinecone for semantic retrieval, and automatically reviews incoming pull requests (`opened`, `synchronize`, `reopened`) with cross-file context — posting structured, actionable reviews directly on GitHub and tracking everything in a live dashboard.

---

## Key Features

- **Automated PR Reviews**: Verifies GitHub webhook signatures (`x-hub-signature-256`), fetches unified PR diffs, retrieves related codebase context from Pinecone, and posts formatted GitHub Alert reviews via `pullpanda-dev[bot]`.
- **On-Demand Codebase Sync (RAG)**: Indexes repository files into isolated Pinecone namespaces using the Pinecone Documents API (`documents.upsert` / `documents.search`), so PR reviews understand callers, types, and schemas across the repo.
- **Durable Background Jobs**: Powered by **Inngest** (`sync-repo-codebase` and `review-pull-request`) with step-level retries, failure tracking, and indexing waits.
- **Developer Dashboard**:
  - **Overview** (`/dashboard`): Live metrics for GitHub App status, synced codebases, indexed chunks, and recent PRs.
  - **Repositories** (`/dashboard/repos`): Infinite-scroll repository browser with visibility filters, search, and one-click codebase sync.
  - **Pull Requests** (`/dashboard/pull-request`): Filterable (`All`, `Reviewed`, `Processing`, `Pending`) PR activity table with expandable AI review output.
  - **GitHub App** (`/dashboard/github`): One-click GitHub App installation and disconnect management.
  - **Settings** (`/dashboard/settings`): Account profile, GitHub App integration status, and AI/RAG pipeline health.
- **GitHub OAuth Authentication**: Session management and route protection powered by **Better Auth** and Next.js `proxy.ts`.

---

## Architecture

```mermaid
flowchart LR
    GH[GitHub PR Event] -->|POST /api/github/webhook| WH[Webhook Handler]
    WH -->|Verify HMAC + Save PR| DB[(PostgreSQL / Prisma)]
    WH -->|github/pr.received| ING[Inngest Worker]
    ING -->|Fetch PR Diff| GHAPI[GitHub Octokit API]
    ING -->|Upsert & Search Context| PC[(Pinecone Documents)]
    ING -->|PR Diff + Repo Context| LLM[OpenRouter AI SDK]
    LLM -->|Markdown Review| GHAPI
    GHAPI -->|Post Comment| GH
    ING -->|Mark Reviewed| DB
```

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| **Styling & UI** | Tailwind CSS v4, shadcn/ui (`@base-ui/react`), Lucide Icons |
| **Database & ORM** | PostgreSQL, Prisma 7 (`@prisma/adapter-pg`) |
| **Authentication** | Better Auth (GitHub OAuth) |
| **Background Jobs** | Inngest (`inngest` v4) |
| **Vector / RAG** | Pinecone (`@pinecone-database/pinecone` Documents API) |
| **AI / LLM** | Vercel AI SDK (`ai`) + OpenRouter (`@openrouter/ai-sdk-provider`) |
| **GitHub Integration** | Octokit (`octokit`, `@octokit/rest`) |
| **Data Fetching** | TanStack React Query |

---

## Project Structure

```text
├── app/
│   ├── (auth)/sign-in/              # GitHub OAuth sign-in page
│   ├── (protected)/dashboard/       # Overview, Repos, Pull Requests, GitHub App, Settings
│   └── api/
│       ├── auth/[...all]/           # Better Auth handler
│       ├── github/
│       │   ├── callback/            # GitHub App installation callback
│       │   ├── repo/                # Paginated installation repositories + sync status
│       │   └── webhook/             # GitHub PR webhook receiver
│       └── inngest/                 # Inngest serve endpoint
├── components/ui/                   # Reusable UI primitives
├── features/
│   ├── ai/                          # OpenRouter provider client
│   ├── auth/                        # Auth actions, components, proxy helpers
│   ├── dashboard/                   # Sidebar, header, nav, repo list, types
│   ├── github/                      # GitHub App client, installation & repo queries, webhook handler
│   ├── inngest/                     # Inngest client
│   ├── pinecone/                    # Pinecone index client
│   ├── repo-sync/                   # Codebase chunking, sync actions, Inngest sync function
│   └── reviews/                     # PR diff chunking, vector search, AI review generator, PR list UI
├── lib/
│   ├── auth.ts                      # Better Auth configuration
│   └── db.ts                        # Prisma 7 + pg adapter singleton
├── prisma/
│   └── schema.prisma                # User, Session, Account, GithubInstallation, PullRequest, RepoSync
└── proxy.ts                         # Auth route protection middleware
```

---

## Getting Started

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Better Auth (GitHub OAuth App)
BETTER_AUTH_SECRET="your-random-secret"
BETTER_AUTH_URL="http://localhost:3000"
GITHUB_CLIENT_ID="your-github-oauth-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-client-secret"

# GitHub App (PR webhooks & comments)
GITHUB_APP_ID="your-github-app-id"
GITHUB_APP_SLUG="your-github-app-slug"
NEXT_PUBLIC_GITHUB_APP_SLUG="your-github-app-slug"
GITHUB_APP_WEBHOOK_SECRET="your-webhook-secret"
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"

# AI & Vector Search
OPENROUTER_API_KEY="your-openrouter-api-key"
REVIEW_MODEL="openrouter/free" # Optional: override with a pinned model ID
PINECONE_INDEX_NAME="your-pinecone-document-index"
PINECONE_API_KEY="your-pinecone-api-key"

# Inngest (local development)
INNGEST_DEV=1
```

> **Note on Pinecone:** Your Pinecone index should use a **document schema** with a `title` text field and an embedded `chunk_text` field (e.g., `llama-text-embed-v2`).

### 3. Generate Prisma Client & Run Migrations

```bash
bun x prisma generate --config=prisma7.config.ts
bun x prisma migrate dev --config=prisma7.config.ts
```

### 4. Start Local Services

Run the Next.js development server, Inngest dev server, and a tunnel (such as `ngrok`) for GitHub webhooks:

```bash
# Terminal 1: Next.js dev server
bun run dev

# Terminal 2: Inngest dev server
npx --ignore-scripts=false inngest-cli@latest dev -u http://localhost:3000/api/inngest

# Terminal 3: Expose local webhook endpoint for GitHub
ngrok http 3000
```

Open [http://localhost:3000](http://localhost:3000) to sign in and connect your GitHub App, and [http://localhost:8288](http://localhost:8288) to inspect Inngest runs.

---

## GitHub App Configuration

When creating your GitHub App, configure:

- **Callback URL / Setup URL**: `https://<your-domain-or-ngrok>/api/github/callback` *(check **Redirect on update**)*
- **Webhook URL**: `https://<your-domain-or-ngrok>/api/github/webhook`
- **Repository Permissions**:
  - **Contents**: Read-only
  - **Issues**: Read and write
  - **Metadata**: Read-only
  - **Pull requests**: Read and write
- **Subscribe to events**:
  - **Pull request**

---

## Scripts

| Command | Description |
| :--- | :--- |
| `bun run dev` | Start Next.js development server (Turbopack) |
| `bun run build` | Build production bundle |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
