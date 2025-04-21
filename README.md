# Salon Reservation System

A full-stack web application for managing salon appointments with time slot management and OTP verification.

## Features

- User-friendly booking interface with Material-UI components
- Real-time availability checking for appointment slots
- OTP verification for booking confirmation
- Prevention of double bookings
- Responsive design for all devices

## Tech Stack

### Frontend
- React.js
- Material-UI (MUI)
- React Router DOM

### Backend
- FastAPI
- SQLite Database
- SQLAlchemy ORM
- Pydantic for data validation

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 14+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up the database:
```bash
# Run migrations
alembic upgrade head

# Seed the database with initial data
PYTHONPATH=$PYTHONPATH:. python -m app.scripts.seed_db
```

5. Run the FastAPI server:
```bash
uvicorn app.main:app --reload
```

The backend will be running on `http://localhost:8000`

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

The frontend will be running on `http://localhost:3000`

## Database Management

### Migrations

To create a new migration:
```bash
cd backend
alembic revision --autogenerate -m "description of changes"
```

To apply migrations:
```bash
cd backend
alembic upgrade head
```

### Seeding the Database

The database can be seeded with initial data using:
```bash
cd backend
PYTHONPATH=$PYTHONPATH:. python -m app.scripts.seed_db
```

This will:
- Add default services (Haircut, Hair Coloring, Manicure, Pedicure)
- Create hair artist accounts:
  - Admin: admin@salon.com / admin123
  - Hair Artists: john@salon.com / password123, jane@salon.com / password123

## API Documentation

Once the backend server is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

To run the backend tests:
```bash
cd backend
pytest
```

To run the frontend tests:
```bash
cd frontend
npm test
```

## API Endpoints

- `POST /api/available-slots`: Get available time slots for a specific date
- `POST /api/send-otp`: Send OTP for booking verification
- `POST /api/verify-otp`: Verify OTP and create booking

## Known Issues

- Email OTP delivery functionality is pending implementation
- Currently using console logs for OTP display

## Future Improvements

- Implement email OTP delivery
- Add admin dashboard for managing bookings
- Implement booking cancellation feature
- Add service duration management
- Add staff management system

## Contributing

Feel free to submit issues and enhancement requests.

## License

[MIT](https://choosealicense.com/licenses/mit/) 