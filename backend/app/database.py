from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .config import SQLALCHEMY_DATABASE_URL
from .models import Base

engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, future=True)

def create_all():
    Base.metadata.create_all(bind=engine)