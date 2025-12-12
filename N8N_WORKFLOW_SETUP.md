# 🔗 n8n Webhook Workflow Setup

## Complete n8n Workflow Structure

Your n8n workflow should look like this:

```
Webhook (POST) 
    ↓
Search Resdex API
    ↓
Loop Over Candidates
    ↓
Fetch Individual Profile
    ↓
Create Google Doc
    ↓
Update Google Doc (insert CV)
    ↓
Aggregate Results
    ↓
Respond to Webhook
```

---

## Step-by-Step Setup

### 1. Webhook Trigger Node

**Node:** Webhook
**Settings:**
- HTTP Method: POST
- Path: `naukri-scraper` (or whatever you want)
- Response Mode: "Wait for response"
- Response Code: 200

This gives you a URL like:
```
https://n8n.srv936319.hstgr.cloud/webhook/naukri-scraper
```

**Expected Input:**
```json
{
  "cookies": "string",
  "requirementId": "string",
  "companyId": "string",
  "rdxUserId": "string",
  "rdxUserName": "string",
  "maxResults": 10
}
```

---

### 2. HTTP Request - Search Resdex

**Node:** HTTP Request
**Settings:**
- Method: POST
- URL: `https://resdex.naukri.com/cloudgateway-resdex/recruiter-js-profile-listing-services/v0/rdxLite/search`

**Headers:**
```javascript
{
  "accept": "application/json",
  "appid": "112",
  "systemid": "naukriIndia",
  "cookie": "={{ $json.body.cookies }}"
}
```

**Body (JSON):**
```json
{
  "requirementId": "={{ $json.body.requirementId }}",
  "newCandidatesSearch": false,
  "saveSession": true,
  "requirementGroupId": "={{ $json.body.requirementId }}",
  "miscellaneousInfo": {
    "companyId": "={{ parseInt($json.body.companyId) }}",
    "rdxUserId": "={{ $json.body.rdxUserId }}",
    "rdxUserName": "={{ $json.body.rdxUserName }}"
  }
}
```

---

### 3. Split Into Items

**Node:** Split Into Batches or Code
**Purpose:** Split the candidate list from search results

**Code (if using Code node):**
```javascript
const candidates = $input.item.json.result.jsProfileList || [];
const maxResults = $('Webhook').item.json.body.maxResults || 10;

return candidates.slice(0, maxResults).map(candidate => ({
  json: candidate
}));
```

---

### 4. HTTP Request - Get Individual Profile

**Node:** HTTP Request (inside loop)
**Settings:**
- Method: POST
- URL: `https://resdex.naukri.com/cloudgateway-resdex/recruiter-js-profile-services/v0/companies/={{ $('Webhook').item.json.body.companyId }}/recruiters/={{ $('Webhook').item.json.body.rdxUserId }}/rdxlite/jsprofile`

**Headers:**
```javascript
{
  "accept": "application/json",
  "appid": "112",
  "systemid": "naukriIndia",
  "cookie": "={{ $('Webhook').item.json.body.cookies }}"
}
```

**Body (JSON):**
```json
{
  "uniqId": "={{ $json.uniqueId }}",
  "pageName": "rdxLitePreview",
  "uname": null,
  "sid": "={{ $json.sid }}",
  "requirementId": "={{ $('Webhook').item.json.body.requirementId }}",
  "requirementGroupId": "={{ $('Webhook').item.json.body.requirementId }}",
  "jsKey": "={{ $json.jsKey }}",
  "miscellaneousInfo": {
    "companyId": "={{ parseInt($('Webhook').item.json.body.companyId) }}",
    "rdxUserId": "={{ $('Webhook').item.json.body.rdxUserId }}",
    "resendOtp": false,
    "flowName": "rdxLiteSrp"
  }
}
```

---

### 5. Google Docs - Create Document

**Node:** Google Docs
**Operation:** Create a Document
**Settings:**
- Folder: Select your folder
- Title: `={{ $json.name }}_Resume`

**Output:** Document ID in `$json.id`

---

### 6. Google Docs - Update Document

