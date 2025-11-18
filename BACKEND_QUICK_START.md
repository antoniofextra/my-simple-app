# Backend Quick Start Guide

## Current Setup ✅

Your backend now uses Option 1 (.env file):
- **Database URL:** Automatically loaded from `backend/.env`
- **Database Location:** `backend/prisma/dev.db` (SQLite)
- **Server Port:** 4000
- **Status:** ✅ Working!

---

## Quick Commands

### Start Development Server
```bash
cd backend
pnpm dev
```
✅ That's it! No DATABASE_URL needed.

### Run Tests
```bash
cd backend
pnpm test           # Run tests once
pnpm test:watch     # Watch mode (auto-rerun on changes)
pnpm test:coverage  # With coverage report
```

### Database Commands

```bash
# Apply pending migrations (after schema changes)
pnpm prisma migrate deploy

# Generate Prisma Client (after schema changes)
pnpm prisma generate

# Both together
pnpm prisma generate && pnpm prisma migrate deploy

# Check migration status
pnpm prisma migrate status

# View database
pnpm prisma studio   # Opens web UI (optional, requires install)
```

### Useful API Endpoints (when server running)

```bash
# Get all todos
curl http://localhost:4000/api/todos

# Create todo with location
curl -X POST http://localhost:4000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy milk", "location": "Supermarket"}'

# Create todo without location
curl -X POST http://localhost:4000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Call mom"}'

# Delete specific todo (replace 1 with todo id)
curl -X DELETE http://localhost:4000/api/todos/1

# Delete all todos
curl -X DELETE http://localhost:4000/api/todos
```

---

## After Schema Changes

When you or a teammate changes `backend/prisma/schema.prisma`:

```bash
# Step 1: Generate Prisma Client
pnpm prisma generate

# Step 2: Apply migrations
pnpm prisma migrate deploy

# Step 3: Restart server
pnpm dev
```

Or do both at once:
```bash
pnpm prisma generate && pnpm prisma migrate deploy && pnpm dev
```

---

## Troubleshooting

### "The column does not exist" error
```bash
# Solution: Apply migrations
pnpm prisma migrate deploy
pnpm dev
```

### "Cannot find module" error
```bash
# Solution: Reinstall and generate
pnpm install
pnpm prisma generate
pnpm dev
```

### Database is corrupted
```bash
# Reset to fresh state (loses all local data!)
rm -f prisma/dev.db
pnpm prisma migrate deploy
pnpm dev
```

### Need to inspect database
```bash
# Using sqlite3 command line
sqlite3 prisma/dev.db

# Inside sqlite:
.tables                    # Show all tables
.schema Todo              # Show Todo table structure
SELECT * FROM Todo;        # Query all todos
.exit                      # Exit sqlite
```

---

## File Structure

```
backend/
├── .env                    # ✅ NEW: Database URL (auto-loaded)
├── src/
│   ├── server.ts          # Fastify server + API endpoints
│   └── server.test.ts     # Backend tests
├── prisma/
│   ├── schema.prisma      # Database schema (defines tables)
│   ├── dev.db             # SQLite database file (auto-created)
│   └── migrations/        # Migration history
│       ├── 20251117085424_init/
│       └── 20251118184053_add_location_to_todo/
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript config
```

---

## Environment Variables

### Development (currently set up)
```bash
# backend/.env
DATABASE_URL="file:./prisma/dev.db"
```

### Production (example - not configured yet)
```bash
DATABASE_URL="postgresql://user:password@db.example.com:5432/myapp"
```

---

## Key Notes

✅ **You don't need to:**
- Pass `DATABASE_URL` on command line
- Remember to apply migrations manually (well, you do, but .env makes it easier!)
- Edit .env after initial setup

⚠️ **You should:**
- Run `pnpm prisma generate && pnpm prisma migrate deploy` after any schema changes
- Commit schema.prisma changes AND migration files to git
- Never commit `.env` (it's in .gitignore for security)

---

## Next Time You Clone/Setup

```bash
# Clone repo
git clone <repo>
cd my-simple-app/backend

# One command to get ready
pnpm install

# Start developing!
pnpm dev
```

The `.env` file is already there (not in git), so everything works!

---

## Server Status

Current: ✅ Running on port 4000

Test it:
```bash
curl http://localhost:4000/api/todos
```

Should return: `[]` (empty array if no todos) or JSON array of todos if any exist.

---

For more details, see:
- `DATABASE_SETUP_GUIDE.md` - Detailed setup options
- `MIGRATION_OPTIONS_SUMMARY.md` - All migration strategies compared

