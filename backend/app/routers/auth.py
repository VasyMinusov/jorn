from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from ..models import User
from ..deps import get_current_user
from datetime import timedelta
from jose import jwt
from ..deps import get_db
from .. import crud
from ..schemas import Token, UserCreate, UserOut
from ..config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from ..utils import verify_pw
from ..crud import consume_teacher_invite, create_user

router = APIRouter(prefix="/auth", tags=["auth"])

class FinishInvite(BaseModel):
    code: str
    password: str          # пароль из ссылки
    username: str
    new_password: str

@router.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, form_data.username)
    if not user or not verify_pw(form_data.password, user.hashed_pw):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = jwt.encode({"sub": str(user.id)}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}

@router.post("/register", response_model=UserOut)
def register(obj: UserCreate, db: Session = Depends(get_db)):
    # проверим invite_code == teacher или student
    teacher_invite = obj.invite_code == "TEACHER"   # первого учителя создаём вручную
    student_invite = obj.invite_code.startswith("STU")
    if not (teacher_invite or student_invite):
        raise HTTPException(400, "bad invite code")

    if crud.get_user_by_username(db, obj.username):
        raise HTTPException(400, "username taken")

    teacher_id = None
    if student_invite:
        # код = STU<teacher_id>
        try:
            teacher_id = int(obj.invite_code[3:])
        except ValueError:
            raise HTTPException(400, "bad student invite")
        t = crud.get_user_by_id(db, teacher_id)
        if not t or not t.is_teacher:
            raise HTTPException(400, "teacher not found")

    user = crud.create_user(db, obj, is_teacher=teacher_invite, teacher_id=teacher_id)
    return user

@router.get("/me", response_model=UserOut)
def me(u: User = Depends(get_current_user)):
    return u

@router.post("/finish-invite")
def finish_invite(data: FinishInvite, db: Session = Depends(get_db)):
    inv = consume_teacher_invite(db, data.code, data.password)
    if not inv:
        raise HTTPException(400, "bad invite")
    # создаём учителя
    user = create_user(
        db,
        UserCreate(username=data.username, password=data.new_password, invite_code="TEACHER"),
        is_teacher=True,
        teacher_id=None
    )
    return UserOut.from_orm(user)