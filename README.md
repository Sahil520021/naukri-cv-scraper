# Naukri Resdex CV Scraper 🔍

Automated CV scraping from Naukri Resdex with Google Docs integration.

## How It Works

This Apify actor is a lightweight proxy that calls your n8n webhook workflow to:
1. Search Resdex candidates
2. Extract full CVs
3. Create Google Docs for each candidate
4. Return results

## Setup

1. **Get your cURL command:**
   - Login to Resdex
   - Search for candidates
   - Open DevTools (F12) → Network tab
   - Find POST request to `rdxLite/search`
   - Right-click → Copy → Copy as cURL (bash)

2. **Paste into Apify:**
   - Paste entire cURL command
   - Set max results (1-100)
   - Run!

## Features

- ✅ No manual credential extraction
- ✅ Just paste cURL and go
- ✅ Full CV text extraction
- ✅ Google Docs creation
- ✅ Easy updates via n8n

## Requirements

- Active Resdex session (fresh cookies)
- n8n workflow endpoint configured

---

Built with ❤️ by GRR BAOW LLC
