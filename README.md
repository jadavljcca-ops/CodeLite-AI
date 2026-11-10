# CodeLite AI — Token-Efficient Autonomous Coding Agent

> *"Less Tokens. More Coding. Better Results."*

CodeLite AI is a production-oriented autonomous AI coding agent designed to complete real-world software development tasks using the minimum possible number of LLM tokens without sacrificing correctness, code quality, security, or completion reliability.

---

## 🚀 Key Features

### 1. 8-Step Autonomous Agent Workflow
The agent executes an end-to-end software development lifecycle:
1. **Understand**: Extracts functional requirements and detects target frameworks.
2. **Plan**: Breaks tasks into modular steps and chooses an appropriate model tier.
3. **Retrieve Context**: Dependency-aware AST selection—retrieves only relevant snippets, avoiding full repository dumps.
4. **Generate Code**: Emits targeted diffs and incremental patches rather than rewriting files.
5. **Execute**: Safely writes files inside an isolated workspace sandbox.
6. **Debug**: Analyzes compiler and runtime errors, retrieving only error-related context.
7. **Test**: Runs build checks, unit tests, and validation before declaring success.
8. **Complete**: Reports verified token savings and changed files.

### 2. Token Optimization Engine (10 Core Techniques)
- **Smart Context Selection**: Relevance-ranked file search avoiding prompt bloat.
- **Context Compression**: Strips comments, redundant formatting, and whitespace.
- **Incremental Code Editing**: Prefers unified diffs and surgical patches.
- **Dynamic Model Routing**: Routes simple tasks to `gemini-2.0-flash-lite`, standard tasks to `gemini-2.0-flash`, and high-reasoning tasks to `gemini-1.5-pro`.
- **Smart Memory**: Preserves architecture outlines and invalidates stale file caches.
- **Error-Based Retrieval**: Only sends error-relevant files during debug loops.
- **Gemini Context Caching**: Leverages cache hits for repeated context.
- **Tool Output Filtering**: Truncates repetitive logs and terminal noise.
- **Duplicate Request Detection**: Caches deterministic tool and query results.
- **Intelligent Stop Conditions**: Terminates retries on unrecoverable conditions.

### 3. Fair Token Benchmarking Suite
Built-in evaluation with 10 standardized coding tasks:
- Create a React component
- Fix a login validation bug
- Add dark mode to an existing project
- Create CRUD functionality
- Add database integration
- Fix a TypeScript error
- Write unit tests
- Refactor duplicate code
- Add an API endpoint
- Debug a failed build

*Formula:*
$$\text{Token Savings (\%)} = \left(\frac{\text{Baseline Tokens} - \text{Optimized Tokens}}{\text{Baseline Tokens}}\right) \times 100$$

### 4. Premium Developer Dashboard
- **Design Inspiration**: Cursor, VS Code, Linear, and Vercel.
- **Monaco Editor**: Integrated code browsing, syntax highlighting, and live editing.
- **Telemetry Panel**: Live input, output, cached tokens, and estimated monetary cost.
- **Secure Sandbox**: File-system path traversal protection and command allowlisting.

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui, Radix UI, Lucide Icons |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) |
| **AI Models** | Google Gemini API (`gemini-2.0-flash`, `gemini-2.0-flash-lite`, `gemini-1.5-pro`) |
| **Database** | Supabase PostgreSQL + Row Level Security (RLS) + pgvector |
| **Authentication** | Supabase Auth (SSR Cookies & Session Management) |
| **Data Fetching** | TanStack React Query v5 |
| **Charts** | Recharts |
| **File Processing** | JSZip, Node.js Crypto, Secure Child Process Sandbox |

---

## 📁 Repository Structure

