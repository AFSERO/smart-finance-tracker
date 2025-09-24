# Smart Finance Tracker

A full-stack personal finance tracker rebuilt with a Python FastAPI backend and a modern React (Vite + Tailwind) frontend. Track income, expenses, assets, and goals from a single dashboard.

## Project Structure

```
backend/   # FastAPI application with SQLAlchemy models and JWT auth
frontend/  # React + Vite client consuming the backend API
```

## Prerequisites

- Python 3.11+
- Node.js 18+
- npm (or pnpm / yarn)

## Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -e .
```

Create `backend/.env` (values shown are examples):

```
SFT_SECRET_KEY=change-me
SFT_DATABASE_URL=sqlite:///./smart_finance.db
SFT_ACCESS_TOKEN_EXPIRE_MINUTES=1440
# Optional: enable live gold pricing from TCMB
# SFT_TCMB_API_KEY=your-api-key
# SFT_TCMB_GOLD_SERIES=TP.DK.NG.A-?
```

Run the API:

```bash
uvicorn app.main:app --reload
```

The OpenAPI docs are available at `http://localhost:8000/docs` once the server is running.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The React app expects the API at `http://localhost:8000` by default. Set `VITE_API_URL` in `frontend/.env` if you need to override it.

## Available Features

- Email/password authentication with JWT sessions
- Transaction CRUD with category management and mock AI categorisation
- Asset tracking with optional live gold valuation
- Dashboard with charts and summaries
- PDF upload stub that simulates transaction ingestion
- Local settings for currency, theme, and financial goals

## Scripts Summary

- `uvicorn app.main:app --reload` – start the FastAPI backend
- `npm run dev` (from `frontend/`) – start the React development server
- `python3 -m compileall backend` – static syntax check for the backend
- `npm run build` (from `frontend/`) – production build for the client

## Next Steps

- Hook the upload endpoint to a real PDF parser
- Implement persistent notification & goal storage
- Add automated tests (PyTest for backend, Vitest/RTL for frontend)
- Containerise the stack for easier deployment
