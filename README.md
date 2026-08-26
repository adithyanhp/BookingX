# 🏨 BookingX

### Full-Stack Hotel Booking Platform

BookingX is a full-stack hotel booking platform built to provide a complete hotel discovery and reservation experience. Users can search for hotels by location, explore available rooms, securely authenticate, make bookings, manage reservations, and control their account from a centralized profile.

The project is built with a **React + Vite frontend** and a **Django REST Framework backend**, backed by **PostgreSQL**.

---

## ✨ Features

### 🔐 Authentication & Security

- User registration and login
- JWT-based authentication
- Automatic access-token refresh
- Protected frontend routes
- Secure password change
- Forgot password functionality
- Email-based password reset
- Current-password verification before account deletion
- Permanent account deletion
- Login and logout activity tracking
- Password-change audit logging

### 🏨 Hotel Discovery

- Featured hotels
- Hotel search by name/location
- Location autocomplete using **Geoapify**
- GPS/location-based hotel search
- Hotel and room details
- Hotel images and room images
- Room filtering by hotel

### 📅 Booking System

- Date-range based booking
- Guest selection
- Room availability validation
- Guest-capacity validation
- Check-in/check-out date validation
- Prevention of overlapping bookings
- Transaction-safe booking creation
- Unique booking references
- Booking status management
- Booking cancellation
- Automatic completion of past confirmed bookings
- My Bookings section

### 👤 User Profile

- View profile information
- Update first name and last name
- Update profile image
- Change password
- View booking history
- Permanently delete account

### 🛠️ Administration

Django Admin provides management functionality for:

- Users
- Hotels
- Rooms
- Bookings
- Featured hotels
- User activity logs
- Password-change logs

---

## 🧱 Architecture

BookingX follows a client-server architecture:

```text
┌──────────────────────────────┐
│        React Frontend        │
│          Vite + JS           │
└──────────────┬───────────────┘
               │
               │ REST API
               ▼
┌──────────────────────────────┐
│      Django REST API         │
│     Django + DRF + JWT       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│         PostgreSQL           │
│          Database            │
└──────────────────────────────┘

External Integration:
        │
        └── Geoapify
             └── Location Autocomplete
```

The frontend is responsible for the user interface and client-side application state, while the Django backend handles authentication, business logic, validation, bookings, and database operations.

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- JavaScript
- React Router
- Bootstrap 5
- CSS
- React DatePicker

### Backend

- Python
- Django
- Django REST Framework
- Simple JWT
- REST APIs

### Database

- PostgreSQL
- pgAdmin

### External Services

- Geoapify
- OpenStreetMap-based location data
- Email service for password reset

### Development Tools

- Git
- GitHub
- VS Code
- Django Admin

---

## 📂 Project Structure

```text
BookingX/
│
├── booking-backend/
│   │
│   ├── manage.py
│   ├── requirements.txt
│   │
│   ├── accounts/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── hotels/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│   │
│   └── ...
│
├── booking-ui/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── ...
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure the following are installed:

- Python 3.12+
- Node.js
- npm
- PostgreSQL
- Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/adithyanhp/BookingX.git

cd BookingX
```

---

# ⚙️ Backend Setup

## 2. Navigate to the Backend

```bash
cd booking-backend
```

## 3. Create a Virtual Environment

### Windows

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv
```

```bash
source venv/bin/activate
```

---

## 4. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 5. Configure Environment Variables

Create a `.env` file inside the backend directory.

Example:

```env
SECRET_KEY=your-django-secret-key

DEBUG=True

DB_NAME=bookingx
DB_USER=postgres
DB_PASSWORD=your-postgresql-password
DB_HOST=localhost
DB_PORT=5432

FRONTEND_URL=http://localhost:5173

EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-email-password
```

> **Important:** Never commit your `.env` file or secret credentials to GitHub.

---

## 6. Create the PostgreSQL Database

Create a PostgreSQL database for BookingX.

For example:

```sql
CREATE DATABASE bookingx;
```

Then make sure the database credentials in your `.env` file match your PostgreSQL configuration.

---

## 7. Run Migrations

```bash
python manage.py makemigrations
```

```bash
python manage.py migrate
```

---

## 8. Create a Django Admin Account

```bash
python manage.py createsuperuser
```

Follow the prompts to create your admin account.

---

## 9. Start the Backend Server

```bash
python manage.py runserver
```

The backend will normally be available at:

```text
http://127.0.0.1:8000/
```

---

# 🎨 Frontend Setup

Open another terminal.

## 10. Navigate to the Frontend

From the project root:

```bash
cd booking-ui
```

## 11. Install Dependencies

```bash
npm install
```

---

## 12. Configure Frontend Environment Variables

Create:

```text
.env
```

inside `booking-ui`.

Example:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_GEOAPIFY_API_KEY=your-geoapify-api-key
```

> **Important:** Do not commit API keys or other secrets to GitHub.

---

## 13. Start the Frontend

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173/
```

---

# 🔑 Authentication Flow

BookingX uses **JWT authentication**.

```text
User
 │
 ├── Register
 │
 ▼
Login
 │
 ├── Access Token
 └── Refresh Token
       │
       ▼
Protected API Requests
       │
       ▼
Access Token Expired?
       │
       ├── No → Continue
       │
       └── Yes
             │
             ▼
        Refresh Token
             │
             ▼
        New Access Token
```

The frontend centralizes authenticated API requests and automatically attempts to refresh expired access tokens.

---

# 📍 Location Search

BookingX uses **Geoapify** to provide location autocomplete.

The location system works independently from the hotel database:

```text
User enters location
        │
        ▼
