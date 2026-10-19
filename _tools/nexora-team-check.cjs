// Run against the built preview. Supports TEST_URL and CHROMIUM_EXECUTABLE_PATH.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox'],
    executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || undefined,
  });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://images.unsplash.com/**', route => route.abort());
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3000', { waitUntil: 'networkidle' });
      const team = page.locator('#team');
      await team.scrollIntoViewIfNeeded();
      assert.equal(await team.getByRole('button', { name: /Go to testimonial/ }).count(), 2);
      await team.getByRole('button', { name: 'Next testimonial', exact: true }).click();
      await team.getByRole('heading', { name: 'Raees Alam', exact: true }).waitFor({ state: 'visible' });
      const portrait = team.getByRole('img', { name: 'Raees Alam', exact: true });
      await portrait.waitFor({ state: 'visible' });
      assert.equal(await portrait.getAttribute('src'), '/team/raees-alam.jpg');
      await page.waitForFunction(() => [...document.querySelectorAll('#team img')].filter(img => img.alt === 'Raees Alam').every(img => img.complete && img.naturalWidth > 0));
      assert(!(await team.textContent()).match(/Sudhir|Sudheer|Shivam/));
      await team.getByRole('button', { name: 'Next testimonial', exact: true }).click();
      await team.getByRole('heading', { name: 'Anshuman Pandey', exact: true }).waitFor({ state: 'visible' });
      await team.getByRole('button', { name: 'Previous testimonial', exact: true }).click();
      await team.getByRole('heading', { name: 'Raees Alam', exact: true }).waitFor({ state: 'visible' });
    }
    assert.deepEqual(errors, []);
    console.log('PASS: two team profiles; Raees portrait loads; old co-founders absent; forward/backward wrap works on desktop and mobile.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
