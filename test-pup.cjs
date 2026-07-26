const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  try {
    console.log("Navigating to register...");
    await page.goto('http://localhost:5173/#/register', { waitUntil: 'networkidle2' });
    
    // Register
    await page.type('input[type="text"]', 'Test User');
    const randomEmail = `test${Date.now()}@test.com`;
    await page.type('input[type="email"]', randomEmail);
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log("Registered and logged in as", randomEmail);
    
    // Add item to cart
    console.log("Going to shop...");
    await page.goto('http://localhost:5173/#/shop', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.btn-primary');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.btn-primary'));
      const addBtn = btns.find(b => b.textContent.includes('Add to Cart'));
      if (addBtn) addBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    
    // Checkout
    console.log("Going to checkout...");
    await page.goto('http://localhost:5173/#/checkout', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[type="text"]');
    await page.type('input[type="text"]', '123 Test St');
    await page.type('input[type="tel"]', '1234567890');
    // Fill out city and zip using querySelectorAll since there are multiple text inputs
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="text"]');
      if (inputs.length > 1) inputs[1].value = 'Test City';
      if (inputs.length > 2) inputs[2].value = '12345';
      
      // Dispatch events so React picks it up
      if (inputs.length > 1) inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
      if (inputs.length > 2) inputs[2].dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 2000));
    
    // Check Profile
    console.log("Going to profile...");
    await page.goto('http://localhost:5173/#/profile', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    
    const pageText = await page.evaluate(() => document.body.innerText);
    console.log("PROFILE PAGE CONTAINS 'Test St'?", pageText.includes('Test St'));
    console.log("PROFILE PAGE CONTAINS 'Order ID:'?", pageText.includes('Order ID:'));
    console.log("PROFILE PAGE CONTAINS 'You have no recent orders'?", pageText.includes('You have no recent orders'));
    
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
