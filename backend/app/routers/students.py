from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from ..deps import get_db, get_current_user
from ..models import User
from ..schemas import UserOut
from ..crud import create_user, add_student_to_group
from typing import List
from sqlalchemy import exists

router = APIRouter(prefix="/students", tags=["students"])

class StudentCreateByTeacher(BaseModel):
    username: str
    password: str
    group_id: int | None = Field(None, description="Сразу добавить в группу")

@router.get("/", response_model=List[UserOut])
def my_students(db: Session = Depends(get_db), teacher = Depends(get_current_user)):
    if not teacher.is_teacher:
        raise HTTPException(403)
    return teacher.students


@router.get("/without-group", response_model=List[UserOut])
def students_without_group(db: Session = Depends(get_db), teacher = Depends(get_current_user)):
    """Студы без группы (чтобы можно было добавлять)"""
    if not teacher.is_teacher:
        raise HTTPException(403)
    from ..models import group_members
    # студенты учителя, которых нет ни в одной группе
    sub = db.query(group_members.c.student_id).subquery()
    q = db.query(User).filter(
        User.teacher_id == teacher.id,
        User.is_teacher == False,
        ~User.id.in_(sub)
    )
    return q.all()

@router.post("/create", response_model=UserOut)
def create_student(
    payload: StudentCreateByTeacher,
    db: Session = Depends(get_db),
    teacher=Depends(get_current_user),
):
    if not teacher.is_teacher:
        raise HTTPException(403, "only teachers can create students")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(400, "username already exists")

    # создаём ученика
    student = create_user(
        db, payload, is_teacher=False, teacher_id=teacher.id
    )

    # сразу в группу, если выбрали
    if payload.group_id:
        from ..models import Group
        g = db.get(Group, payload.group_id)
        if not g or g.owner_id != teacher.id:
            raise HTTPException(404, "group not found")
        add_student_to_group(db, g, student)

    return student