import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const { chromium } = await import(pathToFileURL('C:/Users/leone/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs').href);

const baseUrl = 'http://127.0.0.1:5173/';
const rawDir = 'showcase-assets/raw-v10';
const today = new Date();
const isoDate = (offset) => {
  const date = new Date(today);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const waitForFonts = (page) => page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([
    document.fonts.load('400 16px Inter'),
    document.fonts.load('700 16px Inter'),
    document.fonts.load('500 16px Manrope'),
    document.fonts.load('800 32px Manrope'),
  ]);
  if (!document.fonts.check('400 16px Inter') || !document.fonts.check('800 32px Manrope')) {
    throw new Error('Expected webfonts were not ready before capture');
  }
});
const field = (page, label) => label === 'Expiration date'
  ? page.getByRole('textbox', { name: label, exact: true })
  : page.getByLabel(label, { exact: false }).first();
const waitForRowText = async (page, medicationName, text) => {
  const row = page.locator('tbody tr').filter({ hasText: medicationName });
  await row.waitFor();
  if (!(await row.innerText()).includes(text)) throw new Error(`${medicationName} did not show ${text}`);
};

const medications = [
  ['Paracetamol 500mg', 'DEMO-HEALTHY', '24', '5', isoDate(120)],
  ['Ibuprofen 400mg', 'DEMO-LOW-01', '2', '5', isoDate(120)],
  ['Vitamin C 1g', 'DEMO-EXPIRING', '18', '5', isoDate(20)],
  ['Aspirin 100mg', 'DEMO-EXPIRED', '12', '5', isoDate(-30)],
];

async function addMedication(page, [name, batch, quantity, minimumStock, expiration]) {
  await page.getByRole('button', { name: 'Add medication', exact: true }).click();
  await wait(650);
  await wait(650);
  await field(page, 'Commercial name / active ingredient').fill(name);
  await field(page, 'Batch number').fill(batch);
  await field(page, 'Manufacturer').fill('Medication Inventory Labs');
  await field(page, 'Initial stock').fill(quantity);
  await field(page, 'Minimum stock').fill(minimumStock);
  await field(page, 'Expiration date').fill(expiration);
  await wait(350);
  await wait(350);
  await page.getByRole('button', { name: 'Save medication', exact: true }).click();
  await page.getByRole('heading', { name: 'Dashboard', exact: true }).waitFor();
  await wait(900);
}

let browser;
let context;
let page;
try {
  await mkdir(rawDir, { recursive: true });
  browser = await chromium.launch({ headless: true, slowMo: 140, timeout: 15000 });
  context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: rawDir, size: { width: 1440, height: 900 } },
  });
  await context.setDefaultTimeout(8000);
  await context.setDefaultNavigationTimeout(15000);
  await context.addInitScript(() => localStorage.removeItem('medication-inventory-data'));
  page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') pageErrors.push(message.text());
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await waitForFonts(page);
  await wait(300);
  for (const medication of medications) await addMedication(page, medication);

  const stats = await page.locator('section').first().innerText();
  const normalizedStats = stats.replace(/\s+/g, ' ').toLowerCase();
  for (const expected of ['total medications 4', 'healthy 1', 'low stock 1', 'expiring 30d 1', 'expired 1']) {
    if (!normalizedStats.includes(expected)) throw new Error(`Unexpected dashboard metric: ${expected}`);
  }
  for (const expected of ['healthy', 'low stock', 'expiring soon', 'expired']) {
    if ((await page.getByText(expected, { exact: true }).count()) === 0) throw new Error(`Missing status: ${expected}`);
  }
  await wait(1500);

  const search = field(page, 'Search medications');
  await search.fill('Ibuprofen');
  await page.getByText('Ibuprofen 400mg', { exact: true }).waitFor();
  await wait(1200);

  await page.getByRole('button', { name: 'Add stock to Ibuprofen 400mg' }).click();
  await wait(850);
  await field(page, 'Quantity').fill('8');
  await wait(450);
  await page.getByRole('button', { name: 'Add units', exact: true }).click();
  await wait(650);
  await waitForRowText(page, 'Ibuprofen 400mg', '10 units');
  await wait(1600);

  await page.getByRole('button', { name: 'Remove stock from Ibuprofen 400mg' }).click();
  await wait(850);
  await field(page, 'Quantity').fill('3');
  await wait(450);
  await page.getByRole('button', { name: 'Remove units', exact: true }).click();
  await wait(650);
  await waitForRowText(page, 'Ibuprofen 400mg', '7 units');
  await wait(1600);

  await page.getByRole('button', { name: 'Edit Ibuprofen 400mg' }).click();
  await wait(1100);
  await page.getByRole('heading', { name: 'Edit medication', exact: true }).waitFor();
  await field(page, 'Manufacturer').fill('Medication Inventory Health Labs');
  await wait(750);
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await page.getByText('Medication Inventory Health Labs', { exact: true }).waitFor();
  await wait(1800);

  await page.getByRole('button', { name: 'Delete Ibuprofen 400mg' }).click();
  await page.getByRole('heading', { name: 'Delete medication?' }).waitFor();
  await wait(1400);
  await page.getByRole('button', { name: 'Delete medication', exact: true }).click();
  await page.getByText('Ibuprofen 400mg', { exact: true }).waitFor({ state: 'detached' });
  await wait(1600);
  const afterFilteredDelete = (await page.locator('section').first().innerText()).replace(/\s+/g, ' ').toLowerCase();
  for (const expected of ['total medications 3', 'healthy 1', 'low stock 0', 'expiring 30d 1', 'expired 1']) {
    if (!afterFilteredDelete.includes(expected)) throw new Error(`Unexpected metric after filtered delete: ${expected}`);
  }
  await search.fill('');
  await wait(1200);
  if ((await search.inputValue()) !== '') throw new Error('Search filter did not clear');
  if ((await page.locator('tbody tr').count()) !== 3) throw new Error('Final inventory does not contain three medications');

  if (pageErrors.length) throw new Error(`Application errors during capture: ${pageErrors.join(' | ')}`);
  console.log('Capture flow completed successfully.');
} finally {
  if (context) await context.close().catch(() => undefined);
  if (browser) await browser.close().catch(() => undefined);
}
