import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// this test is expected to fail because the website is not super accessible
test.describe('cs362 homepage', () => {
	test('should not have any automatically detectable accessibility issues', async ({ page }) => {
		await page.goto('https://cs362.alexulbrich.com/');

		const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

		expect(accessibilityScanResults.violations).toEqual([]);
	});
});
