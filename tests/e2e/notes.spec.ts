import { test, expect } from '@playwright/test';

test('user captures and manages a note end-to-end', async ({ page }, testInfo) => {
  await page.goto('/');

  const quickInput = page.getByTestId('quick-add-input');
  await quickInput.fill('Playwright walkthrough #testing #automation');
  await page.getByTestId('quick-add-submit').click();

  await expect(
    page.getByTestId('note-card').filter({ hasText: 'Playwright walkthrough' }),
  ).toBeVisible();

  await page.goto('/notes');
  const searchInput = page.getByTestId('notes-search-input');
  await searchInput.fill('Playwright walkthrough');

  await expect(
    page.getByTestId('note-card').filter({ hasText: 'Playwright walkthrough' }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'Open' }).first().click();
  await expect(page).toHaveURL(/\/notes\/.+/);

  const editorTextarea = page.getByTestId('note-editor-content');
  await editorTextarea.fill('Documenting the end-to-end note flow.');

  await page.getByTestId('note-editor-save').click();
  await expect(page.getByTestId('note-editor-status')).toHaveText(/Saved/);

  await page.getByTestId('note-editor-pin').click();
  await expect(page.getByTestId('note-editor-pin')).toHaveAttribute('aria-pressed', 'true');

  const screenshot = await page.screenshot({ fullPage: true });
  await testInfo.attach('note-editor', { body: screenshot, contentType: 'image/png' });

  await page.goto('/');
  await expect(page.getByTestId('pinned-section')).toContainText('Playwright walkthrough');
});
