# Salon Booking System

A full-stack web application for booking salon appointments with email OTP verification.

## Tech Stack

- **Frontend**: React with Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: SQLite (Development) / PostgreSQL (Production)
- **Email Service**: SendGrid

## Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- SendGrid account and API key

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory with your SendGrid credentials:
   ```
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   FROM_EMAIL=your_verified_sender_email@example.com
   ```

5. Run the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Features

- User-friendly booking form
- Email OTP verification
- Available time slot selection
- Service selection with pricing
- Booking confirmation

## API Endpoints

- `POST /api/send-otp`: Send OTP to user's email
- `POST /api/verify-otp`: Verify OTP and create booking
- `GET /api/services`: Get list of available services
- `GET /api/available-slots`: Get available time slots for a date

## Development

The application uses SQLite for development. For production, you can switch to PostgreSQL by updating the database URL in `backend/app/models/database.py`.

## License

MIT 