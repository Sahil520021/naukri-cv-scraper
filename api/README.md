# Naukri CV Scraper API

A Vercel-hosted REST API wrapper for the Naukri CV Scraper. This API proxies requests to your n8n webhook, making it easy to integrate with RapidAPI or any HTTP client.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd vercel-api
npm install
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy (follow the prompts)
vercel

# For production deployment
vercel --prod
```

### 3. Set Environment Variables (Optional)

In your Vercel dashboard, add these environment variables:

| Variable | Description |
|----------|-------------|
| `N8N_WEBHOOK_SECRET` | Secret for n8n webhook authentication |
| `N8N_WEBHOOK_URL` | Override default n8n webhook URL |

---

## 📡 API Endpoints

### `POST /api/scrape`

Scrape CV profiles from Naukri.com.

**Request Body:**
```json
{
  "curlCommand": "curl 'https://resdex.naukri.com/...' -H 'Cookie: ...'",
  "maxResults": 10
}
```

**Response:**
```json
{
  "success": true,
  "totalCandidates": 10,
  "candidates": [...],
  "stats": {
    "requested": 10,
    "received": 10,
    "successRate": "100%",
    "timeTakenSeconds": 45.2
  }
}
```

### `GET /api/health`

Health check endpoint.

---

## 🌐 Register on RapidAPI

Follow these steps to list your API on RapidAPI Hub:

### Step 1: Create RapidAPI Account
1. Go to [rapidapi.com](https://rapidapi.com) and sign up
2. Navigate to [RapidAPI Studio](https://rapidapi.com/studio)

### Step 2: Add New API
1. Click **"Add API Project"**
2. Fill in API details:
   - **Name:** Naukri CV Scraper
   - **Description:** Scrape candidate CVs from Naukri.com Resdex
   - **Category:** Data

### Step 3: Configure Base URL
1. Go to **"Hub Listing"** in sidebar
2. Set **Base URL** to your Vercel deployment URL:
   ```
   https://your-app.vercel.app
   ```
3. Set visibility to **Public** (when ready)

### Step 4: Add Endpoints
1. Go to **"Endpoints"** tab
2. Click **"Add Endpoint"**
3. Configure the scrape endpoint:
   - **Name:** Scrape CVs
   - **Method:** POST
   - **Path:** /api/scrape
   - **Description:** Scrape candidate profiles from Naukri Resdex
4. Add request body parameters:
   - `curlCommand` (string, required)
   - `maxResults` (integer, optional, default: 10)

### Step 5: Set Pricing (Optional)
1. Go to **"Monetization"** tab
2. Create pricing tiers (Free, Basic, Pro, etc.)
3. Set rate limits and quotas

### Step 6: Publish
1. Test your endpoints in RapidAPI Studio
2. Make API public when ready

---

## 🔐 Security Notes

- Never commit `.env` files with secrets
- Use environment variables for sensitive data
- The cURL command contains session cookies - keep it secure

---

## 📝 License

MIT
