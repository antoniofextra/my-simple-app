import { test, expect } from '@playwright/test'

test.describe('Todo App', () => {
  // Clean up database before each test to avoid flakiness
  test.beforeEach(async ({ request }) => {
    await request.delete('http://localhost:4000/api/todos')
  })

  test('create a todo, see it listed, then delete it', async ({ page }) => {
    // Navigate to the app
    await page.goto('/')

    // Wait for the page to be ready
    await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible()

    // Create a new todo
    const todoTitle = `Test Todo ${Date.now()}`
    await page.getByTestId('todo-input').fill(todoTitle)
    await page.getByTestId('add-button').click()

    // Wait for the todo to appear in the list
    await expect(page.getByText(todoTitle)).toBeVisible()

    // Verify the todo is in the list by finding its container
    const todoItem = page.locator(`li:has-text("${todoTitle}")`)
    await expect(todoItem).toBeVisible()

    // Get the todo ID from the data-testid attribute
    const todoTestId = await todoItem.getAttribute('data-testid')
    expect(todoTestId).toMatch(/^todo-\d+$/)

    // Extract the ID from the testid (e.g., "todo-123" -> "123")
    const todoId = todoTestId?.replace('todo-', '')

    // Delete the todo
    await page.getByTestId(`delete-${todoId}`).click()

    // Verify the todo is no longer visible (with automatic retry)
    await expect(page.getByText(todoTitle)).not.toBeVisible({ timeout: 10000 })
  })

  test('create a todo with location and verify it is displayed', async ({ page }) => {
    // Navigate to the app
    await page.goto('/')

    // Wait for the page to be ready
    await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible()

    // Create a new todo with location
    const todoTitle = `Todo with location ${Date.now()}`
    const todoLocation = 'Office'
    await page.getByTestId('todo-input').fill(todoTitle)
    await page.getByTestId('location-input').fill(todoLocation)
    await page.getByTestId('add-button').click()

    // Wait for the todo to appear in the list
    await expect(page.getByText(todoTitle)).toBeVisible()
    
    // Verify the location is also displayed
    const todoItem = page.locator(`li:has-text("${todoTitle}")`)
    await expect(todoItem.getByText(todoLocation)).toBeVisible()

    // Clean up: delete the todo
    const todoTestId = await todoItem.getAttribute('data-testid')
    const todoId = todoTestId?.replace('todo-', '')
    await page.getByTestId(`delete-${todoId}`).click()
    
    await expect(page.getByText(todoTitle)).not.toBeVisible({ timeout: 10000 })
  })

  test('create a todo without location', async ({ page }) => {
    // Navigate to the app
    await page.goto('/')

    // Wait for the page to be ready
    await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible()

    // Create a new todo without location
    const todoTitle = `Todo without location ${Date.now()}`
    await page.getByTestId('todo-input').fill(todoTitle)
    // Don't fill location field - leave it empty
    await page.getByTestId('add-button').click()

    // Wait for the todo to appear in the list
    await expect(page.getByText(todoTitle)).toBeVisible()

    // Verify the location field is not displaying any location text
    const todoItem = page.locator(`li:has-text("${todoTitle}")`)
    
    // Clean up: delete the todo
    const todoTestId = await todoItem.getAttribute('data-testid')
    const todoId = todoTestId?.replace('todo-', '')
    await page.getByTestId(`delete-${todoId}`).click()
    
    await expect(page.getByText(todoTitle)).not.toBeVisible({ timeout: 10000 })
  })

  test('location field respects max 20 character limit', async ({ page }) => {
    // Navigate to the app
    await page.goto('/')

    // Wait for the page to be ready
    await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible()

    // Try to fill location with more than 20 characters
    const longLocation = 'This is a very long location text'
    const todoTitle = `Todo with long location ${Date.now()}`
    
    await page.getByTestId('todo-input').fill(todoTitle)
    await page.getByTestId('location-input').fill(longLocation)

    // Verify the input field only contains 20 characters
    const locationInputValue = await page.getByTestId('location-input').inputValue()
    expect(locationInputValue.length).toBeLessThanOrEqual(20)

    // Create the todo
    await page.getByTestId('add-button').click()

    // Wait for the todo to appear
    await expect(page.getByText(todoTitle)).toBeVisible()

    // Clean up: delete the todo
    const todoItem = page.locator(`li:has-text("${todoTitle}")`)
    const todoTestId = await todoItem.getAttribute('data-testid')
    const todoId = todoTestId?.replace('todo-', '')
    await page.getByTestId(`delete-${todoId}`).click()
    
    await expect(page.getByText(todoTitle)).not.toBeVisible({ timeout: 10000 })
  })

  test('empty input does not create a todo', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible()

    // Count existing todos
    const initialTodos = await page.locator('li[data-testid^="todo-"]').count()

    // Try to submit with empty input
    await page.getByTestId('add-button').click()

    // Wait a bit to ensure no new todo is created
    await page.waitForTimeout(500)

    // Count todos again
    const finalTodos = await page.locator('li[data-testid^="todo-"]').count()

    // Should be the same
    expect(finalTodos).toBe(initialTodos)
  })

  test('multiple todos can be created and deleted independently', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible()

    // Create three todos
    const todos = [
      `First Todo ${Date.now()}`,
      `Second Todo ${Date.now()}`,
      `Third Todo ${Date.now()}`,
    ]

    for (const todo of todos) {
      await page.getByTestId('todo-input').fill(todo)
      await page.getByTestId('add-button').click()
      await expect(page.getByText(todo)).toBeVisible()
    }

    // Verify all three are visible
    for (const todo of todos) {
      await expect(page.getByText(todo)).toBeVisible()
    }

    // Delete the middle one
    const middleTodo = page.locator(`li:has-text("${todos[1]}")`)
    const middleTodoTestId = await middleTodo.getAttribute('data-testid')
    const middleTodoId = middleTodoTestId?.replace('todo-', '')
    
    await page.getByTestId(`delete-${middleTodoId}`).click()

    // Verify middle todo is gone but others remain
    await expect(page.getByText(todos[1])).not.toBeVisible({ timeout: 10000 })
    await expect(page.getByText(todos[0])).toBeVisible()
    await expect(page.getByText(todos[2])).toBeVisible()
  })

  test('Delete All button appears when todos exist and is hidden when empty', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible()

    // Initially, Delete All button should not be visible (assuming empty list)
    const initialDeleteAllButton = page.getByTestId('delete-all-button')
    
    // Create a todo
    const todoTitle = `Test Todo ${Date.now()}`
    await page.getByTestId('todo-input').fill(todoTitle)
    await page.getByTestId('add-button').click()
    await expect(page.getByText(todoTitle)).toBeVisible()

    // Now Delete All button should be visible
    await expect(initialDeleteAllButton).toBeVisible()

    // Click Delete All
    await initialDeleteAllButton.click()

    // Verify todo is gone
    await expect(page.getByText(todoTitle)).not.toBeVisible({ timeout: 10000 })

    // Delete All button should no longer be visible
    await expect(initialDeleteAllButton).not.toBeVisible({ timeout: 10000 })
  })

  test('Delete All button removes all todos', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible()

    // Create multiple todos
    const todos = [
      `Todo A ${Date.now()}`,
      `Todo B ${Date.now()}`,
      `Todo C ${Date.now()}`,
    ]

    for (const todo of todos) {
      await page.getByTestId('todo-input').fill(todo)
      await page.getByTestId('add-button').click()
      await expect(page.getByText(todo)).toBeVisible()
    }

    // Verify all todos are visible
    for (const todo of todos) {
      await expect(page.getByText(todo)).toBeVisible()
    }

    // Click Delete All
    await page.getByTestId('delete-all-button').click()

    // Verify all todos are gone
    for (const todo of todos) {
      await expect(page.getByText(todo)).not.toBeVisible({ timeout: 10000 })
    }

    // Verify no todo items exist
    const todoItems = page.locator('li[data-testid^="todo-"]')
    await expect(todoItems).toHaveCount(0)
  })
})

