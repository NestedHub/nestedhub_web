# Property Marketplace Backend

A **FastAPI + PostgreSQL backend** for a property marketplace with role-based access, user authentication, property management, reviews, viewing requests, and wishlists. Designed for **local Docker development** with multiple services.

## Features

- **User Management**
  - Roles: `admin`, `property owner`, `customer`
  - JWT authentication, Google OAuth login
  - Email verification, password reset, ban/unban
  - Admin approval for property owners

- **Property Management**
  - CRUD for properties
  - Search, filtering, sorting, and pagination
  - Property comparison, recommended and related listings
  - Owner-specific stats and listings

- **Reviews & Wishlists**
  - Users can create, view, and manage property reviews
  - Admin/owner approval workflow for reviews
  - Wishlist management per user

- **Viewing Requests**
  - Users can request property viewings
  - Owners/admins can approve/deny requests
  - Upcoming viewings and property-specific requests

- **Admin Dashboard**
  - Statistics: total users, property owners, and properties

## API Overview

- **Users**: `/users`  
  Register, login, verify email, Google OAuth, profile, admin approval/rejection, list/search, ban/unban.

- **Properties**: `/properties`  
  CRUD, search, filters (cities, districts, communes, categories, features), stats, comparison, related/recommended listings.

- **Reviews**: `/reviews`  
  Add, list, approve/reject, delete.

- **Viewing Requests**: `/viewing-requests`  
  Create, list, update, delete, accept/deny, upcoming viewings.

- **Wishlists**: `/wishlist`  
  Add, list, remove, clear properties.

- **Admin**: `/admin`  
  Dashboard statistics.

## Tech Stack

- **Backend:** FastAPI  
- **Database:** PostgreSQL (SQLModel ORM)  
- **Authentication:** JWT, OAuth2 (Google)  
- **Containerization:** Docker  
- **Email:** Verification & notifications  

## Local Development

1. Clone the repo:

```bash
git clone <repo-url>
cd <repo-folder>
```

2. Build and start services with Docker:

```bash
docker-compose up --build
```

3. Access API docs:

```bash
http://localhost:8000/docs
```

4. Default environment variables (from `.env` or Docker setup):

```bash
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_DB
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
```

