# 🎯 How to Get Your Resdex Credentials

## Quick Reference

| Input | Where to Find It | Example |
|-------|-----------------|---------|
| **cookies** | DevTools → Network → Any request → Cookie header | `geo_country=IN;UNPC=125281556;...` |
| **requirementId** | Resdex URL | `130761` |
| **companyId** | Cookies → `UNPC=` | `125281556` |
| **rdxUserId** | Cookies → `UNCC=` | `125666042` |
| **rdxUserName** | Cookies → `lastLoggedInUser=` | `krrish@grrbaow.com` |

---

## Step-by-Step Guide

### 🍪 Step 1: Get Your Cookies

**This is the most important - you need the FULL cookie string**

1. Open https://resdex.naukri.com and login
2. Press **F12** (or Right-click → Inspect)
3. Go to **Network** tab
4. Refresh the page (Ctrl+R or Cmd+R)
5. Click ANY request in the list
6. Scroll down to **Request Headers**
7. Find the line that starts with `cookie:`
8. **Copy the ENTIRE value** (it will be VERY long, 2000+ characters)

**What it looks like:**
```
cookie: geo_country=IN;J=0;ninjas_new_marketing_token=133bc1f856fc7fd49fe2f5a09c43dd4d;_clck=zawyd3%5E2%5Eg1r%5E0%5E2171;__gads=ID=c99bdcea1ec68b8c:T=1765460739:RT=1765460739:S=ALNI_MZhejrplW4VAVKQqi3-6nm2WBRZNQ;__gpi=UID=000011c80db7c023:T=1765460739:RT=1765460739:S=ALNI_MaZ8rOqd6_DsdXOjxb90Brglrvd9A;...UNPC=125281556;UNCC=125666042;lastLoggedInUser=krrish@grrbaow.com;...
```

**⚠️ Important:** Copy EVERYTHING, not just part of it!

---

### 📋 Step 2: Get requirementId

**From your Resdex browser URL**

When you're viewing candidates, look at the URL bar:

```
https://resdex.naukri.com/lite/candidatesearchresults?requirementId=130761&requirementGroupId=130761
                                                                    ^^^^^^
```

Copy just the number: `130761`

---

### 🏢 Step 3: Get companyId

**From your cookies** (you already copied them in Step 1)

Look for `UNPC=` in your cookie string:

```
...kycEligibleCookie125281556=true;UNPC=125281556;UNCC=125666042;loginPreference=null_null;...
                                         ^^^^^^^^^
```

Copy just the number: `125281556`

**Alternative:** Look at the URL when viewing a profile:
```
https://resdex.naukri.com/.../companies/125281556/recruiters/125666042/...
                                        ^^^^^^^^^
```

---

### 👤 Step 4: Get rdxUserId

**From your cookies** (same string as Step 1)

Look for `UNCC=` in your cookie string:

```
...UNPC=125281556;UNCC=125666042;loginPreference=null_null;dashboard=1;...
                       ^^^^^^^^^
```

Copy just the number: `125666042`

**Alternative:** Look at the URL when viewing a profile:
```
https://resdex.naukri.com/.../companies/125281556/recruiters/125666042/...
                                                              ^^^^^^^^^
```

---

### 📧 Step 5: Get rdxUserName

**From your cookies** (same string as Step 1)

Look for `lastLoggedInUser=` in your cookie string:

```
...UNID=MVWInKvxpM6B33DZHUK7Yo0yNKEOmjUYug7nQJmp;lastLoggedInUser=krrish@grrbaow.com;cart_125666042=...
                                                                  ^^^^^^^^^^^^^^^^^^^
```

Copy your email address: `krrish@grrbaow.com`

---

## 💡 Pro Tips

### Finding Values in Cookie String

Your cookie is one LONG line. To make it easier:

**Method 1: Paste into a text editor**
1. Paste the full cookie string into Notepad/VS Code
2. Find & Replace: `;` with `;\n` (adds line breaks)
3. Now search for `UNPC=`, `UNCC=`, `lastLoggedInUser=`

**Method 2: Use browser search**
1. Right-click the cookie value in DevTools
2. Copy it
3. Paste in a new browser tab
4. Use Ctrl+F (Cmd+F) to search for `UNPC=`, `UNCC=`, etc.

### If You Can't Find a Value

**companyId not showing?**
- Check the profile URL: `.../companies/YOUR_COMPANY_ID/...`

**rdxUserId not showing?**
- Check the profile URL: `.../recruiters/YOUR_USER_ID/...`

**lastLoggedInUser not in cookies?**
- Just use the email you logged in with

---

## 🔄 Cookie Expiration

**Important:** Cookies expire! Usually after:
- 24 hours of inactivity
- When you logout
- When you clear browser cache

**When cookies expire:**
1. Actor will fail with authentication error
2. Just login to Resdex again
3. Copy fresh cookies
4. Re-run the actor with new cookies

---

## 📊 Example: Complete Input

Here's what a complete actor input looks like:

```json
{
  "cookies": "geo_country=IN;J=0;UNPC=125281556;UNCC=125666042;lastLoggedInUser=krrish@grrbaow.com;....(2000+ more characters)....",
  "requirementId": "130761",
  "companyId": "125281556",
  "rdxUserId": "125666042",
  "rdxUserName": "krrish@grrbaow.com",
  "maxResults": 10
}
```

---

## ❓ Troubleshooting

### "Cookies are required" error
- Make sure you copied the ENTIRE cookie string
- Should be 2000+ characters long
- Should contain many semicolons (;)

### "Authentication failed" error
- Your cookies expired - get fresh ones
- Login to Resdex and copy cookies again

### "No candidates found" warning
- Check if your requirementId is correct
- Make sure you have candidates in Resdex for that requirement

### "Invalid companyId or userId"
- Double-check the UNPC and UNCC values
- Make sure you copied just the numbers, no extra characters

---

## ✅ Quick Checklist

Before running the actor:

- [ ] Logged into Resdex
- [ ] Opened DevTools (F12)
- [ ] Copied FULL cookie string (2000+ chars)
- [ ] Got requirementId from URL
- [ ] Found UNPC= value (companyId)
- [ ] Found UNCC= value (rdxUserId)
- [ ] Found lastLoggedInUser= value (email)
- [ ] Set reasonable maxResults (start with 5-10)

---

**Ready?** Test with a small number first (maxResults: 5) to make sure everything works!
