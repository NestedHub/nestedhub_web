# University Course Scheduling Portal

A web-based university course scheduling system built with FastAPI, SQLite, and Jinja2 templates. This system allows administrators to manage courses, professors, and automatically generate conflict-free schedules.

## Features

### Course Management
- Add, view, and delete courses
- Organize courses by academic year (1-4)
- Track course codes, names, and credit hours
- Course statistics dashboard

### Professor Management
- Add and manage professor profiles
- Set professor availability for time slots
- Support for morning (1M, 2M, 3M) and afternoon (1A, 2A, 3A) time blocks
- Visual time slot management interface

### Automated Scheduling
- Generate schedules for specific academic years
- Choose between morning or afternoon scheduling
- Automatic conflict prevention (no overlapping time slots)
- Random professor assignment from available pool
- Clear and regenerate schedules as needed

### Dashboard & Reporting
- Overview of courses, professors, and schedules
- Visual schedule display with time slot information
- Schedule statistics and summaries
- Responsive web interface

## Time Slot System

### Morning Slots
- **1M**: 8:00 AM - 9:30 AM
- **2M**: 9:45 AM - 11:15 AM
- **3M**: 11:30 AM - 1:00 PM

### Afternoon Slots
- **1A**: 1:30 PM - 3:00 PM
- **2A**: 3:15 PM - 4:45 PM
- **3A**: 5:00 PM - 6:30 PM

## Installation

1. **Clone or download the project files**

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application:**
   ```bash
   python main.py
   ```

4. **Access the application:**
   Open your browser and go to `http://localhost:8000`

## Quick Start Guide

### Step 1: Add Courses
1. Navigate to "Courses" from the sidebar
2. Fill out the course form with:
   - Course name (e.g., "Introduction to Programming")
   - Course code (e.g., "CS101")
   - Academic year (1-4)
   - Credit hours (default: 3)
3. Click "Add Course"

### Step 2: Add Professors
1. Navigate to "Professors" from the sidebar
2. Add professor details:
   - Full name
   - Email address
   - Department
3. Set their availability by checking time slots
4. Click "Update Availability"

### Step 3: Generate Schedules
1. Navigate to "Schedules" from the sidebar
2. Select the academic year
3. Choose schedule type (Morning or Afternoon)
4. Click "Generate Schedule"

## Database Schema

The system uses SQLite with the following tables:

- **courses**: Stores course information
- **professors**: Stores professor details
- **professor_availabilities**: Tracks professor time slot availability
- **schedules**: Stores generated schedule assignments

## Technology Stack

- **Backend**: FastAPI (Python web framework)
- **Database**: SQLite with SQLAlchemy ORM
- **Frontend**: Jinja2 templates with Bootstrap 5
- **Icons**: Font Awesome
- **Server**: Uvicorn ASGI server

## Project Structure

```
course-scheduler/
├── main.py                 # Main FastAPI application
├── requirements.txt        # Python dependencies
├── README.md              # This file
├── templates/             # Jinja2 templates
│   ├── base.html         # Base template
│   ├── index.html        # Dashboard
│   ├── courses.html      # Course management
│   ├── professors.html   # Professor management
│   └── schedules.html    # Schedule management
├── static/               # Static files (CSS, JS, images)
└── university_scheduler.db # SQLite database (created on first run)
```

## Features in Detail

### Conflict Prevention
- The system ensures no two courses are scheduled in the same time slot for the same year/type
- Professors are only assigned to time slots they're available for
- Each professor can only teach one course per time slot

### Schedule Generation Algorithm
1. Clear any existing schedules for the selected year/type
2. Retrieve all courses for the specified academic year
3. Determine available time slots based on schedule type
4. For each course:
   - Find professors available for the selected time period
   - Find an unused time slot
   - Randomly assign an available professor
   - Create the schedule entry

### Responsive Design
- Mobile-friendly interface
- Bootstrap-based responsive layout
- Intuitive navigation with sidebar menu
- Visual indicators for different schedule types

## Customization

### Adding More Time Slots
To add additional time slots, modify the time slot arrays in `main.py` and update the time slot reference in the professor template.

### Extending Course Properties
Add new fields to the Course model in `main.py` and update the corresponding templates.

### Custom Scheduling Logic
Modify the `generate_schedule` function in `main.py` to implement custom assignment rules or constraints.

## Troubleshooting

### No Schedules Generated
- Ensure courses exist for the selected year
- Verify professors have availability set for the chosen time period
- Check that there are enough time slots for all courses

### Database Issues
- Delete `university_scheduler.db` to reset the database
- Restart the application to recreate tables

### Port Already in Use
- Change the port in `main.py`: `uvicorn.run(app, host="0.0.0.0", port=8001)`

## License

This project is provided as-is for educational and demonstration purposes.

