# 🤖 AI Text Summarizer

A full-stack web application that summarizes long texts, PDFs, Word documents, and URLs into concise summaries. Supports **multilingual translation** (English ↔ Hindi), keyword extraction, and bullet-point formatting.

---

## 🏗 Architecture

```
Frontend (Next.js) ──► Backend (Node.js/Express) ──► AI Service (Python/FastAPI)
     :3000                      :5000                        :8000
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15+, React 19, Tailwind CSS 4, Framer Motion |
| Backend | Express.js, TypeScript, MongoDB, pdf-parse, mammoth |
| AI Service | FastAPI, HuggingFace Transformers (T5-small), PyTorch |

---

## ✅ Prerequisites

Make sure these are installed on your system:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) (v3.9 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally or MongoDB Atlas)
- Git

---

## 🚀 Installation & Setup

### Step 1 — Clone the Repository

```bash
git clone https://github.com/sachinyadav2390/AI-Text-Summarizer-.git
cd AI-Text-Summarizer-
```

---

### Step 2 — Setup Environment Variables

Create a `.env` file in the root folder:

```env
MONGODB_URI=mongodb://localhost:27017/ai-summarizer
PORT=5000
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_email_app_password
```

> ⚠️ For Gmail, use an **App Password** (not your regular password).  
> Go to: Google Account → Security → 2-Step Verification → App Passwords

---

### Step 3 — Install Frontend & Backend Dependencies

```bash
npm install
```

---

### Step 4 — Setup AI Service (Python)

```bash
cd ai-service
pip install -r requirements.txt
cd ..
```

> ⚠️ First time setup will download the **T5-small model** (~250MB). Make sure you have internet connection.

---

### Step 5 — Start All Services

#### Option A — Start All at Once (Recommended)

```bash
npm run dev:all
```

#### Option B — Start Each Service Separately

Open **3 separate terminals**:

**Terminal 1 — Frontend:**
```bash
npm run dev
```

**Terminal 2 — Backend:**
```bash
npm run server
```

**Terminal 3 — AI Service:**
```bash
cd ai-service
python main.py
```

---

## 🌐 Access the App

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| AI Service | http://127.0.0.1:8000 |

---

## 📡 API Endpoints

### Node.js Backend (Port 5000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/summarize` | Summarize text or URL |
| POST | `/api/upload` | Upload PDF/DOCX file |
| GET | `/api/history` | Get last 20 summaries |
| POST | `/api/contact` | Send contact message |

### AI Service (Port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/summarize` | Generate abstractive summary |
| POST | `/ai/translate` | Translate text |
| POST | `/ai/keywords` | Extract top 10 keywords |
| GET | `/health` | Check service health |
| POST | `/models/load` | Pre-load AI models |

---

## 🌟 Features

- 📝 **Text Summarization** — Paste any long text and get a concise summary
- 📄 **Document Support** — Upload `.pdf` or `.docx` files
- 🔗 **URL Extraction** — Paste any article link for automatic content extraction
- 🌐 **Multilingual** — Auto-detects language, translates to English, summarizes, translates back
- ⚡ **Fast** — T5-small model gives results in under 5 seconds on CPU
- 📊 **History** — Last 20 summaries stored in MongoDB

---

## ⚠️ Common Issues & Fixes

### MongoDB not connecting
```bash
# Make sure MongoDB is running
# Windows:
net start MongoDB

# Or use MongoDB Atlas (cloud) and update MONGODB_URI in .env
```

### Python packages error
```bash
pip install -r ai-service/requirements.txt --upgrade
```

### Port already in use
```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Hindi text not displaying correctly
- Make sure your system supports UTF-8 encoding
- The app enforces UTF-8 automatically on Windows

---

## 👥 Contributors

- **Sachin Yadav** — [@sachinyadav2390](https://github.com/sachinyadav2390)
- **Himanshu Yadav** — [@Himanshuyadav6764](https://github.com/Himanshuyadav6764)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
