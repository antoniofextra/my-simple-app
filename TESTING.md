# Testing Guide

This project has three layers of testing: unit tests (frontend & backend) and e2e tests.

## 📊 Test Coverage

| Type | Tool | Count | Speed | What it Tests |
|------|------|-------|-------|---------------|
| **Frontend Unit** | Vitest | 8 tests | ~900ms | React components, form logic, error handling |
| **Backend Unit** | Jest | 8 tests | ~2.3s | API routes, database operations, CORS |
| **E2E** | Playwright | 3 tests | ~1.8s | Full stack integration |
| **Total** | - | **19 tests** | **~5s** | Complete application |

---

## 🧪 Frontend Unit Tests (Vitest)

### Location
- `frontend/src/App.test.tsx` - Main component tests
- `frontend/src/test/setup.ts` - Test configuration

### What's Tested
✅ Component rendering  
✅ Form validation (empty input)  
✅ API calls (fetch todos, create todo, delete todo)  
✅ Loading states  
✅ Error handling  
✅ User interactions  

### Running Tests

```bash
# Run all frontend tests
cd frontend && pnpm test

# Watch mode (re-run on changes)
cd frontend && pnpm test:watch

# With UI (browser interface)
cd frontend && pnpm test:ui

# With coverage report
cd frontend && pnpm test:coverage
```

### Example Test

```typescript
it('submits a new todo when form is submitted', async () => {
  const user = userEvent.setup()
  
  render(<App />)
  
  await user.type(screen.getByPlaceholderText(/new todo title/i), 'New Todo')
  await user.click(screen.getByRole('button', { name: /add/i }))
  
  await waitFor(() => {
    expect(screen.getByText('New Todo')).toBeInTheDocument()
  })
})
```

---

## 🔧 Backend Unit Tests (Jest)

### Location
- `backend/src/server.test.ts` - API route tests
- `backend/jest.config.js` - Jest configuration

### What's Tested
✅ `GET /api/todos` - List todos  
✅ `POST /api/todos` - Create todo  
✅ `DELETE /api/todos/:id` - Delete todo  
✅ Database persistence  
✅ CORS headers  
✅ Error cases  

### Running Tests

```bash
# Run all backend tests
cd backend && pnpm test

# Watch mode
cd backend && pnpm test:watch

# With coverage
cd backend && pnpm test:coverage
```

### Example Test

```typescript
describe('POST /api/todos', () => {
  it('creates a new todo and returns 201', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/todos',
      body: JSON.stringify({ title: 'New Todo' }),
    })
    
    expect(response.statusCode).toBe(201)
    expect(JSON.parse(response.body)).toMatchObject({
      title: 'New Todo',
      completed: false,
    })
  })
})
```

---

## 🎭 E2E Tests (Playwright)

### Location
- `e2e/todo.spec.ts` - Full stack integration tests
- `playwright.config.ts` - Playwright configuration

### What's Tested
✅ Complete user flows  
✅ Frontend + Backend + Database integration  
✅ Real browser interactions  
✅ Visual verification  

### Running Tests

```bash
# Run e2e tests
pnpm test

# With UI (browser interface)
pnpm test:ui

# Debug mode
pnpm test:debug
```

---

## 🚀 Running All Tests

```bash
# From project root

# Run unit tests only (frontend + backend)
pnpm test:unit

# Run e2e tests only
pnpm test

# Run everything (unit + e2e)
pnpm test:all
```

---

## 🔄 CI/CD Pipeline

GitHub Actions automatically runs tests on every push/PR:

1. **Lint** - ESLint on frontend
2. **Unit Tests** - Frontend (Vitest) + Backend (Jest)
3. **E2E Tests** - Playwright full stack tests
4. **Matrix Tests** - Node 20 & 22 compatibility

View results: `https://github.com/antoniofextra/my-simple-app/actions`

---

## 📈 Test Pyramid

```
        /\
       /E2E\       ← 3 tests (slow, comprehensive)
      /------\     Playwright
     /  Unit  \    ← 16 tests (fast, focused)
    /----------\   Vitest + Jest
```

**Strategy:**
- Many fast unit tests for individual functions/components
- Few slow e2e tests for critical user flows
- Unit tests catch bugs early (< 1 second feedback)
- E2E tests verify everything works together

---

## 🛠️ Adding New Tests

### Frontend Component Test

Create `frontend/src/MyComponent.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Backend API Test

Add to `backend/src/server.test.ts`:

```typescript
describe('GET /api/new-endpoint', () => {
  it('returns expected data', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/new-endpoint',
    })
    
    expect(response.statusCode).toBe(200)
  })
})
```

### E2E Test

Add to `e2e/todo.spec.ts`:

```typescript
test('new user flow', async ({ page }) => {
  await page.goto('/')
  // Test user interaction
})
```

---

## 📝 Best Practices

✅ **Write tests first** (TDD) when fixing bugs  
✅ **Test behavior, not implementation** - Focus on what users see  
✅ **Keep tests isolated** - Each test should be independent  
✅ **Use descriptive names** - "creates a todo" not "test1"  
✅ **Mock external dependencies** - Don't call real APIs  
✅ **Run tests before committing** - Caught by git hooks  

---

## 🐛 Troubleshooting

### "Module not found" errors
```bash
pnpm install --recursive
```

### Prisma errors in backend tests
```bash
cd backend && pnpm prisma generate
```

### Frontend test timeouts
Check that fetch mocks are set up correctly in beforeEach

### E2E tests fail locally but pass in CI
Make sure both frontend and backend servers are running

---

## 📚 Resources

- [Vitest Docs](https://vitest.dev/)
- [Jest Docs](https://jestjs.io/)
- [Playwright Docs](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)

