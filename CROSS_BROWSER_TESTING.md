# Cross-Browser Testing Guide

## 🌐 **Why Test Multiple Browsers?**

Different browsers have different rendering engines, JavaScript implementations, and APIs:

| Browser | Engine | Market Share | Notes |
|---------|--------|--------------|-------|
| **Chrome** | Blink | ~65% | Most popular, modern features |
| **Safari** | WebKit | ~20% | iOS default, Safari-specific quirks |
| **Firefox** | Gecko | ~3% | Strong privacy features, different rendering |

**Common Issues:**
- CSS Grid/Flexbox differences
- Date/Time APIs behave differently
- Fetch/Promise implementations vary
- Event handling quirks (especially Safari on iOS)
- Performance characteristics

---

## 🎯 **Where to Test Browsers**

### ✅ **E2E Tests (Playwright)** - Correct Choice

**Location:** `e2e/` directory at root level  
**Why:** Tests run in **real browsers** with real rendering engines

```typescript
// Same test runs in Chrome, Firefox, and Safari
test('create a todo', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('add-button').click()
  // Catches browser-specific bugs!
})
```

### ❌ **NOT Unit Tests**

**Frontend (Vitest):** Runs in jsdom (fake browser), can't catch real browser issues  
**Backend (Jest):** Runs in Node.js, no browser at all

---

## 🔧 **Current Configuration**

### Browsers Configured

```typescript:14:27:playwright.config.ts
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
```

### Test Execution

Each test in `e2e/` runs **3 times** (once per browser):
- ✅ 3 tests × 3 browsers = **9 test runs**
- ⏱️ Takes ~11-12 seconds (parallel execution)

---

## 🚀 **Running Cross-Browser Tests**

### Locally

```bash
# Run all tests in all browsers
pnpm test

# Run tests with UI (see each browser)
pnpm test:ui

# Run tests in specific browser
pnpm exec playwright test --project=chromium
pnpm exec playwright test --project=firefox
pnpm exec playwright test --project=webkit

# Debug in specific browser
pnpm exec playwright test --project=webkit --debug
```

### In CI (GitHub Actions)

Tests automatically run in all 3 browsers on every push:
- ✅ Chromium (Chrome/Edge)
- ✅ Firefox
- ✅ WebKit (Safari)

View results: `https://github.com/antoniofextra/my-simple-app/actions`

---

## 📊 **Test Results Format**

```
Running 9 tests using 4 workers

[chromium] › e2e/todo.spec.ts:4:7 › create todo  ✓
[firefox] › e2e/todo.spec.ts:4:7 › create todo   ✓
[webkit] › e2e/todo.spec.ts:4:7 › create todo    ✓

[chromium] › e2e/todo.spec.ts:37:7 › empty input ✓
[firefox] › e2e/todo.spec.ts:37:7 › empty input  ✓
[webkit] › e2e/todo.spec.ts:37:7 › empty input   ✓

[chromium] › e2e/todo.spec.ts:57:7 › multiple    ✓
[firefox] › e2e/todo.spec.ts:57:7 › multiple     ✓
[webkit] › e2e/todo.spec.ts:57:7 › multiple      ✓

9 passed (11.8s)
```

If Firefox fails but Chrome passes, you know it's a Firefox-specific bug!

---

## 🐛 **Finding Browser-Specific Bugs**

### Example: Safari Date Handling

```typescript
// This might work in Chrome but fail in Safari
test('handles dates correctly', async ({ page }) => {
  await page.goto('/')
  
  const date = await page.locator('[data-testid="created-date"]')
    .textContent()
  
  // Safari might format dates differently!
  expect(date).toMatch(/\d{4}-\d{2}-\d{2}/)
})
```

### Example: CSS Differences

```typescript
test('layout looks correct', async ({ page }) => {
  await page.goto('/')
  
  // Safari might render flexbox differently
  const button = page.locator('button')
  await expect(button).toBeVisible()
  
  // Take screenshot to compare visually
  await expect(page).toHaveScreenshot()
})
```

---

## 🎨 **Best Practices**

