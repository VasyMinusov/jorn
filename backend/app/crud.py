from datetime import datetime
from sqlalchemy.orm import Session
from .models import User, Group, Shooting, Exercise, group_members
from .schemas import UserCreate, GroupCreate, ShootingCreate, ExerciseCreate
from .utils import hash_pw, verify_pw, write_upload
import secrets, bcrypt
from .models import TeacherInvite

def get_user_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()

def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)

def create_user(db: Session, obj: UserCreate, is_teacher: bool, teacher_id: int | None) -> User:
    u = User(
        username=obj.username,
        hashed_pw=hash_pw(obj.password),
        is_teacher=is_teacher,
        teacher_id=teacher_id,
    )
    db.add(u); db.commit(); db.refresh(u)
    return u

def create_group(db: Session, owner: User, name: str) -> Group:
    g = Group(name=name, owner_id=owner.id)
    db.add(g); db.commit(); db.refresh(g)
    return g

def add_student_to_group(db: Session, group: Group, student: User):
    stmt = group_members.insert().values(group_id=group.id, student_id=student.id)
    db.execute(stmt); db.commit()

def create_shooting(db: Session, student: User, obj: ShootingCreate, photo_path: str) -> Shooting:
    sh = Shooting(
        student_id=student.id,
        group_id=obj.group_id,
        exercise_id=obj.exercise_id,
        note=obj.note,
        canvas_json=obj.canvas_json,
        photo_path=photo_path,
        time_spent=obj.time_spent,      
        hits_count=obj.hits_count,      
    )
    db.add(sh); db.commit(); db.refresh(sh)
    return sh

def list_shootings(db: Session, teacher: User, student_id: int | None = None, group_id: int | None = None):
    q = db.query(Shooting).join(User, User.id == Shooting.student_id)
    if not teacher.is_teacher:
        q = q.filter(Shooting.student_id == teacher.id)
    else:
        q = q.filter(User.teacher_id == teacher.id)
        if student_id: q = q.filter(Shooting.student_id == student_id)
        if group_id:   q = q.filter(Shooting.group_id == group_id)
    return q.order_by(Shooting.created_at.desc()).all()

# --------- exercises ---------
def create_exercise(db: Session, owner: User, obj: ExerciseCreate, img_path: str) -> Exercise:
    ex = Exercise(
        name=obj.name,
        target_img=img_path,
        max_hits=obj.max_hits,
        time_sec=obj.time_sec,
        owner_id=owner.id,
    )
    db.add(ex); db.commit(); db.refresh(ex)
    return ex

def list_exercises(db: Session, teacher: User) -> list[Exercise]:
    return db.query(Exercise).filter(Exercise.owner_id == teacher.id).order_by(Exercise.created_at.desc()).all()

def list_shootings(
    db: Session,
    teacher: User,
    student_id: int | None = None,
    group_id: int | None = None,
    exercise_id: int | None = None,
    hits_from: int | None = None,
    hits_to: int | None = None,
    time_from: int | None = None,
    time_to: int | None = None,
) -> list[Shooting]:
    q = db.query(Shooting).join(User, User.id == Shooting.student_id)

    if not teacher.is_teacher:
        q = q.filter(Shooting.student_id == teacher.id)
    else:
        q = q.filter(User.teacher_id == teacher.id)
        if student_id:  q = q.filter(Shooting.student_id == student_id)
        if group_id:    q = q.filter(Shooting.group_id == group_id)

    if exercise_id: q = q.filter(Shooting.exercise_id == exercise_id)

    # фильтр по кол-ву попаданий (json-массив canvas_json)
    if hits_from is not None or hits_to is not None:
        from sqlalchemy import func
        hits_cnt = func.json_array_length(Shooting.canvas_json)
        if hits_from is not None:  q = q.filter(hits_cnt >= hits_from)
        if hits_to   is not None:  q = q.filter(hits_cnt <= hits_to)

    # фильтр по времени (секунды в time_sec упражнения)
    if time_from is not None or time_to is not None:
        if time_from is not None:  q = q.join(Exercise).filter(Exercise.time_sec >= time_from)
        if time_to   is not None:  q = q.join(Exercise).filter(Exercise.time_sec <= time_to)

    return q.order_by(Shooting.created_at.desc()).all() 

def create_teacher_invite(db: Session, admin: User, plain_password: str) -> TeacherInvite:
    rec = TeacherInvite(
        code=secrets.token_urlsafe(8)[:8],
        password=hash_pw(plain_password),
        created_by=admin.id,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec

def consume_teacher_invite(db: Session, code: str, plain_password: str) -> TeacherInvite | None:
    inv = db.query(TeacherInvite).filter(
        TeacherInvite.code == code,
        TeacherInvite.is_used == False
    ).first()
    if not inv or not verify_pw(plain_password, inv.password):
        return None
    inv.is_used = True
    inv.used_at = datetime.utcnow()
    db.commit()
    return inv