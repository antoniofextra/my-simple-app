# Branch Protection Setup

After pushing this workflow, you can enable branch protection on GitHub to require tests to pass before merging.

## How to Enable Branch Protection

1. Go to your repository on GitHub
2. Click **Settings** → **Branches**
3. Click **Add branch protection rule**
4. Configure the rule:

### Basic Protection (Recommended)

```
Branch name pattern: main
```

☑️ **Require a pull request before merging**
- ☑️ Require approvals: 1 (for teams)
- ☐ Dismiss stale pull request approvals when new commits are pushed
- ☐ Require review from Code Owners

☑️ **Require status checks to pass before merging**
- ☑️ Require branches to be up to date before merging
- Search and select these status checks:
  - ✅ `Lint`
  - ✅ `E2E Tests`
  - ✅ `Test Node 20` (optional)
  - ✅ `Test Node 22` (optional)

☑️ **Require conversation resolution before merging**

☐ **Require signed commits** (optional, more secure)

☑️ **Include administrators** (apply rules even to repo admins)

### Advanced Protection (For Teams)

☑️ **Require linear history** - No merge commits, cleaner git history

☑️ **Require deployments to succeed** - If you add deployment jobs

☐ **Lock branch** - Prevent all pushes (for archived projects)

## What This Does

✅ **Prevents direct pushes to main** - All changes must go through PRs  
✅ **Requires tests to pass** - Can't merge if CI fails  
✅ **Requires code review** - At least 1 approval needed  
✅ **Keeps history clean** - Enforces good git practices  

## Workflow Without Branch Protection

1. Work on feature branch: `git checkout -b feature/new-todo-filter`
2. Make changes and commit
3. Push: `git push origin feature/new-todo-filter`
4. Create PR on GitHub
5. Wait for CI to pass ✅
6. Get review approval (if required)
7. Merge PR → main

## Emergency Bypass

Repo admins can:
- Temporarily disable branch protection
- Use "Include administrators" checkbox to prevent accidental bypass
- Force-push with `--force` (NOT recommended)

## Status Badge

Add this to your README.md to show build status:

\`\`\`markdown
[![CI](https://github.com/antoniofextra/my-simple-app/actions/workflows/ci.yml/badge.svg)](https://github.com/antoniofextra/my-simple-app/actions/workflows/ci.yml)
\`\`\`

Result:  
![CI](https://github.com/antoniofextra/my-simple-app/actions/workflows/ci.yml/badge.svg)

