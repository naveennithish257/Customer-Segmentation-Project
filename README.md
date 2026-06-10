# Customer Segmentation Analytics Dashboard

## Quick Start

### 1. Backend (Flask + ML)
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Server starts on **http://localhost:5000**

### 2. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
App opens at **http://localhost:5173**

---

## How to Use
1. Open the dashboard at http://localhost:5173
2. Upload your customer CSV or Excel file via the upload prompt
3. The system automatically:
   - Detects columns (CustomerID, Age, Gender, Annual Income, Spending Score, etc.)
   - Preprocesses and validates the data
   - Runs K-Means clustering (4 segments)
   - Generates all charts, KPIs, and AI insights
4. Use the sidebar to navigate all 6 pages

## Supported File Formats
- **CSV** (any delimiter)
- **Excel** (.xlsx, .xls)

## Expected Columns (auto-detected, flexible naming)
| Column | Common Names |
|---|---|
| Customer ID | CustomerID, id, cust_id |
| Age | age, age_years |
| Gender | gender, sex |
| Annual Income | Annual Income (k$), income, salary |
| Spending Score | Spending Score (1-100), spending_score, score |
| Purchase Frequency | purchases, frequency, transactions |
| Revenue | revenue, total_spend, amount |
| Date | date, join_date, signup_date |

## Pages
- **Dashboard** — KPI cards, revenue & gender charts, segment table
- **Customer Segments** — Scatter plot, clickable segment cards, customer table
- **Analytics** — 6 interactive charts with filters
- **Reports** — PDF/Excel export + data preview
- **AI Insights** — Per-segment strategies, high-value customers, churn risk
- **Settings** — Data management, appearance, API config
