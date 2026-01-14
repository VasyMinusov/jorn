import uuid, os
from pathlib import Path
from passlib.context import CryptContext

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_pw(pw: str) -> str:
    return pwd_ctx.hash(pw[:72])

def verify_pw(pw: str, hashed: str) -> bool:
    return pwd_ctx.verify(pw[:72], hashed)

def write_upload(file_bytes: bytes, original_name: str) -> str:
    ext = Path(original_name).suffix
    name = f"{uuid.uuid4()}{ext}"
    path = Path("uploads") / name
    with open(path, "wb") as f:
        f.write(file_bytes)
    return name