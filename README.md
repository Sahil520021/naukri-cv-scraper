# Naukri Resdex CV Scraper 🔍

Automate complete candidate CV extraction from Naukri Resdex + Entire Candidate Profile ready to pulg into your ATS/CRM

## How It Works

3 Steps for getting all CV's from your Naukri Resdex:
Step 1: Search Candidates in Resdex
Step 2: Copy the Search Request
Step 3: Paste into Apify Actor

## Follow the following Steps (Instructions) Breakdown

Step 1: Search Candidates in Resdex

Login to Resdex and perform your candidate search
Right-click anywhere → Inspect
<img width="1640" height="922" alt="Screenshot 2025-12-15 at 11 29 26 AM" src="https://github.com/user-attachments/assets/0015dcb1-8034-447e-954c-e6fad902a907" />

Step 2: Copy the Search Request

Open Network tab in DevTools
<img width="1657" height="921" alt="Screenshot 2025-12-15 at 11 31 16 AM" src="https://github.com/user-attachments/assets/2934e860-2237-4fc2-ab0a-e25f059b5e3b" />

Click Fetch/XHR filter & Click Preserve Log
<img width="1656" height="921" alt="Screenshot 2025-12-15 at 11 32 12 AM" src="https://github.com/user-attachments/assets/c1958a99-e9aa-427b-9923-2d9ed4379df0" />

<img width="1657" height="920" alt="Screenshot 2025-12-15 at 11 32 36 AM" src="https://github.com/user-attachments/assets/4247d309-fc47-4750-83ee-2204c9561393" />

Find the 'search' request
<img width="1658" height="922" alt="Screenshot 2025-12-15 at 11 33 21 AM" src="https://github.com/user-attachments/assets/0fa0f7ee-d5cc-401f-98ac-118d79cbd964" />

if you can't find the 'search' request
1. Just Reload the Page
2. Do these steps <img width="1654" height="923" alt="Screenshot 2025-12-15 at 11 36 18 AM" src="https://github.com/user-attachments/assets/3292675b-2512-49fa-a23b-218d277c5a00" />

<img width="1654" height="921" alt="Screenshot 2025-12-15 at 11 36 42 AM" src="https://github.com/user-attachments/assets/fb188aee-9678-4ee0-a906-d71d9a956474" />

Right-click → Copy → Copy as cURL
<img width="1657" height="921" alt="Screenshot 2025-12-15 at 11 37 17 AM" src="https://github.com/user-attachments/assets/40106c7e-4d90-47de-945d-67a06f78d42e" />

<img width="1660" height="920" alt="Screenshot 2025-12-15 at 11 37 48 AM" src="https://github.com/user-attachments/assets/5032ae0e-bdcf-4b94-8ab4-291cd7f81c79" />

Step 3: Paste into Apify Actor

Paste the entire cURL command

<img width="1658" height="953" alt="Screenshot 2025-12-15 at 11 38 20 AM" src="https://github.com/user-attachments/assets/6222782a-b374-40af-a0e4-601ae1e506ed" />

Choose the Number of Candidates you want (1-1000)

Click Save & Start
<img width="1443" height="951" alt="Screenshot 2025-12-15 at 11 39 42 AM" src="https://github.com/user-attachments/assets/f9f972e7-0766-4c0e-b65d-5188a2e77d6f" />

## Features
✅ No credential extraction - Just copy/paste your browser request
✅ Bulk scraping - Up to 1000 candidates per run
✅ Full CV data - Name, contact, experience, skills, education
✅ Fresh sessions - Works with your active Resdex login
✅ Structured output - Clean JSON for easy integration

## Requirements

- Active Resdex session
