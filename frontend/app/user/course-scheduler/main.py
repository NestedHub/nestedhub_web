from fastapi import FastAPI, Request, Form, Depends, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from typing import List, Optional
import random
from datetime import datetime

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./university_scheduler.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    code = Column(String, unique=True, index=True)
    year = Column(Integer)
    credits = Column(Integer, default=3)
    
    # Relationships
    schedules = relationship("Schedule", back_populates="course")

class Professor(Base):
    __tablename__ = "professors"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    department = Column(String)
    
    # Relationships
    availabilities = relationship("ProfessorAvailability", back_populates="professor")
    schedules = relationship("Schedule", back_populates="professor")

class ProfessorAvailability(Base):
    __tablename__ = "professor_availabilities"
    
    id = Column(Integer, primary_key=True, index=True)
    professor_id = Column(Integer, ForeignKey("professors.id"))
    time_slot = Column(String)  # "1M", "2M", "3M", "1A", "2A", "3A"
    
    # Relationships
    professor = relationship("Professor", back_populates="availabilities")

class Schedule(Base):
    __tablename__ = "schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    professor_id = Column(Integer, ForeignKey("professors.id"))
    time_slot = Column(String)
    year = Column(Integer)
    schedule_type = Column(String)  # "morning" or "afternoon"
    created_at = Column(String, default=lambda: datetime.now().isoformat())
    
    # Relationships
    course = relationship("Course", back_populates="schedules")
    professor = relationship("Professor", back_populates="schedules")

# Create tables
Base.metadata.create_all(bind=engine)

# FastAPI app setup
app = FastAPI(title="University Course Scheduler")
templates = Jinja2Templates(directory="templates")

# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Routes
@app.get("/", response_class=HTMLResponse)
async def home(request: Request, db: Session = Depends(get_db)):
    courses = db.query(Course).all()
    professors = db.query(Professor).all()
    schedules = db.query(Schedule).all()
    
    return templates.TemplateResponse("index.html", {
        "request": request,
        "courses": courses,
        "professors": professors,
        "schedules": schedules
    })

# Course Management Routes
@app.get("/courses", response_class=HTMLResponse)
async def courses_page(request: Request, db: Session = Depends(get_db)):
    courses = db.query(Course).all()
    return templates.TemplateResponse("courses.html", {
        "request": request,
        "courses": courses
    })

@app.post("/courses")
async def create_course(name: str = Form(...), code: str = Form(...), 
                       year: int = Form(...), credits: int = Form(3),
                       db: Session = Depends(get_db)):
    # Check if course code already exists
    existing_course = db.query(Course).filter(Course.code == code).first()
    if existing_course:
        raise HTTPException(status_code=400, detail="Course code already exists")
    
    course = Course(name=name, code=code, year=year, credits=credits)
    db.add(course)
    db.commit()
    return RedirectResponse(url="/courses", status_code=303)

@app.post("/courses/{course_id}/delete")
async def delete_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    db.delete(course)
    db.commit()
    return RedirectResponse(url="/courses", status_code=303)

# Professor Management Routes
@app.get("/professors", response_class=HTMLResponse)
async def professors_page(request: Request, db: Session = Depends(get_db)):
    professors = db.query(Professor).all()
    return templates.TemplateResponse("professors.html", {
        "request": request,
        "professors": professors,
        "time_slots": ["1M", "2M", "3M", "1A", "2A", "3A"]
    })

@app.post("/professors")
async def create_professor(name: str = Form(...), email: str = Form(...), 
                          department: str = Form(...), db: Session = Depends(get_db)):
    # Check if email already exists
    existing_prof = db.query(Professor).filter(Professor.email == email).first()
    if existing_prof:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    professor = Professor(name=name, email=email, department=department)
    db.add(professor)
    db.commit()
    return RedirectResponse(url="/professors", status_code=303)

@app.post("/professors/{professor_id}/availability")
async def set_professor_availability(professor_id: int, time_slots: List[str] = Form(...),
                                   db: Session = Depends(get_db)):
    professor = db.query(Professor).filter(Professor.id == professor_id).first()
    if not professor:
        raise HTTPException(status_code=404, detail="Professor not found")
    
    # Clear existing availability
    db.query(ProfessorAvailability).filter(ProfessorAvailability.professor_id == professor_id).delete()
    
    # Add new availability
    for slot in time_slots:
        availability = ProfessorAvailability(professor_id=professor_id, time_slot=slot)
        db.add(availability)
    
    db.commit()
    return RedirectResponse(url="/professors", status_code=303)

@app.post("/professors/{professor_id}/delete")
async def delete_professor(professor_id: int, db: Session = Depends(get_db)):
    professor = db.query(Professor).filter(Professor.id == professor_id).first()
    if not professor:
        raise HTTPException(status_code=404, detail="Professor not found")
    
    db.delete(professor)
    db.commit()
    return RedirectResponse(url="/professors", status_code=303)

# Schedule Management Routes
@app.get("/schedules", response_class=HTMLResponse)
async def schedules_page(request: Request, db: Session = Depends(get_db)):
    schedules = db.query(Schedule).join(Course).join(Professor).all()
    years = db.query(Course.year).distinct().all()
    
    return templates.TemplateResponse("schedules.html", {
        "request": request,
        "schedules": schedules,
        "years": [year[0] for year in years]
    })

@app.post("/schedules/generate")
async def generate_schedule(year: int = Form(...), schedule_type: str = Form(...),
                           db: Session = Depends(get_db)):
    # Clear existing schedules for this year and type
    db.query(Schedule).filter(Schedule.year == year, Schedule.schedule_type == schedule_type).delete()
    
    # Get courses for the year
    courses = db.query(Course).filter(Course.year == year).all()
    
    if not courses:
        raise HTTPException(status_code=400, detail=f"No courses found for year {year}")
    
    # Determine available time slots
    if schedule_type == "morning":
        time_slots = ["1M", "2M", "3M"]
    else:
        time_slots = ["1A", "2A", "3A"]
    
    # Track used time slots to prevent conflicts
    used_slots = set()
    
    # Assign courses to time slots
    for course in courses:
        # Get available professors for this course (simplified - any professor can teach any course)
        available_professors = db.query(Professor).join(ProfessorAvailability).filter(
            ProfessorAvailability.time_slot.in_(time_slots)
        ).all()
        
        if not available_professors:
            continue
        
        # Find a suitable time slot and professor
        assigned = False
        for slot in time_slots:
            if slot in used_slots:
                continue
                
            # Find professors available for this slot
            slot_professors = []
            for prof in available_professors:
                prof_slots = [avail.time_slot for avail in prof.availabilities]
                if slot in prof_slots:
                    slot_professors.append(prof)
            
            if slot_professors:
                # Randomly select a professor
                selected_professor = random.choice(slot_professors)
                
                # Create schedule entry
                schedule = Schedule(
                    course_id=course.id,
                    professor_id=selected_professor.id,
                    time_slot=slot,
                    year=year,
                    schedule_type=schedule_type
                )
                db.add(schedule)
                used_slots.add(slot)
                assigned = True
                break
        
        if not assigned:
            # If we can't assign a course, we might need to handle this case
            # For now, we'll just skip it
            pass
    
    db.commit()
    return RedirectResponse(url="/schedules", status_code=303)

@app.post("/schedules/clear")
async def clear_schedules(year: int = Form(...), schedule_type: str = Form(...),
                         db: Session = Depends(get_db)):
    db.query(Schedule).filter(Schedule.year == year, Schedule.schedule_type == schedule_type).delete()
    db.commit()
    return RedirectResponse(url="/schedules", status_code=303)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

