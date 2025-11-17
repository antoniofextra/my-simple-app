import { test, expect } from '@playwright/test'

test.describe('Todo App', () => {
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
})

