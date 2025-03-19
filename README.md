# playwright-data-scraper

**1. Project Description**

This project is a web scraper built using **Playwright** to extract product data from an inventory website. It:
- Logs in using credentials from a `.env` file.
- Navigates through the website to locate the product table.
- Handles pagination dynamically to capture **all 3722 products**.
- Exports the extracted data into a **structured JSON file**.
- Writes data in batches to prevent memory overflow and ensure smooth execution.


**2. Folder Structure**

```plaintext
/PLAYWRIGHT-DATA-SCRAPER
 ├── .env                  # Contains base URL, email, and password
 ├── scraper.js            # Main script for data extraction
 ├── package.json          # Node.js dependencies
 ├── package-lock.json     # Package lock file
 ├── session.json          # Stores the session cookies
 ├── products.json         # Extracted product data in JSON format
 ├── README.md             # Instructions for running the project
 ├── .gitignore            # Files to exclude from Git tracking
 └── node_modules/         # Dependencies installed by npm
```

---
**3. Installation Steps**

**Step 1: Clone the Repository**
If you are using GitHub, clone the repository to your local machine:
```bash
git clone <repository_url>
cd PLAYWRIGHT-DATA-SCRAPER
```

---

**Step 2: Install Node.js and Playwright**
Make sure you have Node.js installed. Install the required dependencies by running:

```bash
npm install playwright dotenv
```

---

**Step 3: Create the `.env` File**
Create a `.env` file in the root folder to store your login credentials and base URL.

```plaintext
BASE_URL=https://yourwebsite.com
EMAIL=your-email@example.com
PASSWORD=yourpassword
```

---
**Step 4: Create the `.gitignore` File**
To avoid pushing sensitive information and dependencies, create a `.gitignore` file and add:

```plaintext
node_modules/
session.json
products.json
.env
```

---
**Step 5: Run the Scraper**
Run the scraper to start extracting product data:

```bash
node scraper.js
```

---
**4. How the Script Works**

1. **Login & Session Handling:**
   - The script first checks for an existing session (`session.json`).
   - If the session exists, it uses it for faster execution.
   - If no session is found, it logs in using credentials from the `.env` file and saves the session.

2. **Navigating the Inventory:**
   - It goes through the navigation flow: `Data → Inventory → Products`.
   - Waits for the content to load properly before scraping.

3. **Extracting Data:**
   - Extracts **7 elements** per product:
     - `id`
     - `price`
     - `color`
     - `item_code`
     - `product`
     - `description`
     - `stock`
   - Uses robust selectors to locate elements dynamically.

4. **Pagination:**
   - The script handles pagination efficiently.
   - It checks for the "Next" button and keeps clicking until no more pages are left.

5. **Batch Writing:**
   - To prevent memory overflow, it writes data in batches of **200 products** to the JSON file.
   - After completing the scraping, it writes the final batch and closes the file.

---

 **5. Output Example**

The script exports data in a structured JSON format into `products.json`:

```json
{
  "products": [
    {
      "id": "101",
      "price": "$12.99",
      "color": "Red",
      "item_code": "X123",
      "product": "T-Shirt",
      "description": "Cotton red t-shirt",
      "stock": "35"
    },
    {
      "id": "102",
      "price": "$24.99",
      "color": "Blue",
      "item_code": "X124",
      "product": "Jeans",
      "description": "Denim blue jeans",
      "stock": "20"
    }
  ]
}
```

---

**6. Troubleshooting**

- **Timeout Issues:** If the website takes longer to load, increase the timeout duration in the script:
```javascript
await page.waitForSelector('selector', { timeout: 120000 }); 
```

- **Missing Data:** If you see missing rows or partial data:
    - Verify that all selectors are correctly capturing the content.
    - Add retries and error handling for stability.
  
- **Incomplete Export:** If the script stops before exporting all 3722 products:
    - Increase the batch size or write data more frequently.
    - Check for memory usage issues.

---

**7. GitHub Integration**

**To Push the Project to GitHub:**

1. Initialize the repository:
```bash
git init
```

2. Add the files:
```bash
git add .
```

3. Commit the changes:
```bash
git commit -m "Initial commit - Playwright Data Scraper"
```

4. Create a new repository on GitHub and push the code:
```bash
git remote add origin <repository_url>
git branch -M main
git push -u origin main
```

---
**8. How to Use**
- To **re-run** the scraper, execute:
```bash
node scraper.js
```

- To view the exported data:
```bash
cat products.json
```

---
**9. Best Practices**
- Use `.gitignore` to prevent exposing sensitive credentials.
- Regularly clean up `session.json` if login issues occur.
- Store large JSON files outside the repository or use `.gitignore` to avoid pushing them.

---
**10. Future Enhancements**
- Implement CSV export option.
- Add filters to select specific product categories.
- Integrate a database (MongoDB or PostgreSQL) for large-scale data storage.

---
**11. License**
This project is open-source and free to use under the **MIT License**.

---
**12. Contact**
For any issues or improvements, feel free to raise a pull request or open an issue on GitHub.
