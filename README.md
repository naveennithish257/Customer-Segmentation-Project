# 🎯 Customer Segmentation Analytics Dashboard

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Flask-3.x-black?style=for-the-badge&logo=flask" />
  <img src="https://img.shields.io/badge/ML-K--Means-orange?style=for-the-badge&logo=scikit-learn" />
</p>

<p align="center">
  A full-stack analytics dashboard that automatically segments customers using K-Means clustering. Upload any customer CSV/Excel file and get instant AI-powered insights, interactive charts, and actionable marketing strategies — all in a beautiful dark-mode UI.
</p>

---

## ✨ Features

- 📊 **6 Interactive Pages** — Dashboard, Segments, Analytics, Reports, AI Insights, Settings
- 🤖 **Automatic ML Clustering** — K-Means with 4 customer segments, zero configuration
- 🧠 **AI Insights** — Per-segment strategies, high-value customer detection, churn risk analysis
- 📁 **Flexible File Import** — CSV & Excel with intelligent column auto-detection
- 📤 **Export Reports** — Download as PDF or Excel
- 🌙 **Dark Mode UI** — Premium glassmorphism design with smooth animations

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Clone the repo
```bash
git clone https://github.com/naveennithish257/customer-segmentation-dashboard.git
cd customer-segmentation-dashboard
```

### 2. Run with the setup script (Windows)
```bash
setup.bat   # Install all dependencies (first time only)
start.bat   # Start both backend + frontend
```

### 3. Or run manually

**Backend (Flask + ML)**
```bash
cd backend
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5000
```

**Frontend (React + Vite)**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 🗂️ Project Structure

```
customer-segmentation-dashboard/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── pages/          # Dashboard, Segments, Analytics, Reports, AI Insights, Settings
│   │   └── components/     # Charts, UploadPrompt, Sidebar, etc.
│   └── package.json
├── setup.bat               # One-click dependency installer (Windows)
├── start.bat               # One-click launcher (Windows)
└── stop.bat                # Stop all servers
```

---

## 📋 How to Use

1. Open the dashboard at **http://localhost:5173**
2. Upload a customer CSV or Excel file via the upload prompt
3. The system automatically:
   - Detects columns (CustomerID, Age, Gender, Annual Income, Spending Score, etc.)
   - Preprocesses and validates the data
   - Runs K-Means clustering (4 segments)
   - Generates all charts, KPIs, and AI insights
4. Use the sidebar to navigate all 6 pages

---

## 📄 Supported File Formats

| Format | Extension |
|--------|-----------|
| CSV | `.csv` (any delimiter) |
| Excel | `.xlsx`, `.xls` |

## 🏷️ Expected Columns (auto-detected, flexible naming)

| Column | Common Names |
|--------|--------------|
| Customer ID | `CustomerID`, `id`, `cust_id` |
| Age | `age`, `age_years` |
| Gender | `gender`, `sex` |
| Annual Income | `Annual Income (k$)`, `income`, `salary` |
| Spending Score | `Spending Score (1-100)`, `spending_score`, `score` |
| Purchase Frequency | `purchases`, `frequency`, `transactions` |
| Revenue | `revenue`, `total_spend`, `amount` |
| Date | `date`, `join_date`, `signup_date` |

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Recharts |
| Backend | Python, Flask |
| ML | scikit-learn (K-Means), pandas, numpy |
| Styling | Vanilla CSS with glassmorphism |

---

## 📜 License

MIT © [naveennithish257](https://github.com/naveennithish257)
