# Officer Contact Directory — WebApp

A mobile-friendly, searchable contact directory for district officers.
Designed to be embedded inside an Android WebView.

---

## 📁 File Structure

```
contact-directory/
├── index.html          ← Main page (don't rename)
├── styles.css          ← All styling (customisable)
├── app.js              ← All logic (customisable)
├── data/
│   ├── contacts.json   ← ⭐ Replace with your contacts data
│   └── districts.json  ← ⭐ Replace with your districts data
└── README.md           ← This file
```

---

## 🔄 How to Replace Data

All data lives in **`data.js`** as two inline JavaScript arrays.
This avoids `fetch()` which fails on `file://` URLs in Android WebView.

Open `data.js` and replace `DISTRICTS_DATA` and `CONTACTS_DATA`:

### DISTRICTS_DATA schema
```js
const DISTRICTS_DATA = [
  { "distId": 8, "districtName": "Ahilyanagar", "division": "Nashik" },
  // ...
];
```
`division` is optional — shown in brackets in the dropdown.

### CONTACTS_DATA schema
```js
const CONTACTS_DATA = [
  {
    "distId": 8,
    "districtName": "Ahilyanagar",
    "contacts": [
      {
        "name": "Officer Name",
        "marathiName": "अधिकाऱ्याचे नाव",
        "post": "Collector",
        "marathiPost": "जिल्हाधिकारी",
        "email": "email@example.com",
        "contactNo": "9876543210",
        "landlineNo": "02412326296",
        "address": "Office address"
      }
    ]
  }
];
```

> `distId` must match between both arrays — that's how contacts link to districts.

The `data/` folder (contacts.json, districts.json) is kept as a backup reference only.

---

## 🎨 Theming (styles.css)

Edit the CSS custom properties at the top of `styles.css`:

```css
:root {
  --clr-primary:   #1A3C6E;   /* Header & badge colour */
  --clr-accent:    #E8871A;   /* Saffron highlight */
  --clr-bg:        #F0F4F8;   /* Page background */
  --clr-surface:   #FFFFFF;   /* Card background */
  /* … etc … */
}
```

---

## 📱 Android WebView Integration

Load the page using a file URL or a local server:
```java
webView.loadUrl("file:///android_asset/contact-directory/index.html");
```

Or serve the folder over a local HTTP server (e.g. with NanoHTTPD) and load via `http://localhost:<port>/`.

**WebView settings to enable:**
```java
webView.getSettings().setJavaScriptEnabled(true);
webView.getSettings().setAllowFileAccessFromFileURLs(true);
webView.getSettings().setAllowUniversalAccessFromFileURLs(true);
```

---

## 🔍 Features

- District dropdown (auto-populated from districts.json)
- Live search by officer name or designation (English & Marathi)
- Tap-to-call phone numbers
- Tap-to-email links
- Works fully offline (no external API calls, only Google Fonts CDN)
- Supports Marathi / Devanagari script via Noto Sans Devanagari
- Responsive down to 320px width

---

## ⚙️ Offline Fonts (optional)

If the app must work without internet, download the Noto Sans fonts and
host them locally, then update the `<link>` in `index.html`:

```html
<!-- Replace this CDN link with a local font face -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans..." rel="stylesheet"/>
```

---
