from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

# --------- базовые схемы ---------
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    password: str = Field(..., min_length=4)
    invite_code: str

class UserOut(BaseModel):
    id: int
    username: str
    is_teacher: bool
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class GroupCreate(BaseModel):
    name: str

class GroupOut(BaseModel):
    id: int
    name: str
    created_at: datetime
    class Config:
        from_attributes = True

# --------- упражнения ---------
class ExerciseCreate(BaseModel):
    name: str
    max_hits: int = Field(10, ge=1)
    time_sec: int = Field(0, ge=0)

class ExerciseOut(BaseModel):
    id: int
    name: str
    target_url: str
    max_hits: int
    time_sec: int
    created_at: datetime
    class Config:
        from_attributes = True

# --------- стрельбы ---------
class ShootingCreate(BaseModel):
    exercise_id: int
    note: Optional[str] = ""
    canvas_json: str
    group_id: Optional[int] = None  # Исправлено: теперь правильный тип
    time_spent: int = Field(..., ge=0)        
    hits_count: int = Field(..., ge=0)

class ShootingOut(BaseModel):
    id: int
    exercise: ExerciseOut          # property модели
    note: str
    canvas_json: str
    photo_url: str                 # property модели
    created_at: datetime
    time_spent: int      
    hits_count: int
    student: UserOut
    group: Optional[GroupOut]      # Исправлено: теперь Optional
    class Config:
        from_attributes = True