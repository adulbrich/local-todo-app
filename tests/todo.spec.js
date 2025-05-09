import { test as base, expect } from '@playwright/test';

const test = base.extend({
	todoPage: async ({ page }, use) => {
		await page.goto('/');
		await use(page);
	},
	todoPageWithItem: async ({ page }, use) => {
		await page.goto('/');
		await page.getByRole('textbox').fill('Test todo item');
		await page.getByRole('button', { name: 'Add' }).click();
		await expect(page.getByRole('listitem').filter({ hasText: 'Test todo item' })).toBeVisible();
		await use({
			page,
			todoItem: page.getByRole('listitem').filter({ hasText: 'Test todo item' })
		});
	}
});

test('has title', async ({ page }) => {
	// await page.goto('http://localhost:4173/');
	await page.goto('/'); // after setting baseURL in playwright.config.ts

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

test.describe('todos with hooks', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.getByRole('textbox').fill('Todo to complete');
		await page.getByRole('button', { name: 'Add' }).click();
	});
	test('create new todo', async ({ page }) => {
		await expect(page.getByText('Todo to complete')).toBeVisible();
		await expect(page.getByRole('listitem').filter({ hasText: 'Todo to complete' })).toBeVisible();
		await expect(page.getByRole('textbox')).toHaveValue('');
	});
});

test('create new todo with fixture', async ({ todoPage: page }) => {
	await page.getByRole('textbox').fill('Todo to complete');
	await page.getByRole('button', { name: 'Add' }).click();

	await expect(page.getByText('Todo to complete')).toBeVisible();
	await expect(page.getByRole('listitem').filter({ hasText: 'Todo to complete' })).toBeVisible();
	await expect(page.getByRole('textbox')).toHaveValue('');
});

test('mark todos as completed with fixture', async ({ todoPageWithItem: { page, todoItem } }) => {
	await todoItem.getByRole('checkbox').click();
	await expect(todoItem.getByRole('checkbox')).toBeChecked();
	await expect(todoItem.getByText('Test todo item')).toHaveCSS('text-decoration', /line-through/);
});

test('create new todo with snapshot', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('textbox').fill('Todo to complete');
	await page.getByRole('button', { name: 'Add' }).click();

	await expect(page.getByText('Todo to complete')).toBeVisible();
	await expect(page.getByRole('listitem').filter({ hasText: 'Todo to complete' })).toBeVisible();
	await expect(page.getByRole('textbox')).toHaveValue('');

	// first time to generate ARIA snapshot
	// await expect(page.locator('body')).toMatchAriaSnapshot('');

	await expect(page.locator('body')).toMatchAriaSnapshot(`
        - heading \"Todo List\"
        - textbox \"Add a new todo\"
        - button \"Add\":
            - img
            - text: Add
        - list:
            - listitem:
                - checkbox
                - text: Todo to complete
                - button \"Delete\"
        - button \"Archive Completed Items\":
          - img
          - text: Archive Completed Items
        - button \"View Archive\":
          - img
          - text: View Archive
    `);
});
