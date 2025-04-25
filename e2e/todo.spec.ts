import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Todo App/);
});

test('create new todos', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox').fill('Todo to complete');
  await page.getByRole('button', { name: 'Add' }).click();

  await expect(page.getByText('Todo to complete')).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'Todo to complete' })).toBeVisible();
  await expect(page.getByRole('textbox')).toHaveValue('');
});

test('create new todo with Enter', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox').fill('Todo to complete');
  await page.keyboard.press('Enter');

  await expect(page.getByText('Todo to complete')).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'Todo to complete' })).toBeVisible();
  await expect(page.getByRole('textbox')).toHaveValue('');
});

test('mark todos as completed', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox').fill('Todo to complete');
  await page.getByRole('button', { name: 'Add' }).click();

  const todoItem = page.getByRole('listitem').filter({ hasText: 'Todo to complete' });
  await todoItem.getByRole('checkbox').click();

  await expect(todoItem.getByRole('checkbox')).toBeChecked();
  await expect(todoItem.getByText('Todo to complete')).toHaveCSS('text-decoration', /line-through/);
});

test('nothing to archive', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox').fill('Todo to complete');
  await page.getByRole('button', { name: 'Add' }).click();

  let dialogMessage = '';
  page.on('dialog', async (dialog) => {
    dialogMessage = dialog.message(); // capture the dialog message
    await dialog.accept(); // accept the dialog
  });

  await page.getByRole('button', { name: 'Archive Completed Items' }).click();

  expect(dialogMessage).toContain('Nothing to archive.');
});