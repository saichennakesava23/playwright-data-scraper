// Load environment variables
require('dotenv').config();
const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL;
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
const SESSION_FILE = 'session.json';
const OUTPUT_FILE = 'products.json';

(async () => {
    let browser, context, page;

    try {
        // Launch browser with increased timeout
        browser = await chromium.launch({ headless: false, timeout: 120000 }); 
        context = await browser.newContext();

        // Reuse session if it exists
        if (fs.existsSync(SESSION_FILE)) {
            console.log('Session found. Reusing it...');
            const sessionData = JSON.parse(fs.readFileSync(SESSION_FILE));
            await context.addCookies(sessionData);
        } else {
            console.log('No session found. Logging in...');
            
            // Login process
            page = await context.newPage();
            await page.goto(`${BASE_URL}/login`, { waitUntil: 'load', timeout: 60000 });

            // Fill login form
            await page.fill('input[name="email"], input#email, [placeholder="Email"]', EMAIL);
            await page.fill('input[name="password"], input#password, [placeholder="Password"]', PASSWORD);
            await page.click('button[type="submit"], button:has-text("Login")');

            // Wait until login finishes
            await page.waitForNavigation({ waitUntil: 'networkidle' });

            // Save session
            const cookies = await context.cookies();
            fs.writeFileSync(SESSION_FILE, JSON.stringify(cookies, null, 2));
            console.log('Session saved.');
        }

        // Navigate to the product inventory table
        page = await context.newPage();
        await page.goto(`${BASE_URL}/tools`, { waitUntil: 'load', timeout: 60000 });

        console.log('Navigating to product table...');

        // Navigation steps
        await page.waitForSelector('nav a:has-text("Data"), button:has-text("Data")', { timeout: 60000 });
        await page.click('nav a:has-text("Data"), button:has-text("Data")');
        await page.waitForTimeout(2000);

        await page.waitForSelector('nav a:has-text("Inventory"), button:has-text("Inventory")', { timeout: 60000 });
        await page.click('nav a:has-text("Inventory"), button:has-text("Inventory")');
        await page.waitForTimeout(2000);

        await page.waitForSelector('nav a:has-text("Products"), button:has-text("Products")', { timeout: 60000 });
        await page.click('nav a:has-text("Products"), button:has-text("Products")');
        await page.waitForTimeout(3000);

        // Scrape table data
        let allData = [];
        let hasNextPage = true;

        while (hasNextPage) {
            await page.waitForSelector('table tbody tr', { timeout: 60000 });

            const rows = await page.$$('table tbody tr');

            if (rows.length === 0) {
                console.log('No rows found. Exiting...');
                break;
            }

            for (const row of rows) {
                // Using different selectors for flexibility
                const id = await row.textContent('td:nth-child(1), .product-id, [data-id]');
                const price = await row.textContent('td:nth-child(2), .price, [data-price]');
                const color = await row.textContent('td:nth-child(3), .color, [data-color]');
                const item_code = await row.textContent('td:nth-child(4), .item-code, [data-item]');
                const product = await row.textContent('td:nth-child(5), .product-name, [data-product]');
                const description = await row.textContent('td:nth-child(6), .description, [data-description]');
                const stock = await row.textContent('td:nth-child(7), .stock, [data-stock]');

                // Push the extracted data into JSON format
                allData.push({
                    id: id ? id.trim() : 'N/A',
                    price: price ? price.trim() : 'N/A',
                    color: color ? color.trim() : 'N/A',
                    item_code: item_code ? item_code.trim() : 'N/A',
                    product: product ? product.trim() : 'N/A',
                    description: description ? description.trim() : 'N/A',
                    stock: stock ? stock.trim() : 'N/A'
                });
            }

            console.log(`Captured ${rows.length} rows...`);

            // Handle pagination
            const nextPage = await page.$('button[aria-label="Next"], a:has-text("Next")');
            if (nextPage && (await nextPage.isEnabled())) {
                await nextPage.click();
                await page.waitForTimeout(3000);
            } else {
                hasNextPage = false;
            }
        }

        // ✅ Exporting structured JSON data to a file
        const structuredData = {
            timestamp: new Date().toISOString(),
            total_products: allData.length,
            products: allData
        };

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(structuredData, null, 2));
        console.log(`Data exported to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
})();
