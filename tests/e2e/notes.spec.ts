import { test, expect, Page } from '@playwright/test';

async function signIn(page: Page) {
  const email = process.env.E2E_USER_EMAIL ?? 'demo@taskloom.app';
  const password = process.env.E2E_USER_PASSWORD ?? 'demo123';

  await page.goto('/sign-in');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(url => url.pathname === '/');
}

test('user captures and manages a note end-to-end', async ({ page }, testInfo) => {
  await signIn(page);

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
