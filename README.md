# DeliveryTrack Backend API

Medical shop delivery tracking system backend.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env`
   - Update database credentials in `.env`

3. **Setup database**
   ```bash
   node setup.js
   ```

4. **Start server**
   ```bash
   npm start          # production
   npm run dev        # development with nodemon
   ```

Server runs on `http://localhost:5000`

## Default Login Credentials

**Admin:**
- Email: `admin@delivery.com`
- Password: `admin123`

**Staff:**
- Email: `ramesh@delivery.com`
- Password: `staff123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login (returns JWT token)
- `POST /api/auth/logout` - Logout

### Deliveries
- `GET /api/deliveries` - List deliveries (with filters)
- `POST /api/deliveries` - Create delivery
- `GET /api/deliveries/:id` - Get single delivery
- `PATCH /api/deliveries/:id/pay` - Mark as paid
- `POST /api/deliveries/:id/image` - Upload image

### Staff (Admin only)
- `GET /api/staff` - List all staff
- `POST /api/staff` - Create staff account
- `DELETE /api/staff/:id` - Delete staff

## Query Parameters

**GET /api/deliveries**
- `status` - Filter by status (unpaid/paid)
- `date_from` - Filter from date (YYYY-MM-DD)
- `date_to` - Filter to date (YYYY-MM-DD)
- `staff_id` - Filter by staff (admin only)

## Tech Stack
- Node.js + Express
- MySQL
- JWT Authentication
- Multer (file uploads)
