import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';

const fixtureId = '07000000-0000-4000-8000-000000000001';
const fixtureReference = 'ENQ-2026-PHASE07';

function databaseCommand(sql: string) {
  return execFileSync(
    'docker',
    [
      'compose',
      'exec',
      '-T',
      'postgres',
      'psql',
      '-v',
      'ON_ERROR_STOP=1',
      '-U',
      'takura_migrator',
      '-d',
      'takura',
      '-c',
      sql,
    ],
    { encoding: 'utf8' },
  );
}

async function signInAsDemoOwner(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/(auth\/callback|unauthorized)/);
  if (new URL(page.url()).pathname === '/unauthorized') await page.goto('/auth/callback');
  await page.getByRole('button', { name: 'Continue after provider sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Staff workspace' })).toBeVisible();
  await page.getByRole('link', { name: 'Boards inbox' }).click();
  await expect(page.getByRole('heading', { name: 'Lead operations' })).toBeVisible();
  await expect(page.getByRole('button', { name: `Review ${fixtureReference}` })).toBeVisible();
}

async function expectNoHorizontalPageOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
}

test.beforeAll(() => {
  databaseCommand(`
    INSERT INTO takura.enquiry(
      id, reference, state, team_code, full_name, email, preferred_contact,
      country_code, town_or_suburb, description, privacy_notice_version,
      privacy_acknowledged_at, created_at, first_response_due_at
    ) VALUES (
      '${fixtureId}', '${fixtureReference}', 'NEW', 'BOARDS',
      'Synthetic Phase Seven Person', 'phase07@example.invalid', 'EMAIL',
      'ZA', 'Synthetic Area', 'Synthetic lead operations accessibility fixture.',
      'demo-v1', now(), now(), now() - interval '1 hour'
    ) ON CONFLICT (id) DO UPDATE SET
      state='NEW', team_code='BOARDS', owner_identity_id=NULL,
      first_human_response_at=NULL, first_response_due_at=now() - interval '1 hour';
    DELETE FROM takura.enquiry_activity WHERE enquiry_id='${fixtureId}';
  `);
});

test.afterAll(() => {
  databaseCommand(`DELETE FROM takura.enquiry WHERE id='${fixtureId}';`);
});

test.describe('Phase 07 staff operations accessibility', () => {
  test('narrow staff workflow has screen-reader semantics and no axe violations', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await signInAsDemoOwner(page);
    await expectNoHorizontalPageOverflow(page);

    const tree = await page.locator('body').ariaSnapshot();
    expect(tree).toContain('Lead operations');
    expect(tree).toContain('Lead filters');
    expect(tree).toContain(`Review ${fixtureReference}`);

    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
  });

  test('native command dialog traps focus, closes with Escape and restores focus', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 760 });
    await signInAsDemoOwner(page);
    await page.getByRole('button', { name: `Review ${fixtureReference}` }).click();

    const opener = page.getByRole('button', { name: 'Record human activity' });
    await opener.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Record human activity' });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(':focus')).toBeVisible();

    for (let index = 0; index < 4; index += 1) {
      await page.keyboard.press('Tab');
      await expect(dialog.locator(':focus')).toBeVisible();
    }
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeInViewport();
    await expect(dialog.getByRole('button', { name: 'Record activity' })).toBeInViewport();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('200 percent zoom reflows focused command controls', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await signInAsDemoOwner(page);
    await page.getByRole('button', { name: `Review ${fixtureReference}` }).click();
    await page.locator('html').evaluate((element) => {
      element.style.zoom = '200%';
    });
    await expectNoHorizontalPageOverflow(page);

    const command = page.getByRole('button', { name: 'Record human activity' });
    await command.focus();
    await expect(command).toBeInViewport();
  });
});
