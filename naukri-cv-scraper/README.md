# Naukri Resdex CV Scraper 🔍

**Apify Actor Wrapper for your n8n Workflow**

This actor is a lightweight proxy that calls your n8n webhook, allowing you to:
- ✅ List your workflow on Apify marketplace
- ✅ Keep all logic in n8n (easy to update)
- ✅ Update workflow without rebuilding actor
- ✅ Let users discover and use your automation

## 🏗️ Architecture

```
User fills form on Apify → Actor calls your n8n webhook → 
n8n does everything (scrape + create Google Docs) → 
Returns results → Actor displays to user
```

**All the actual work happens in your n8n workflow. The actor is just a thin wrapper.**

## 🎯 What This Actor Does

1. Takes user inputs (cookies, requirementId, etc.)
2. Calls your n8n webhook with those inputs
3. Your n8n workflow:
   - Scrapes Resdex
   - Fetches CV details
   - Creates Google Docs
   - Does any other processing
4. Returns results back through the actor

## 🔧 Setup

## 🔧 Setup

### Step 1: Configure Your n8n Webhook URL

Edit `src/main.js` and update the webhook URL:

```javascript
const CONFIG = {
    n8nWebhookUrl: 'https://YOUR_N8N_INSTANCE.cloud/webhook/naukri-scraper',
    webhookSecret: process.env.N8N_WEBHOOK_SECRET || null // Optional
};
```

Replace `YOUR_N8N_INSTANCE.cloud` with your actual n8n URL.

### Step 2: Set Up Your n8n Workflow

Your n8n workflow should:

**Input (from webhook):**
```json
{
  "cookies": "...",
  "requirementId": "130761",
  "companyId": "125281556",
  "rdxUserId": "125666042",
  "rdxUserName": "email@company.com",
  "maxResults": 10
}
```

**Workflow nodes:**
1. Webhook Trigger (POST)
2. HTTP Request → Resdex Search API
3. HTTP Request → Resdex Profile API (loop)
4. Google Docs: Create Document
5. Google Docs: Update Document (insert CV)
6. Respond to Webhook

**Output (return to actor):**
```json
{
  "success": true,
  "totalProfiles": 10,
  "profiles": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "mobile": "9876543210",
      "cvText": "Full CV text...",
      "googleDocUrl": "https://docs.google.com/document/d/..."
    }
  ]
}
```

### Step 3: Deploy Actor to Apify

```bash
git push origin main
# Apify auto-rebuilds
```

Now users can run your actor on Apify, and it will call your n8n workflow!

## 📋 How to Get Your Credentials

### 1. Get Your Session Cookies

1. Go to [resdex.naukri.com](https://resdex.naukri.com) and login
2. Open DevTools (Press F12 or Right-click → Inspect)
3. Go to **Network** tab
4. Refresh the page
5. Click any request
6. Scroll to **Request Headers**
7. Find the `cookie:` header
8. Copy the **entire cookie string**

Example:
```
geo_country=IN;J=0;UNPC=125281556;UNCC=125666042;lastLoggedInUser=email@company.com;...
```

### 2. Get Your IDs

From your Resdex URL when viewing candidates:
```
https://resdex.naukri.com/lite/candidatesearchresults?requirementId=130761&...
```

- **requirementId**: `130761` (from URL)
- **companyId**: Found in cookies as `UNPC` value
- **rdxUserId**: Found in cookies as `UNCC` value
- **rdxUserName**: Your login email

## 🚀 Usage

### Input Example

```json
{
  "cookies": "geo_country=IN;J=0;UNPC=125281556;UNCC=125666042;lastLoggedInUser=krrish@grrbaow.com;...",
  "requirementId": "130761",
  "companyId": "125281556",
  "rdxUserId": "125666042",
  "rdxUserName": "krrish@grrbaow.com",
  "maxResults": 10
}
```

### Output Example

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "mobile": "9876543210",
  "location": "Mumbai",
  "currentDesignation": "Senior Software Engineer",
  "currentCompany": "Tech Corp",
  "totalExperience": "5.5",
  "cvText": "Full CV text here...",
  "skills": "JavaScript,React,Node.js,Python",
  "currentSalary": "12 Lacs",
  "expectedSalary": "18 Lacs",
  "profileUrl": "https://resdex.naukri.com/lite/preview?sid=..."
}
```

## 🔧 Integration

### Use with n8n

Add Apify node to your n8n workflow:

```javascript
// Apify Node Configuration
{
  "operation": "Run Actor",
  "actorId": "YOUR_USERNAME/naukri-cv-scraper",
  "input": {
    "cookies": "{{$json.cookies}}",
    "requirementId": "{{$json.requirementId}}",
    "companyId": "{{$json.companyId}}",
    "rdxUserId": "{{$json.rdxUserId}}",
    "rdxUserName": "{{$json.rdxUserName}}",
    "maxResults": 10
  },
  "waitForFinish": true
}
```

### Use with API

```bash
curl -X POST https://api.apify.com/v2/acts/YOUR_USERNAME~naukri-cv-scraper/runs \
  -H "Authorization: Bearer YOUR_APIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cookies": "YOUR_COOKIES",
    "requirementId": "130761",
    "companyId": "125281556",
    "rdxUserId": "125666042",
    "rdxUserName": "krrish@grrbaow.com",
    "maxResults": 10
  }'
```

## ⚠️ Important Notes

1. **Session Cookies Expire**: You need to update cookies periodically (usually every 24 hours)
2. **Rate Limits**: Resdex may have rate limits. Set `maxResults` appropriately
3. **Legal Compliance**: Ensure you have proper authorization to access Resdex data
4. **Data Privacy**: Handle candidate data according to privacy regulations

## 🔄 How to Update

### If Resdex Changes Their API

1. Go to your GitHub repo
2. Edit `src/main.js`
3. Update the `CONFIG` object at the top:

```javascript
const CONFIG = {
    searchUrl: 'NEW_URL_HERE',
    profileUrl: 'NEW_URL_HERE',
    // ... other settings
};
```

4. Commit and push
5. Apify will auto-rebuild

## 📊 Dataset Output

All scraped profiles are saved to the actor's dataset. You can:
- Download as JSON, CSV, Excel
- Connect to webhooks
- Stream to other services
- Access via Apify API

## 💡 Tips

- Start with `maxResults: 10` to test
- Monitor your Resdex account for any usage limits
- Use webhooks to get notified when scraping completes
- Store results in your own database for long-term access

## 🐛 Troubleshooting

**"Cookies are required" error:**
- Make sure you copied the complete cookie string
- Cookies should start with `geo_country=IN;...`

**"No candidates found" warning:**
- Check if your requirementId is correct
- Verify you have candidates in Resdex for that requirement

**Authentication errors:**
- Your session expired - get fresh cookies
- Login to Resdex again and copy new cookies

## 📧 Support

Built by **GRR BAOW LLC**
- Email: support@grrbaow.com
- Website: https://grrbaow.com

## 📄 License

Apache-2.0

---

**Made with ❤️ for the recruitment industry**
