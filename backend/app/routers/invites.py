from fastapi import APIRouter, Depends, HTTPException
from ..deps import get_current_user, get_db
from ..models import User
from pydantic import BaseModel
from ..crud import create_teacher_invite, consume_teacher_invite
from sqlalchemy.orm import Session

router = APIRouter(prefix="/invites", tags=["invites"])

class TeacherInviteOut(BaseModel):
    code: str
    password: str          
    link: str             

class TeacherInviteCreate(BaseModel):
    password: str

@router.get("/teacher")
def teacher_invite(user: User = Depends(get_current_user)):
    if not user.is_teacher:
        return {"detail": "forbidden"}
    return {"invite_code": "TEACHER"}   

@router.get("/student")
def student_invite(user: User = Depends(get_current_user)):
    if not user.is_teacher:
        return {"detail": "forbidden"}
    return {"invite_code": f"STU{user.id}"}

@router.post("/teacher-link", response_model=TeacherInviteOut)
def make_teacher_link(
    payload: TeacherInviteCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),          
):
    if not user.is_teacher:
        raise HTTPException(403, "only teachers")
    invite = create_teacher_invite(db, user, payload.password) 
    base = "http://localhost:5173"
    return TeacherInviteOut(
        code=invite.code,
        password=payload.password,
        link=f"{base}/finish-invite?code={invite.code}"
    )

@router.post("/check-invite")
def check_invite(data: dict, db: Session = Depends(get_db)):
    code = data.get("code")
    password = data.get("password")
    inv = consume_teacher_invite(db, code, password)
    if not inv:
        raise HTTPException(400, "bad code or password or already used")
    return {"ok": True}