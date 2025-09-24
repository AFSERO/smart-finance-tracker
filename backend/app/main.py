from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import assets, auth, categories, transactions, upload

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Finance Tracker API")

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(categories.router)
app.include_router(assets.router)
app.include_router(upload.router)


@app.get("/")
def healthcheck():
    return {"status": "ok"}
