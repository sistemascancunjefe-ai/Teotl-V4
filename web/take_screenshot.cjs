const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();

  // Wait for load
  await page.goto('http://localhost:3001');
  await new Promise(r => setTimeout(r, 2000));

  // Take screenshot 1 (base state)
  await page.screenshot({path: 'screenshot_base.png'});

  // Click increase button 3 times
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const increaseBtn = btns.find(b => b.textContent.includes('EMBRACE NIGHTMARE'));
      if (increaseBtn) increaseBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
  }

  // Take screenshot 2 (nightmare state)
  await page.screenshot({path: 'screenshot_nightmare.png'});

  await browser.close();

  const base64Base = fs.readFileSync('screenshot_base.png', {encoding: 'base64'});
  const base64Nightmare = fs.readFileSync('screenshot_nightmare.png', {encoding: 'base64'});

  console.log('BASE_STATE:', base64Base.substring(0, 100) + '...');
  console.log('NIGHTMARE_STATE:', base64Nightmare.substring(0, 100) + '...');
})();
