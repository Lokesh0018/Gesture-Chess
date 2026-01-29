const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  // Wait a few seconds to let setInterval run
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const debugText = await page.evaluate(() => {
    const el = document.querySelector('h3');
    return el ? el.innerText : 'NO DEBUG TEXT';
  });
  
  console.log('DEBUG TEXT ON PAGE:', debugText);
  
  await browser.close();
})();
