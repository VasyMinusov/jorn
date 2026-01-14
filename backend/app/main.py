# backend/app/main.py
import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from .database import create_all
from .config import UPLOAD_DIR, PORT
from .routers import auth, invites, groups, students, shootings, exercises

app = FastAPI(title="ShootingJournal", version="0.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://vasyminusov-jornal-frontend-8898.twc1.net"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

create_all()

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

for r in (auth, invites, groups, students, shootings, exercises):
    app.include_router(r.router)

# SPA fallback
@app.get("/{full_path:path}")
async def spa(full_path: str):
    if full_path.startswith("api") or full_path.startswith("uploads"):
        return
    return FileResponse("static/index.html")

# health-check
@app.get("/health")
def health():
    return {"status": "ok"}

# создаём первого учителя, если БД пуста
from sqlalchemy.orm import Session
from .database import SessionLocal
from .crud import create_user
from .schemas import UserCreate

def create_first_teacher():
    db: Session = SessionLocal()
    if db.query(User).first() is None:
        create_user(db, UserCreate(username="Admin", password="admin", invite_code="TEACHER"), is_teacher=True, teacher_id=None)
    db.close()

create_first_teacher()

# удобный запуск локально
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=PORT)