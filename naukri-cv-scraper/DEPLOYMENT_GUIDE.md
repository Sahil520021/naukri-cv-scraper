# 🚀 STEP-BY-STEP DEPLOYMENT GUIDE

## ✅ What This Actor Does

**This is a webhook proxy!** The actor:
1. Takes user inputs on Apify
2. Calls your n8n webhook
3. Your n8n does ALL the work (scraping + Google Docs)
4. Returns results to Apify

**Benefits:**
- ✅ Listed on Apify marketplace
- ✅ ALL logic stays in n8n (super easy to update)
- ✅ Update workflow without rebuilding actor
- ✅ Users discover you on Apify

---

## 📦 Quick Setup (3 Steps)

### Step 1: Update Webhook URL in Actor

Edit `src/main.js` line 6:

```javascript
const CONFIG = {
    n8nWebhookUrl: 'https://YOUR_N8N_URL.cloud/webhook/naukri-scraper'
};
```

Replace with YOUR actual n8n webhook URL.

### Step 2: Set Up n8n Workflow

See `N8N_WORKFLOW_SETUP.md` for complete workflow structure.

**Quick version:**
- Webhook Trigger (POST)
- Search Resdex → Loop → Get Profiles
- Create Google Docs → Insert CV
- Respond to Webhook with results

### Step 3: Push to GitHub → Connect to Apify

Same as before - see below for details.

---

## 📦 Step 2: Create GitHub Repository

### Option A: Via GitHub Website (Easiest)

1. Go to https://github.com/new
2. Repository name: `naukri-cv-scraper`
3. Description: "Naukri Resdex CV Scraper for Apify"
4. Make it **Public** (required for Apify free tier)
5. ✅ Initialize with README: **UNCHECK THIS**
6. Click "Create repository"

### Option B: Via GitHub CLI

```bash
gh repo create naukri-cv-scraper --public --description "Naukri Resdex CV Scraper"
```

---

## 📤 Step 3: Push Files to GitHub

I'll prepare a ZIP file with all the code. Then:

### 3.1: Download the ZIP file
Download the `naukri-cv-scraper.zip` I'll create

### 3.2: Extract and Push

```bash
# Extract the ZIP
unzip naukri-cv-scraper.zip
cd naukri-cv-scraper

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Naukri CV Scraper"

# Add your GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/naukri-cv-scraper.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🔗 Step 4: Connect GitHub to Apify

### 4.1: Go to Apify Console
Open: https://console.apify.com/actors

### 4.2: Create New Actor
1. Click "Create new" button
2. Select "Import from Git repository"

### 4.3: Connect GitHub
1. Click "Connect GitHub account"
2. Authorize Apify
3. Select your repository: `YOUR_USERNAME/naukri-cv-scraper`
4. Branch: `main`
5. Click "Create"

### 4.4: Build the Actor
Apify will automatically build your actor (takes 2-3 minutes)

---

## ▶️ Step 5: Test Your Actor

### 5.1: Get Your Resdex Credentials

1. Login to https://resdex.naukri.com
2. Open DevTools (F12)
3. Go to Network tab
4. Refresh page
5. Click any request
6. Copy the `cookie:` header value

### 5.2: Run the Actor

In Apify Console, click your actor → Click "Try it" → Fill in:

```json
{
  "cookies": "YOUR_COPIED_COOKIES",
  "requirementId": "130761",
  "companyId": "125281556",
  "rdxUserId": "125666042",
  "rdxUserName": "krrish@grrbaow.com",
  "maxResults": 5
}
```

Click "Start" and watch it run!

---

## 🎯 Step 6: Make it Public (Optional)

To list on Apify Store:

1. Go to your actor settings
2. Under "Publication"
3. Set "SEO title" and "Description"
4. Click "Publish"

People can now find it at:
```
https://apify.com/YOUR_USERNAME/naukri-cv-scraper
```

---

## 🔄 How to Update Later

When you need to change something:

### Quick Edit in GitHub
1. Go to your repo on GitHub
2. Navigate to `src/main.js`
3. Click the pencil icon (Edit)
4. Make changes
5. Commit
6. Apify auto-rebuilds in 2-3 minutes

### Or Push from Computer
```bash
# Make changes to files
nano src/main.js

# Commit and push
git add .
git commit -m "Updated API endpoint"
git push

# Apify auto-rebuilds
```

---

## 🐛 Troubleshooting

### Build Failed
- Check the build log in Apify Console
- Usually a syntax error in main.js
- Fix in GitHub and Apify will rebuild

### Authentication Error
- Your cookies expired
- Login to Resdex and get fresh cookies
- Run actor again with new cookies

### No Results
- Check if requirementId is correct
- Verify you have candidates in Resdex

---

## ✅ Success Checklist

- [ ] GitHub repo created
- [ ] Files pushed to GitHub
- [ ] Actor created in Apify
- [ ] Actor successfully built
- [ ] Test run completed
- [ ] Results showing in dataset

---

## 🎉 You're Done!

Your n8n workflow is now an Apify actor that anyone can use!

**Actor URL:** `https://apify.com/YOUR_USERNAME/naukri-cv-scraper`
**API Endpoint:** `https://api.apify.com/v2/acts/YOUR_USERNAME~naukri-cv-scraper/runs`

---

Need help? Issues? Let me know!
