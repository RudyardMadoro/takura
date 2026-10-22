import AxeBuilder from '@axe-core/playwright';
import { expect, test, type APIRequestContext } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';

const cleanPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);
const controlledRejectMarker = 'SYNTHETIC_REJECT';

function syntheticPdf(comment: string) {
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 10 10] >>\nendobj\n',
  ];
  let pdf = `%PDF-1.4\n% ${comment}\n`;
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += object;
  }
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 4\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
    .join('')}trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf);
}

function databaseValue(sql: string) {
  return execFileSync(
    'docker',
    [
      'compose',
      'exec',
      '-T',
      'postgres',
      'psql',
      '-At',
      '-U',
      'takura_migrator',
      '-d',
      'takura',
      '-c',
      sql,
    ],
    { encoding: 'utf8' },
  ).trim();
}

async function staffHeaders(request: APIRequestContext, identity: 'editor' | 'reviewer') {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  const authorization = await request.get('http://127.0.0.1:8080/dev-oidc/authorize', {
    maxRedirects: 0,
    params: {
      redirect_uri: 'http://127.0.0.1:4201/auth/callback',
      state: 'phase-06-test-state',
      nonce: 'phase-06-test-nonce',
      code_challenge: challenge,
      login_hint: identity,
      mfa: 'true',
    },
  });
  const code = new URL(authorization.headers()['location']).searchParams.get('code')!;
  const tokenResponse = await request.post('http://127.0.0.1:8080/dev-oidc/token', {
    form: { code, code_verifier: verifier },
  });
  const token = (await tokenResponse.json()).access_token as string;
  const sessionResponse = await request.post('http://127.0.0.1:8080/api/v1/admin/session', {
    headers: { authorization: `Bearer ${token}` },
  });
  const session = (await sessionResponse.json()).session_handle as string;
  return { authorization: `Bearer ${token}`, 'X-Staff-Session': session };
}

test.beforeAll(() => {
  databaseValue("UPDATE takura.upload_session SET risk_hash=lpad(replace(id::text,'-',''),64,'0')");
  databaseValue('DELETE FROM takura.enquiry_abuse_bucket');
});

test('cutting attachment uploads privately and submits while scanning is pending or clean', async ({
  page,
}) => {
  await page.goto('/request-quote?service=BOARD_CUTTING');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Input mode').selectOption('ATTACHMENT');
  await page
    .getByLabel(/Or describe material/)
    .fill('Synthetic customer-supplied cutting material');
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByLabel('Full name').fill('Synthetic Secure Upload Customer');
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('upload@example.invalid');
  await page.getByLabel('Town or suburb').fill('Demo Suburb');
  await page
    .getByLabel('Describe the overall request')
    .fill('Synthetic cutting request with one inert PNG attachment.');
  await page.getByLabel('Plans, photos or cutting list').setInputFiles({
    name: 'synthetic-cutting-reference.png',
    mimeType: 'image/png',
    buffer: cleanPng,
  });

  await expect(
    page.getByText(/1 file\(s\) uploaded and awaiting or passing safety scanning/),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel(/acknowledge the current/).check();
  await page.getByRole('button', { name: 'Submit request' }).click();

  await expect(page.getByRole('heading', { name: 'Request received' })).toBeVisible();
  await expect(page.getByText(/ENQ-2026-/)).toBeVisible();
  await expect(page.locator('body')).not.toContainText('synthetic-cutting-reference.png');
});

test('upload controls remain accessible and private attachment endpoints enforce staff scope', async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/request-quote?service=BOARD_CUTTING');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Input mode').selectOption('ATTACHMENT');
  await page.getByRole('button', { name: 'Continue' }).click();

  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);

  const attachment = databaseValue(
    'SELECT id FROM takura.attachment WHERE enquiry_id IS NOT NULL ORDER BY created_at DESC LIMIT 1',
  );
  const downloadUrl = `http://127.0.0.1:8080/api/v1/admin/attachments/${attachment}/download`;
  const anonymous = await request.get(downloadUrl, { maxRedirects: 0 });
  expect(anonymous.status()).toBe(401);
  const editor = await request.get(downloadUrl, {
    headers: await staffHeaders(request, 'editor'),
    maxRedirects: 0,
  });
  expect(editor.status()).toBe(403);
  const reviewer = await request.get(downloadUrl, {
    headers: await staffHeaders(request, 'reviewer'),
    maxRedirects: 0,
  });
  expect(reviewer.status()).toBe(404);
});

test('late scanner rejection retains the enquiry and creates one replacement event', async ({
  page,
}) => {
  await page.goto('/request-quote?service=BOARD_CUTTING');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Input mode').selectOption('ATTACHMENT');
  await page.getByLabel(/Or describe material/).fill('Synthetic cutting material requiring review');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Full name').fill('Synthetic Rejected Attachment Customer');
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('rejected@example.invalid');
  await page.getByLabel('Town or suburb').fill('Demo Suburb');
  await page
    .getByLabel('Describe the overall request')
    .fill('Synthetic request that exercises late replacement handling.');
  await page.getByLabel('Plans, photos or cutting list').setInputFiles({
    name: 'synthetic-scanner-fixture.pdf',
    mimeType: 'application/pdf',
    buffer: syntheticPdf(controlledRejectMarker),
  });
  await expect(page.getByText(/uploaded and awaiting or passing safety scanning/)).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel(/acknowledge the current/).check();
  await page.getByRole('button', { name: 'Submit request' }).click();
  await expect(page.getByRole('heading', { name: 'Request received' })).toBeVisible();

  await expect
    .poll(
      () =>
        databaseValue(
          "SELECT a.state || '|' || (a.enquiry_id IS NOT NULL) || '|' || count(o.id) FROM takura.attachment a LEFT JOIN takura.notification_outbox o ON o.semantic_key='attachment-replacement:' || a.id WHERE a.expected_checksum_sha256=(SELECT expected_checksum_sha256 FROM takura.attachment ORDER BY created_at DESC LIMIT 1) GROUP BY a.id ORDER BY max(a.created_at) DESC LIMIT 1",
        ),
      { timeout: 20_000 },
    )
    .toBe('REJECTED|true|1');
});

test('cancelling an in-flight upload preserves contact fields and permits an explicit retry', async ({
  page,
}) => {
  await page.goto('/request-quote');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel(/Or describe material/).fill('Synthetic retry material');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Full name').fill('Synthetic Retry Customer');

  let releaseUpload: (() => void) | undefined;
  await page.route('http://localhost:19000/**', async (route) => {
    await new Promise<void>((resolve) => (releaseUpload = resolve));
    await route.continue();
  });
  const file = {
    name: 'synthetic-retry-reference.png',
    mimeType: 'image/png',
    buffer: cleanPng,
  };
  await page.getByLabel('Plans, photos or cutting list').setInputFiles(file);
  await expect(page.getByRole('button', { name: 'Cancel upload' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel upload' }).click();
  releaseUpload?.();
  await expect(page.getByText('Upload cancelled. Select the files again to retry.')).toBeVisible();
  await expect(page.getByLabel('Full name')).toHaveValue('Synthetic Retry Customer');

  await page.unroute('http://localhost:19000/**');
  await page.getByLabel('Plans, photos or cutting list').setInputFiles(file);
  await expect(
    page.getByText(/1 file\(s\) uploaded and awaiting or passing safety scanning/),
  ).toBeVisible();
  await expect(page.getByLabel('Full name')).toHaveValue('Synthetic Retry Customer');
});
