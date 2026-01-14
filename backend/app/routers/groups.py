from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..deps import get_db, get_current_user
from .. import crud
from ..schemas import GroupCreate, GroupOut
from typing import List
from ..models import Group

router = APIRouter(prefix="/groups", tags=["groups"])

@router.post("/", response_model=GroupOut)
def create_group(obj: GroupCreate, db: Session = Depends(get_db), u = Depends(get_current_user)):
    if not u.is_teacher:
        return {"detail": "forbidden"}
    return crud.create_group(db, u, obj.name)

@router.get("/", response_model=List[GroupOut])
def my_groups(db: Session = Depends(get_db), u = Depends(get_current_user)):
    if u.is_teacher:
        return u.groups

    from ..models import group_members
    from sqlalchemy import select
    ids = db.execute(select(group_members.c.group_id).where(group_members.c.student_id == u.id)).scalars().all()
    return db.query(Group).filter(Group.id.in_(ids)).all()