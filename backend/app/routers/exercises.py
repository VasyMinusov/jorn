from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from ..deps import get_db, get_current_user
from ..models import User, Exercise
from ..schemas import ExerciseOut, ExerciseCreate
from ..crud import create_exercise, list_exercises
from ..utils import write_upload

router = APIRouter(prefix="/exercises", tags=["exercises"])

@router.get("/", response_model=List[ExerciseOut])
def get_exercises(teacher: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not teacher.is_teacher:
        raise HTTPException(403, "teachers only")
    return list_exercises(db, teacher)

@router.post("/", response_model=ExerciseOut)
def add_exercise(
    name: str = Form(...),
    max_hits: int = Form(10),
    time_sec: int = Form(0),
    target: UploadFile = File(...),
    teacher: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not teacher.is_teacher:
        raise HTTPException(403, "teachers only")
    fname = write_upload(target.file.read(), target.filename)
    ex = create_exercise(db, teacher, ExerciseCreate(name=name, max_hits=max_hits, time_sec=time_sec), fname)
    return ex

@router.get("/my-teacher", response_model=List[ExerciseOut])
def get_teacher_exercises(student: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Студент получает список упражнений своего преподавателя"""
    if student.is_teacher:
        raise HTTPException(403, "students only")
    if not student.teacher_id:
        raise HTTPException(404, "no teacher assigned")
    return db.query(Exercise).filter(Exercise.owner_id == student.teacher_id).order_by(Exercise.created_at.desc()).all()

@router.get("/available", response_model=List[ExerciseOut])
def get_available_exercises(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Возвращает доступные упражнения в зависимости от роли пользователя"""
    if user.is_teacher:
        # Преподаватель видит свои упражнения
        return list_exercises(db, user)
    else:
        # Студент видит упражнения своего преподавателя
        if not user.teacher_id:
            raise HTTPException(404, "no teacher assigned")
        return db.query(Exercise).filter(
            Exercise.owner_id == user.teacher_id
        ).order_by(Exercise.created_at.desc()).all()