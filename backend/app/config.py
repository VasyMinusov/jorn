import os
import secrets
from pathlib import Path

BASE_DIR   = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

DATABASE_URL = os.getenv("DATABASE_URL") or f"sqlite:///{BASE_DIR / 'journal.db'}"

SQLALCHEMY_DATABASE_URL = DATABASE_URL

SECRET_KEY   = os.getenv("SECRET_KEY") or secrets.token_urlsafe(32)
ALGORITHM    = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

PORT = int(os.getenv("PORT", 8000))