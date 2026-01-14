from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
from ..deps import get_db, get_current_user
from .. import crud
from ..crud import create_shooting
from ..models import User, Exercise
from ..schemas import ShootingCreate, ShootingOut
from ..utils import write_upload
from typing import List, Optional
from fastapi import Query

router = APIRouter(prefix="/shootings", tags=["shootings"])

@router.post("/", response_model=ShootingOut)
def add_shooting(
    exercise_id: int = Form(...),
    note: Optional[str] = Form(""),
    canvas_json: str = Form(...),
    group_id: Optional[int] = Form(None),  # Исправлено: теперь правильно обрабатывается
    time_spent: int = Form(..., ge=0),        
    hits_count: int = Form(..., ge=0),        
    photo: UploadFile = File(...),
    student: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if student.is_teacher:
        raise HTTPException(403, "teachers cannot shoot")
    ex = db.get(Exercise, exercise_id)
    if not ex:
        raise HTTPException(404, "exercise not found")

    if hits_count > ex.max_hits:
        raise HTTPException(400, f"max hits for exercise is {ex.max_hits}")
    if ex.time_sec and time_spent > ex.time_sec:
        raise HTTPException(400, f"max time for exercise is {ex.time_sec} s")

    # Проверяем, что группа принадлежит учителю студента
    if group_id:
        from ..models import Group
        group = db.get(Group, group_id)
        if not group:
            raise HTTPException(404, "group not found")
        
        # Проверяем, что студент состоит в этой группе
        from ..models import group_members
        student_in_group = db.query(group_members).filter(
            group_members.c.group_id == group_id,
            group_members.c.student_id == student.id
        ).first()
        
        if not student_in_group:
            raise HTTPException(403, "student is not member of this group")

    fname = write_upload(photo.file.read(), photo.filename)
    obj = ShootingCreate(
        exercise_id=exercise_id,
        note=note,
        canvas_json=canvas_json,
        group_id=group_id,  # Теперь передается правильно
        time_spent=time_spent,
        hits_count=hits_count,
    )
    sh = create_shooting(db, student, obj, fname)
    return sh

@router.get("/", response_model=List[ShootingOut])
def list_shootings(
    student_id: Optional[int] = Query(None),
    group_id: Optional[int] = Query(None),
    exercise_id: Optional[int] = Query(None),
    hits_from: Optional[int] = Query(None, ge=0),
    hits_to: Optional[int] = Query(None, ge=0),
    time_from: Optional[int] = Query(None, ge=0),
    time_to: Optional[int] = Query(None, ge=0),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    print(f"Filter params: student_id={student_id}, group_id={group_id}, exercise_id={exercise_id}, "
          f"hits_from={hits_from}, hits_to={hits_to}, time_from={time_from}, time_to={time_to}")
    
    result = crud.list_shootings(
        db=db,
        teacher=user,
        student_id=student_id,
        group_id=group_id,
        exercise_id=exercise_id,
        hits_from=hits_from,
        hits_to=hits_to,
        time_from=time_from,
        time_to=time_to
    )
    
    print(f"Found {len(result)} results")
    return result