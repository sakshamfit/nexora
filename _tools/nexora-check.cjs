// Run against the built preview: node _tools/nexora-check.cjs
// Requires Playwright Chromium installed, or CHROMIUM_EXECUTABLE_PATH.
const {chromium: pw}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await pw.launch({args:['--no-sandbox'],executablePath:process.env.CHROMIUM_EXECUTABLE_PATH || undefined,headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 // The sandbox cannot reach Unsplash. Exercise the built-in initials fallback.
 await page.route('https://images.unsplash.com/**',route=>route.abort());
 await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3000',{waitUntil:'networkidle'});
 assert.match(await page.title(),/NEXORA/);
 const reviews=page.getByRole('group',{name:'Choose a client review'});
 const buttons=reviews.getByRole('button');assert.equal(await buttons.count(),6);
 await reviews.scrollIntoViewIfNeeded();
 await buttons.nth(1).click();
 await page.waitForFunction(()=>document.querySelector('#stories blockquote').textContent.includes('A jewellery shop'));
 assert.equal(await buttons.nth(1).getAttribute('aria-pressed'),'true');
 await buttons.nth(2).focus();await page.keyboard.press('Enter');
 await page.waitForFunction(()=>document.querySelector('#stories blockquote').textContent.includes('Menswear online'));
 await page.emulateMedia({reducedMotion:'no-preference'});
 await buttons.nth(3).click();
 await page.waitForFunction(()=>document.querySelector('#stories blockquote').textContent.includes('Simple to say'));
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('header').getByRole('button').click();
 const dialog=page.getByRole('dialog');await dialog.waitFor();
 await dialog.getByRole('button',{name:'Website',exact:true}).click();
 await dialog.getByPlaceholder('What should we call you?').fill('Preview test');
 const link=dialog.getByRole('link',{name:/Continue on WhatsApp/});
 const href=await link.getAttribute('href');
 assert(href.startsWith('https://wa.me/918604683669?text='),href);
 assert(decodeURIComponent(href).includes('Hi NEXORA!'));
 await page.keyboard.press('Escape');
 for(const width of [320,390,768]) {
   await page.setViewportSize({width,height:900});
   await reviews.scrollIntoViewIfNeeded();
   for(let i=0;i<6;i++) {
     await buttons.nth(i).click();
     await page.waitForFunction(i=>document.querySelectorAll('#stories button')[i].getAttribute('aria-pressed')==='true',i);
     const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
     assert(!overflow,`Horizontal overflow at ${width}px, review ${i}`);
   }
 }
 await page.setViewportSize({width:390,height:900});
 assert.deepEqual(errors,[]);
 console.log('PASS: 6 reviews, click/keyboard switching, animated and reduced-motion modes, avatar fallback, mobile widths 320/390/768, WhatsApp brief +91 8604683669, no runtime errors.');
 await browser.close();
})();
