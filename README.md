# My Simple App

[![CI](https://github.com/antoniofextra/my-simple-app/actions/workflows/ci.yml/badge.svg)](https://github.com/antoniofextra/my-simple-app/actions/workflows/ci.yml)

A full-stack todo application with React frontend and Fastify backend.

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- Running on `http://localhost:5173`

### Backend
- **Fastify** for REST API
- **Prisma** with SQLite database
- **TypeScript**
- Running on `http://localhost:4000`

### Testing & CI/CD
- **Playwright** for e2e tests
- **Husky** for git hooks (pre-commit linting, pre-push testing)
- **GitHub Actions** for CI/CD

## Getting Started

### Prerequisites
- Node.js 20 or 22
- pnpm 10.22.0+

### Installation

```bash
# Install dependencies
pnpm install

# Set up database
cd backend
pnpm prisma db push
```

### Development

```bash
# Terminal 1: Run backend
cd backend
pnpm run dev

# Terminal 2: Run frontend
cd frontend
pnpm run dev
```

Visit `http://localhost:5173` to see the app!

## Testing

```bash
# Run e2e tests
pnpm test

# Run tests with UI
pnpm test:ui

# Debug tests
pnpm test:debug

# Lint
pnpm run lint
```

## Git Hooks

This project uses Husky to run checks automatically:

- **Pre-commit:** Runs linting on frontend code
- **Pre-push:** Runs full e2e test suite

This ensures code quality before pushing to remote.

## CI/CD

GitHub Actions runs on every push and PR:
- ✅ Linting
- ✅ E2E tests
- ✅ Multi-version testing (Node 20 & 22)

See [Branch Protection Setup](./.github/BRANCH_PROTECTION.md) for how to require checks before merging.

## Project Structure

```
my-simple-app/
├── backend/          # Fastify API server
│   ├── src/
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── frontend/         # React app
│   ├── src/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── e2e/             # Playwright tests
│   └── todo.spec.ts
└── .github/
    └── workflows/
        └── ci.yml   # CI/CD pipeline
```

## API Endpoints

- `GET /api/todos` - List all todos
- `POST /api/todos` - Create a new todo
- `DELETE /api/todos/:id` - Delete a todo

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Commit (pre-commit hook will run linting)
4. Push (pre-push hook will run tests)
5. Create a Pull Request
6. Wait for CI to pass
7. Get code review approval
8. Merge!

## License

ISC

