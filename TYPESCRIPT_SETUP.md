# TypeScript Setup & Troubleshooting

## Why Compile Errors Keep Reappearing

The IDE's TypeScript language server was using different settings than the command line, causing false errors to appear and disappear randomly.

## What Was Fixed

### 1. `.vscode/settings.json`
Created workspace settings to ensure Cursor IDE uses:
- The correct TypeScript version from node_modules
- Proper module resolution settings
- Correct compiler options

### 2. `backend/tsconfig.json`
- Set target to `ES2022` (required for Prisma v6's private identifiers)
- Added explicit `lib: ["ES2022"]`
- Kept `skipLibCheck: true` to ignore library errors

### 3. `backend/package.json` Scripts
Added helpful scripts:
- `postinstall`: Runs on every pnpm install (generates Prisma Client)
- `prepare`: Runs before commands (ensures Prisma types are fresh)
- `prisma:generate`: Manual command to regenerate types if needed

### 4. `backend/prisma.config.ts`
- Uses `process.env.DATABASE_URL || "file:./prisma/dev.db"`
- Allows Prisma generate to work without DATABASE_URL being set

## If Errors Reappear

1. **Regenerate Prisma Client**:
   ```bash
   cd backend && pnpm prisma:generate
   ```

2. **Reload IDE**:
   - Ctrl+Shift+P (or Cmd+Shift+P) → "TypeScript: Restart TS Server"

3. **Clean reinstall**:
   ```bash
   rm -rf node_modules backend/node_modules && pnpm install --recursive
   ```

## Best Practices Going Forward

- Always run `pnpm install` from root (not individual directories)
- If Prisma schema changes, run `pnpm prisma:generate`
- Restart TS server if errors persist after code changes
- Check `.vscode/settings.json` is being applied (bottom right corner of VS Code shows "TypeScript" version)

