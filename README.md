# WarranTech 🛡️
### Warranty & Digital Receipt Organizer
**Group 6 | APPINTR BTIS3 (2T AY 25-26)**  
April Abegail B. Chiu · Mary Andrea C. Baron · Jed Lawrence S. Engbino

---

## Overview
WarranTech is a full-stack web application that helps households track product warranties and digital receipts to avoid missed deadlines and unclaimed warranty claims.

## Tech Stack
| Layer | Technology |
|---|---|
| Backend API | Python 3.11 + Django 4.2 + Django REST Framework |
| Authentication | djangorestframework-simplejwt (JWT) |
| Database | SQLite (via Django ORM) |
| Frontend | Vanilla HTML/CSS/JS + Axios (Django Templates) |
| Image Storage | Local media folder |

## Quick Start

### 1. Clone and set up virtual environment
```bash
git clone <repo-url>
cd WarranTech
python -m venv venv
# Windows:
venv\Scripts\activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment
```bash
copy .env.example .env
# Edit .env and set a strong SECRET_KEY
```

### 4. Run migrations
```bash
python manage.py migrate
```

### 5. Create superuser (optional, for /admin/)
```bash
python manage.py createsuperuser
```

### 6. Start the development server
```bash
python manage.py runserver
```

Open **http://127.0.0.1:8000** in your browser — you'll be redirected to the login page.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register/` | Public | Create new user account |
| POST | `/api/auth/login/` | Public | Authenticate → returns JWT |
| POST | `/api/auth/refresh/` | Public | Refresh access token |
| GET/PATCH | `/api/auth/profile/` | ✅ | View/update own profile |
| GET | `/api/items/` | ✅ | List all user receipts |
| POST | `/api/items/` | ✅ | Create receipt (multipart/form-data) |
| GET | `/api/items/{id}/` | ✅ | Retrieve single receipt |
| PUT/PATCH | `/api/items/{id}/` | ✅ | Full / partial update |
| DELETE | `/api/items/{id}/` | ✅ | Delete receipt |
| GET | `/api/reminders/` | ✅ | Items expiring ≤ 30 days |

## Features
- 🔐 JWT Authentication with silent token refresh
- 🧾 Receipt CRUD with image upload
- ⏰ Smart 30-day warranty expiry reminders
- 🔍 Searchable, filterable, sortable receipt list
- 📱 Fully responsive design (mobile + desktop)
- 🍞 Toast notifications + loading indicators
- 🛡️ Input validation (future-date checks, required fields)
- 🚦 DRF throttling to prevent brute-force

## Project Structure
```
warrantech/          Django config package
apps/
  accounts/          Auth (register, login, JWT)
  receipts/          Receipt CRUD + image upload
  reminders/         30-day expiry API
  frontend/          Django templates + static files
    templates/       HTML pages
    static/
      css/styles.css Design system
      js/            Axios + page modules
media/               Uploaded images (gitignored)
```
