# The Blueprint — NYU Tandon Zine

The digital home of *The Blueprint*, NYU Tandon's student zine. This website hosts the digital edition of each issue, showcasing works of literature, visual art, music, and film submitted by NYU students.

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) | Frontend + server-side rendering |
| Language | [TypeScript](https://www.typescriptlang.org/) | Type safety across the codebase |
| Styling | [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS |
| Database | [Supabase](https://supabase.com/) (PostgreSQL) | Structured data (works, authors, issues) |
| File Storage | [Supabase Storage](https://supabase.com/docs/guides/storage) | Media files (images, audio, PDFs) |
| Auth | [Supabase Auth](https://supabase.com/docs/guides/auth) | Admin panel login |
| Hosting | [Vercel](https://vercel.com/) | Deployment + CDN |

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Homepage — lists all works in current issue
│   ├── works/
│   │   └── [id]/
│   │       └── page.tsx  # Individual work detail page
│   └── admin/
│       └── page.tsx      # Admin panel (protected)
├── components/           # Reusable UI components
├── lib/
│   └── supabase.ts       # Supabase client setup
└── types/
    ├── index.ts          # Domain types (Work, Author, Issue, etc.)
    └── database.ts       # Supabase table types (auto-generatable via CLI)
```

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account and project ([create one here](https://supabase.com))

### 1. Clone the repo

```bash
git clone https://github.com/nyu-tandon-zine/the-blueprint-web.git
cd the-blueprint-web
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_your_key_here
```

You can find these values in your Supabase project under **Settings → API Keys** (Publishable key) and **Settings → General** (Project URL). Ask a team lead if you need access.

> ⚠️ Never commit `.env.local` to the repo. It is already listed in `.gitignore`.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Team Workflow

### Branching

- `main` — always deployable. Never commit directly to this branch.
- Feature branches follow the naming convention: `feature/[short-description]`
  - e.g. `feature/homepage`, `feature/work-detail-page`, `feature/admin-panel`
- Bug fix branches: `fix/[short-description]`

### Making Changes

1. Pull the latest `main` before starting work:
   ```bash
   git checkout main
   git pull
   ```
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes, commit often with clear messages:
   ```bash
   git commit -m "Add work detail page layout"
   ```
4. Push your branch and open a Pull Request on GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Request a review from at least one teammate before merging.

### Commit Message Style

Keep commit messages short and in the imperative mood (as if completing the sentence "This commit will..."):

- ✅ `Add homepage work grid`
- ✅ `Fix audio player not loading on mobile`
- ❌ `added some stuff`
- ❌ `fixing the bug with the thing`

### Pull Requests

- PRs should be reasonably scoped — one feature or fix per PR.
- Write a short description of what changed and why.
- At least one other team member must approve before merging.

## Environment Setup Notes

- `.env.local` is gitignored and must be set up locally by each developer (see step 3 above).
- Supabase credentials are shared privately among team members — do not post them in Slack, issues, or PR comments.
- Vercel deployment is connected to the `main` branch and deploys automatically on merge.

## License

MIT License — see [LICENSE](./LICENSE) for details.
