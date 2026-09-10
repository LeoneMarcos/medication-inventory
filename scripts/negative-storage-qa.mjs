import { pathToFileURL } from 'node:url';

async function resolvePlaywright() {
  if (process.env.PLAYWRIGHT_PATH) {
    try {
      const mod = await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href);
      if (mod.chromium) return mod;
    } catch {
      const mod = await import(process.env.PLAYWRIGHT_PATH);
      if (mod.chromium) return mod;
    }
  }
  try {
    const mod = await import('playwright');
    if (mod.chromium) return mod;
  } catch {
    // fallback
  }
  throw new Error('Playwright not found. Install playwright or specify PLAYWRIGHT_PATH environment variable.');
}

const { chromium } = await resolvePlaywright();

const baseUrl = process.env.BASE_URL || process.env.SHOWCASE_BASE_URL || 'http://127.0.0.1:4181/';

async function runNegativeQA() {
  console.log('Starting negative storage QA tests...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Clean initial state
  await page.goto(baseUrl);
  await page.evaluate(() => {
    localStorage.clear();
    window.location.reload();
  });
  await page.waitForLoadState('networkidle');

  console.log('Page loaded. Installing storage failure mock...');

  // Setup storage hook that can fail conditionally
  await page.evaluate(() => {
    window.__mockFailStorage = false;
    const origSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, _val) {
      if (window.__mockFailStorage && key === 'medication-inventory-data') {
        const err = new Error('Quota exceeded');
        err.name = 'QuotaExceededError';
        throw err;
      }
      return origSetItem.apply(this, arguments);
    };
  });

  // 1. TEST CREATION FAILURE & RETRY
  console.log('--- 1. Testing Medication Creation under QuotaExceededError ---');
  await page.getByRole('button', { name: 'Add medication' }).first().click();
  await page.waitForSelector('form');

  // Fill in form
  await page.locator('#name').fill('Negative QA Med');
  await page.locator('#batch').fill('QA-FAIL-01');
  await page.locator('#quantity').fill('25');
  await page.locator('#minimumStock').fill('5');
  await page.locator('#expirationDate').fill('2027-09-15');

  // Enable storage failure
  await page.evaluate(() => { window.__mockFailStorage = true; });

  // Submit form
  await page.getByRole('button', { name: 'Save medication' }).click();

  // Assertions for creation failure:
  const errorVisible = await page.locator('[role="alert"], .notification-error').first().isVisible();
  const rowCountFail = await page.locator('tbody tr:has-text("Negative QA Med")').count();
  const rowAppeared = rowCountFail > 0;
  const formModalVisible = await page.locator('form:has(#name)').isVisible();
  const formNameRetained = (await page.locator('#name').inputValue()) === 'Negative QA Med';
  const formRetained = formModalVisible && formNameRetained;

  console.log(`Creation failure check: errorVisible=${errorVisible}, rowAppeared=${rowAppeared}, formRetained=${formRetained}`);

  if (!errorVisible || rowAppeared || !formRetained) {
    throw new Error(`Creation storage failure test failed: errorVisible=${errorVisible}, rowAppeared=${rowAppeared}, formRetained=${formRetained}`);
  }

  // Test Retry for Creation
  console.log('Testing creation retry after storage restored...');
  await page.evaluate(() => { window.__mockFailStorage = false; });
  await page.getByRole('button', { name: 'Save medication' }).click();

  // Wait for modal to close and row to appear
  await page.waitForSelector('tbody tr:has-text("Negative QA Med")');
  const rowCountSuccess = await page.locator('tbody tr:has-text("Negative QA Med")').count();
  console.log(`Creation retry success: rowCount=${rowCountSuccess}`);

  // 2. TEST STOCK MOVEMENT (+ ADD) FAILURE & RETRY
  console.log('--- 2. Testing Stock Movement under QuotaExceededError ---');
  const targetRow = page.locator('tbody tr:has-text("Negative QA Med")');
  await targetRow.getByRole('button', { name: /Add|Plus/i }).first().click();

  await page.waitForSelector('#movement-amount');
  await page.locator('#movement-amount').fill('10');

  // Enable failure
  await page.evaluate(() => { window.__mockFailStorage = true; });
  await page.getByRole('button', { name: 'Add units' }).click();

  // Check movement failure
  const movementModalVisible = await page.locator('#movement-amount').isVisible();
  const movementErrorVisible = await page.locator('#movement-amount-error, [role="alert"]').first().isVisible();
  const qtyAfterFailText = await targetRow.locator('td').nth(2).innerText();
  console.log(`Movement failure check: modalVisible=${movementModalVisible}, errorVisible=${movementErrorVisible}, qtyText=${qtyAfterFailText}`);

  if (!movementModalVisible || !movementErrorVisible || !qtyAfterFailText.includes('25')) {
    throw new Error('Movement storage failure test failed!');
  }

  // Test Retry for Movement
  console.log('Testing movement retry after storage restored...');
  await page.evaluate(() => { window.__mockFailStorage = false; });
  await page.getByRole('button', { name: 'Add units' }).click();

  await page.waitForSelector('#movement-amount', { state: 'detached' });
  await page.waitForFunction(() => {
    const text = document.querySelector('tbody tr')?.innerText || '';
    return text.includes('35');
  });
  console.log('Movement retry success: stock updated to 35 units.');

  // 3. TEST DELETION FAILURE & RETRY
  console.log('--- 3. Testing Deletion under QuotaExceededError ---');
  await targetRow.getByRole('button', { name: /Delete/i }).click();
  await page.waitForSelector('.delete-description');

  // Enable failure
  await page.evaluate(() => { window.__mockFailStorage = true; });
  await page.getByRole('button', { name: 'Delete medication' }).click();

  // Check deletion failure
  const deleteModalVisible = await page.locator('.delete-description').isVisible();
  const deleteErrorVisible = await page.locator('.notification-error, [role="alert"]').first().isVisible();
  const rowStillThere = (await page.locator('tbody tr:has-text("Negative QA Med")').count()) > 0;
  console.log(`Deletion failure check: modalVisible=${deleteModalVisible}, errorVisible=${deleteErrorVisible}, rowStillThere=${rowStillThere}`);

  if (!deleteModalVisible || !deleteErrorVisible || !rowStillThere) {
    throw new Error('Deletion storage failure test failed!');
  }

  // Test Retry for Deletion
  console.log('Testing deletion retry after storage restored...');
  await page.evaluate(() => { window.__mockFailStorage = false; });
  await page.getByRole('button', { name: 'Delete medication' }).click();

  await page.waitForSelector('.delete-description', { state: 'detached' });
  const rowCountAfterDelete = await page.locator('tbody tr:has-text("Negative QA Med")').count();
  console.log(`Deletion retry success: rowCount=${rowCountAfterDelete}`);

  if (rowCountAfterDelete !== 0) {
    throw new Error('Medication was not deleted on retry!');
  }

  await browser.close();
  console.log('ALL NEGATIVE STORAGE QA CHECKS PASSED PERFECTLY!');
}

runNegativeQA().catch((err) => {
  console.error('QA Test Failure:', err);
  process.exit(1);
});