**Node:** Google Docs  
**Operation:** Update a Document
**Settings:**
- Document: `={{ $json.id }}` (from previous node)
- Actions → Insert Text
- Text: `={{ $('HTTP Request1').item.json.result.textCv }}`
  (Adjust node name based on your profile fetch node)

---

### 7. Code - Format Response

**Node:** Code
**Purpose:** Structure the data for the actor

```javascript
const profileData = $('HTTP Request1').item.json.result;
const candidateData = $input.item.json;
const docId = $('Google Docs').item.json.id;

return [{
  json: {
    name: candidateData.name,
    email: candidateData.oemail,
    mobile: candidateData.mphone,
    location: candidateData.scity,
    currentDesignation: candidateData.designation,
    currentCompany: candidateData.currentOrganization,
    totalExperience: candidateData.stotalExp,
    cvText: profileData.textCv || 'No CV available',
    skills: candidateData.mergedKeySkill,
    googleDocId: docId,
    googleDocUrl: `https://docs.google.com/document/d/${docId}/edit`
  }
}];
```

---

### 8. Aggregate

**Node:** Aggregate
**Purpose:** Collect all results into a single array
**Settings:**
- Aggregate All Items: Yes

---

### 9. Respond to Webhook

**Node:** Respond to Webhook
**Purpose:** Send results back to Apify actor

**Response Body (Code node before this):**
```javascript
const profiles = $input.all().map(item => item.json);

return [{
  json: {
    success: true,
    totalProfiles: profiles.length,
    profiles: profiles
  }
}];
```

---

## 🔒 Optional: Add Authentication

If you want to secure your webhook:

### In n8n:

Add a header check in your workflow:

```javascript
// Code node right after webhook
const authHeader = $('Webhook').item.json.headers.authorization;
const expectedSecret = 'YOUR_SECRET_KEY';

if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
  throw new Error('Unauthorized');
}

return $input.all();
```

### In Actor (main.js):

```javascript
const CONFIG = {
    n8nWebhookUrl: 'https://n8n.srv936319.hstgr.cloud/webhook/naukri-scraper',
    webhookSecret: 'YOUR_SECRET_KEY'
};
```

---

## 🧪 Testing Your Webhook

### Test with curl:

```bash
curl -X POST https://n8n.srv936319.hstgr.cloud/webhook/naukri-scraper \
  -H "Content-Type: application/json" \
  -d '{
    "cookies": "YOUR_COOKIES",
    "requirementId": "130761",
    "companyId": "125281556",
    "rdxUserId": "125666042",
    "rdxUserName": "krrish@grrbaow.com",
    "maxResults": 2
  }'
```

### Expected Response:

```json
{
  "success": true,
  "totalProfiles": 2,
  "profiles": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "cvText": "...",
      "googleDocUrl": "https://docs.google.com/document/d/..."
    }
  ]
}
```

---

## 📊 Response Format Requirements

The actor expects your n8n workflow to return:

**Minimum:**
```json
{
  "profiles": [...]
}
```

**Recommended:**
```json
{
  "success": true,
  "totalProfiles": 10,
  "profiles": [
    {
      "name": "string",
      "email": "string",
      "mobile": "string",
      "cvText": "string",
      "googleDocUrl": "string",
      // ... any other fields
    }
  ]
}
```

The actor will automatically:
- Push each profile to its dataset
- Display results to the user
- Handle errors gracefully

---

## 🐛 Troubleshooting

### Webhook timeout error
- Increase timeout in actor (default: 5 minutes)
- Or reduce maxResults in testing

### n8n workflow fails
- Check n8n execution logs
- Verify cookies are valid
- Test each node individually

### Actor shows empty results
- Check n8n "Respond to Webhook" node
- Verify response format matches expected structure
- Test webhook manually with curl

---

## 🎯 Benefits of This Architecture

1. **Easy Updates:** Change workflow in n8n without rebuilding actor
2. **Full n8n Power:** Use ANY n8n node (Slack, HubSpot, etc.)
3. **Visual Editing:** No code changes in Apify
4. **Marketplace Listed:** Discoverable on Apify
5. **Best of Both Worlds:** Apify's interface + n8n's flexibility

---

Your workflow is now ready to be called by the Apify actor!
