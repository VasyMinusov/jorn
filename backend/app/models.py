from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean, Table, text
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id          = Column(Integer, primary_key=True, index=True)
    username    = Column(String(80), unique=True, index=True)
    hashed_pw   = Column(String(120))
    is_teacher  = Column(Boolean, default=False)
    teacher_id  = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow)

    teacher     = relationship("User", remote_side=[id], backref="students")
    groups      = relationship("Group", back_populates="owner")
    shootings   = relationship("Shooting", back_populates="student")
    exercises   = relationship("Exercise", back_populates="owner")

class Group(Base):
    __tablename__ = "groups"
    id        = Column(Integer, primary_key=True, index=True)
    name      = Column(String(120))
    owner_id  = Column(Integer, ForeignKey("users.id"))
    created_at= Column(DateTime, default=datetime.utcnow)
    owner     = relationship("User", back_populates="groups")
    students  = relationship("User", secondary="group_members")

group_members = Table(
    "group_members",
    Base.metadata,
    Column("group_id", ForeignKey("groups.id"), primary_key=True),
    Column("student_id", ForeignKey("users.id"), primary_key=True),
)

class Exercise(Base):
    __tablename__ = "exercises"
    id        = Column(Integer, primary_key=True, index=True)
    name      = Column(String(200), nullable=False)
    target_img= Column(String(250), nullable=False)
    max_hits  = Column(Integer, default=10)
    time_sec  = Column(Integer, default=0)
    owner_id  = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at= Column(DateTime, default=datetime.utcnow)

    owner     = relationship("User", back_populates="exercises")
    shootings = relationship("Shooting", back_populates="exercise_ref")

    @property
    def target_url(self) -> str:
        return f"/uploads/{self.target_img}"

class Shooting(Base):
    __tablename__ = "shootings"
    id          = Column(Integer, primary_key=True, index=True)
    student_id  = Column(Integer, ForeignKey("users.id"), nullable=False)
    group_id    = Column(Integer, ForeignKey("groups.id"), nullable=True)  # Убедитесь что nullable=True
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    note        = Column(Text)
    canvas_json = Column(Text)
    photo_path  = Column(String(250))
    created_at  = Column(DateTime, default=datetime.utcnow)
    time_spent = Column(Integer, default=0)
    hits_count = Column(Integer, default=0)
    student     = relationship("User", back_populates="shootings")
    group       = relationship("Group")  # Убедитесь что relationship правильно настроен
    exercise_ref= relationship("Exercise", back_populates="shootings")

    @property
    def photo_url(self) -> str:
        return f"/uploads/{self.photo_path}"

    @property
    def exercise(self) -> "Exercise":
        return self.exercise_ref
    
class TeacherInvite(Base):
    __tablename__ = "teacher_invites"
    id          = Column(Integer, primary_key=True, index=True)
    code        = Column(String(64), unique=True, nullable=False)   
    password    = Column(String(120), nullable=False)               
    created_by  = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_used     = Column(Boolean, default=False)
    created_at  = Column(DateTime, default=datetime.utcnow)
    used_at     = Column(DateTime)  