Geoapify Autocomplete
        │
        ▼
User selects location
        │
        ├── Latitude
        └── Longitude
                │
                ▼
        BookingX Django API
                │
                ▼
       Hotel search by distance
```

This allows users to search using real-world locations instead of being limited to predefined database entries.

---

# 🏨 Booking Flow

The main booking workflow is:

```text
Search Location
      │
      ▼
Search Hotels
      │
      ▼
Select Hotel
      │
      ▼
Select Room
      │
      ▼
Choose Dates & Guests
      │
      ▼
Validate Availability
      │
      ▼
Create Booking
      │
      ▼
Booking Confirmation
      │
      ▼
My Bookings
```

The backend performs server-side validation before creating a booking.

---

# 🔒 Booking Integrity

BookingX does not rely only on frontend validation.

The backend validates:

- Check-in date
- Check-out date
- Guest capacity
- Room status
- Room availability
- Existing overlapping bookings

Booking creation uses database transactions and row-level locking to reduce the possibility of conflicting bookings when multiple requests target the same room.

---

# 📊 Booking Lifecycle

Bookings can move through different states:

```text
Pending
   │
   ▼
Confirmed
   │
   ├──────────────► Cancelled
   │
   ▼
Completed
```

Past confirmed bookings can automatically transition to the completed state.

---

# 🔑 Password Reset Flow

BookingX includes a complete password recovery workflow.

```text
Login
  │
  ▼
Forgot Password
  │
  ▼
Enter Email
  │
  ▼
Password Reset Email
  │
  ▼
Reset Link
  │
  ▼
Reset Password Page
  │
  ▼
New Password
  │
  ▼
Password Updated
```

Reset links contain a secure user identifier and token generated by Django's password-reset mechanisms.

---

# 👤 Account Management

Users can manage their account through the Profile section.

Available functionality includes:

- Profile information
- Profile image
- Edit profile
- Change password
- My bookings
- Permanent account deletion

Account deletion requires current-password verification before the account is permanently removed.

---

# 📝 Activity & Security Logging

BookingX includes auditing functionality for security-sensitive operations.

### User Activity

The system records:

- Login
- Logout
- Timestamp
- IP address
- User agent

### Password Changes

Password changes are recorded with information about whether the change was initiated by:

- The user
- An administrator

This provides administrators with better visibility into account security events.

---

# 🛡️ Security Considerations

The project follows several security practices:

- JWT-based authentication
- Protected API endpoints
- Protected frontend routes
- Password hashing through Django
- Current-password verification for account deletion
- Server-side booking validation
- Transaction-safe booking creation
- Environment variables for secrets
- Token refresh handling
- Separation between frontend and backend responsibilities

---

# 🧪 Testing the Application

After starting both servers:

### Frontend

```text
http://localhost:5173
```

### Backend

```text
http://127.0.0.1:8000
```

### Django Admin

```text
http://127.0.0.1:8000/admin/
```

Recommended testing flow:

1. Register a new user.
2. Log in.
3. Search for a location.
4. Select a hotel.
5. Select a room.
6. Choose dates and guests.
7. Create a booking.
8. Check the booking under **My Bookings**.
9. Test booking cancellation.
10. Test profile editing.
11. Test password change.
12. Test forgot-password and reset-password.
13. Test account deletion.
14. Verify records through Django Admin.

---

# 🎯 Project Goals

BookingX was developed to provide practical experience with building a complete full-stack application rather than only implementing isolated frontend pages or backend APIs.

The project focuses on:

- Full-stack architecture
- REST API development
- Database-driven applications
- Authentication and authorization
- Booking business logic
- Transaction management
- API integration
- Location-based search
- Account security
- Administrative management
- Responsive user interfaces

---

# 🔮 Future Improvements

Potential future improvements include:

- Online payment integration
- Hotel reviews and ratings
- Hotel amenities and advanced filtering
- Wishlist/favorites
- Booking invoices
- Email booking confirmations
- Improved hotel recommendation system
- Advanced admin dashboard
- Analytics and booking reports
- Deployment with production infrastructure
- Automated backend and frontend tests
- Docker-based development and deployment
- CI/CD pipeline

---

# 📸 Screenshots

Screenshots can be added here to showcase the application.

Example:

```md
## Screenshots

### Home Page

![BookingX Home Page](screenshots/home.png)

### Hotel Search

![Hotel Search](screenshots/hotel-search.png)

### Booking

![Booking Page](screenshots/booking.png)

### My Bookings

![My Bookings](screenshots/my-bookings.png)

### Profile

![Profile](screenshots/profile.png)
```

---

# 📚 What I Learned

Building BookingX provided hands-on experience with the complete lifecycle of a modern full-stack web application.

Key areas of learning include:

- Designing RESTful APIs with Django REST Framework
- Building reusable React components
- Managing authentication using JWT
- Handling access-token expiration and refresh
- Designing relational database models
- Implementing real-world booking validation
- Preventing overlapping reservations
- Using database transactions for critical operations
- Integrating third-party APIs
- Implementing secure password recovery
- Building administrative tools with Django Admin
- Managing user activity and security logs
- Structuring a frontend/backend application for maintainability

---

# 👨‍💻 Author

**Adithyan H P**

Full-Stack Python Developer | React | Django | PostgreSQL

GitHub: [@adithyanhp](https://github.com/adithyanhp)

---

# ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.

---

## 📄 License

This project is currently intended for educational and portfolio purposes.