### 1. **Test in Real Browsers, Not Simulations**
✅ Use Playwright (real browsers)  
❌ Don't rely on jsdom/jest-dom for browser compatibility

### 2. **Run All Browsers in CI**
```yaml
# .github/workflows/ci.yml
- name: Install Playwright Browsers
  run: pnpm exec playwright install --with-deps chromium firefox webkit
```

### 3. **Use Browser-Specific Conditionals When Needed**
```typescript
test('feature works', async ({ page, browserName }) => {
  if (browserName === 'webkit') {
    // Safari-specific workaround
  }
})
```

### 4. **Test on Real Devices (Mobile)**
```typescript
// playwright.config.ts
projects: [
  {
    name: 'Mobile Safari',
    use: { ...devices['iPhone 13'] },
  },
  {
    name: 'Mobile Chrome',
    use: { ...devices['Pixel 5'] },
  },
]
```

### 5. **Visual Regression Testing**
```typescript
test('UI looks correct', async ({ page }) => {
  await page.goto('/')
  
  // Take screenshot and compare to baseline
  await expect(page).toHaveScreenshot('homepage.png')
})
```

---

## 🔍 **Debugging Browser-Specific Issues**

### Step 1: Identify Which Browser Fails
```bash
pnpm test
# Output shows: [webkit] › test fails ❌
```

### Step 2: Debug in That Browser
```bash
pnpm exec playwright test --project=webkit --debug
```

### Step 3: Inspect in Playwright UI
```bash
pnpm test:ui
# Click on webkit test to see detailed trace
```

### Step 4: Check Browser Console
```typescript
page.on('console', msg => console.log(msg.text()))
```

---

## 📈 **Performance Comparison**

| Metric | Chromium | Firefox | WebKit |
|--------|----------|---------|--------|
| Startup | Fast | Medium | Fast |
| Rendering | Fast | Fast | Medium |
| JavaScript | Fastest | Fast | Fast |
| Memory | High | Medium | Low |

Playwright shows performance metrics per browser in reports.

---

## 🚫 **Common Pitfalls**

### ❌ **Testing Only in Chrome**
```typescript
// BAD: Only catches Chrome bugs
projects: [
  { name: 'chromium' }
]
```

### ✅ **Test in All Major Browsers**
```typescript
// GOOD: Catches cross-browser issues
projects: [
  { name: 'chromium' },
  { name: 'firefox' },
  { name: 'webkit' },
]
```

### ❌ **Using Unit Tests for Browser Compatibility**
```typescript
// BAD: jsdom can't catch real browser bugs
it('works in Safari', () => {
  render(<App />)
  // This doesn't run in Safari!
})
```

### ✅ **Use E2E for Browser Testing**
```typescript
// GOOD: Actually runs in Safari
test('works in Safari', async ({ page }) => {
  await page.goto('/')
  // This DOES run in Safari!
})
```

---

## 🎯 **Testing Strategy**

```
┌─────────────────────────────────────────┐
│  Unit Tests (Vitest/Jest)               │
│  • Logic & functionality                │
│  • jsdom (fake browser)                 │
│  • Fast (< 1s)                          │
│  • ❌ Can't test browser compatibility  │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│  E2E Tests (Playwright)                 │
│  • User flows                           │
│  • Real browsers (Chrome/FF/Safari)     │
│  • Slower (~10s)                        │
│  • ✅ Catches browser-specific bugs     │
└─────────────────────────────────────────┘
```

---

## 📚 **Resources**

- [Playwright Browsers](https://playwright.dev/docs/browsers)
- [Browser Compatibility](https://caniuse.com/)
- [WebKit Quirks](https://webkit.org/status/)
- [Firefox Developer Edition](https://www.mozilla.org/firefox/developer/)

---

## 💡 **Pro Tips**

1. **Add Mobile Browsers** for responsive testing
2. **Use `page.screenshot()`** to visually compare browsers
3. **Enable traces** to debug failed tests: `trace: 'on-first-retry'`
4. **Run webkit tests on CI** even if you develop on Linux (CI can run macOS)
5. **Test critical flows** across browsers, not everything

