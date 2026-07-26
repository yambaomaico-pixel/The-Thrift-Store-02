const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Listen to console logs
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  // Handle alerts
  page.on('dialog', async dialog => {
    console.log('DIALOG OPENED:', dialog.type(), dialog.message());
    await dialog.accept();
  });

  await page.goto('https://yambaomaico-pixel.github.io/The-Thrift-Store-02/#/', { waitUntil: 'networkidle2' });
  
  console.log("Page loaded. Waiting for cards to appear...");
  await page.waitForSelector('.card');
  
  console.log("Using page.evaluate to find the exact DOM element and its bounding box...");
  const rect = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.btn-primary'));
    const addToCartBtn = btns.find(b => b.textContent.includes('Add to Cart'));
    if (!addToCartBtn) return null;
    const {x, y, width, height} = addToCartBtn.getBoundingClientRect();
    return {x, y, width, height};
  });
  
  if (rect) {
    console.log("Button bounding box:", rect);
    console.log("Moving mouse and clicking at center...");
    await page.mouse.click(rect.x + rect.width / 2, rect.y + rect.height / 2);
    console.log("Physical mouse click executed.");
  } else {
    console.log("Add to Cart button not found in DOM");
  }
  
  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
})();
