# Development Guide

## Git Hooks

This project uses **Husky** to automatically run checks before commits and pushes.

### Pre-commit Hook
**What it does:** Runs linting on the frontend code  
**When:** Every time you run `git commit`  
**Time:** ~1-2 seconds  

```bash
pnpm run lint
```

If linting fails, your commit will be blocked. Fix the errors and try again.

### Pre-push Hook
**What it does:** Runs the full e2e test suite  
**When:** Every time you run `git push`  
**Time:** ~10-30 seconds  

```bash
pnpm test
```

If tests fail, your push will be blocked. This ensures you never push broken code.

## Skipping Hooks (use sparingly!)

If you need to bypass hooks in an emergency:

```bash
# Skip pre-commit
git commit --no-verify -m "message"

# Skip pre-push
git push --no-verify
```

⚠️ **Warning:** Only use `--no-verify` when absolutely necessary (e.g., emergency hotfix, WIP branch).

## Running Tests Manually

```bash
# Run e2e tests
pnpm test

# Run e2e tests with UI
pnpm test:ui

# Debug a specific test
pnpm test:debug

# Lint frontend
pnpm run lint
```

## Development Workflow

1. Make your changes
2. Run `git add <files>`
3. Run `git commit -m "message"` → pre-commit hook runs linting
4. Run `git push` → pre-push hook runs e2e tests
5. ✅ Code is pushed with confidence!

## CI/CD

In the future, you can add GitHub Actions or similar CI to:
- Run tests on every PR
- Deploy automatically on merge to main
- Run additional checks (security scans, coverage reports, etc.)