```
d:\CodeLite AI\
├── src\
│   ├── app\
│   │   ├── (app)\                  # Protected developer application routes
│   │   │   ├── dashboard\          # Overview metrics, quick actions & recent runs
│   │   │   ├── projects\           # Project catalog & creation
│   │   │   │   ├── new\            # Project setup & ZIP archive upload
│   │   │   │   └── [id]\           # Project hub
│   │   │   │       ├── agent\      # 3-column AI Coding Workspace
│   │   │   │       └── files\      # VS Code-style File Explorer with Monaco
│   │   │   ├── analytics\          # Live token consumption & cost charts
│   │   │   ├── benchmarks\         # 10-task Fair Benchmarking Suite
│   │   │   ├── history\            # Task execution audit logs
│   │   │   ├── settings\           # Model routing & token preferences
│   │   │   └── profile\            # User account & lifetime telemetry
│   │   ├── (auth)\                 # Authentication routes
│   │   │   ├── login\              # User sign in
│   │   │   ├── register\           # User sign up
│   │   │   └── forgot-password\    # Password reset
│   │   ├── api\                    # Server API Routes (Zero browser key exposure)
│   │   │   ├── agent\run\          # SSE streaming agent executor
│   │   │   ├── analytics\          # Aggregated token usage queries
│   │   │   ├── benchmarks\         # Baseline vs. Optimized executor
│   │   │   └── projects\           # CRUD, file storage & ZIP extraction
│   │   ├── globals.css             # Tailwind base & custom gradients
│   │   ├── layout.tsx              # Root HTML & theme providers
│   │   └── page.tsx                # High-converting landing page
│   ├── components\                 # Reusable UI library (shadcn/ui & layout)
│   ├── lib\
│   │   ├── agent\                  # Autonomous agent executor & Token Optimizer
│   │   ├── gemini\                 # Google Gemini client & cost estimators
│   │   ├── supabase\               # Browser, Server, and Middleware Supabase clients
│   │   ├── tools\                  # Isolated sandbox execution tools
│   │   └── utils.ts                # Formatting, calculations, class merging
│   └── types\                      # Database types & schema interfaces
├── supabase\
│   ├── migrations\                 # 9 tables with strict user-level RLS policies
│   └── seed.sql                    # Initial development & benchmark data
├── .env.example                    # Sample environment variables template
└── next.config.mjs                 # Next.js production configuration
```

---

## ⚙️ Local Setup Instructions

### 1. Prerequisites
- Node.js 18.x or higher
- npm or pnpm
- A free [Google AI Studio](https://aistudio.google.com/) account for Gemini API
- A free [Supabase](https://supabase.com/) account

### 2. Clone and Install Dependencies
```bash
git clone <repository-url>
cd "CodeLite AI"
npm install --legacy-peer-deps
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in the required configuration:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

GEMINI_API_KEY=your_gemini_api_key

NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Supabase Database Setup
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor**.
3. Copy the contents of `supabase/migrations/20240101000000_initial_schema.sql` and run the script.
4. (Optional) Run `supabase/seed.sql` to populate sample benchmark records.
5. In Supabase **Authentication** -> **URL Configuration**, add:
   - Site URL: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000/auth/callback`

### 5. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🤖 Gemini API Setup Instructions
1. Navigate to [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API key** and generate a new key.
3. Paste the key into `GEMINI_API_KEY` in `.env.local`.
4. The system automatically routes requests across:
   - `gemini-2.0-flash` for primary code generation & debugging
   - `gemini-2.0-flash-lite` for planning, test validation & summarization
   - `gemini-1.5-pro` for complex refactoring

---

## 🚀 Vercel Deployment Instructions

1. Push the repository to GitHub / GitLab.
2. In the [Vercel Dashboard](https://vercel.com/dashboard), click **Add New** -> **Project**.
3. Import the repository.
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel domain)
5. Click **Deploy**.
6. In Supabase Dashboard, add your Vercel production domain to allowed redirect URLs.

---

## 🔒 Security Architecture
- **Zero Browser Secrets**: Gemini keys and service keys exist only on the Node.js server.
- **Path Traversal Protection**: Sandbox tools reject any paths with `../` or leading root paths.
- **Command Allowlisting**: Only safe developer tools (`npm test`, `npm run build`, `git diff`) can execute.
- **Row Level Security**: Users can only query, modify, or run agents on their own projects.

---

## 📄 License
MIT License. Built for token efficiency and high-performance autonomous development.

