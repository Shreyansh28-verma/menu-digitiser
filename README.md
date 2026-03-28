# MenuAI — Instant Menu Digitiser 🍽️

> Turn physical restaurant menus into digital catalogs in seconds using AI.

## 🚀 Live Demo
**[View Live on Vercel →](https://your-vercel-url.vercel.app)**

---

## 🎯 What It Does

Restaurant owners upload a photo of their physical menu. The app:
1. Sends the image to **Gemini 2.5 Flash model**
2. Extracts every menu item (name, price, description)
3. Auto-categorizes into **Starters, Mains, Desserts, Beverages, Sides**
4. Detects **Veg / Non-Veg** classification
5. **Flags missing data** (Veg info, price, description)
6. Displays a clean, exportable **digital catalog**

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| AI | OpenAI GPT-4o Vision API |
| Styling | Vanilla CSS (dark glassmorphism) |
| Deployment | Vercel |

---

## ⚡ Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/your-username/menu-digitiser.git
cd menu-digitiser
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local and add your OPENAI_API_KEY
```

### 4. Run dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🚢 Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com)
3. Add environment variable: `OPENAI_API_KEY` = your key
4. Deploy!

---

## 📁 Project Structure

```
app/
├── page.js              # Landing page
├── upload/page.js       # Menu photo upload
├── results/page.js      # Digital catalog view
├── api/extract/route.js # OpenAI Vision API route
├── globals.css          # Design system
└── layout.js            # Root layout

components/
└── Navbar.js
```

---

## 🧪 API Endpoint

**POST** `/api/extract`

- Body: `multipart/form-data` with `image` field (JPG/PNG/WebP)
- Returns: `{ items: [...], count: n }`

Each item:
```json
{
  "id": "item-0",
  "name": "Paneer Tikka",
  "category": "Starters",
  "isVeg": true,
  "price": "₹180",
  "description": "Grilled cottage cheese with spices",
  "flags": []
}
```

---

Built with ❤️ for Wootz Work take-home assignment.
