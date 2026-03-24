# Satyam Medical — Delivery Server

Node.js / Express REST API for the Satyam Medical Delivery Tracker.

---

## Tech Stack

| Layer | Library |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MySQL (mysql2) |
| Auth | JWT (jsonwebtoken) |
| Password hashing | bcryptjs |
| File uploads | Multer |
| Dev server | Nodemon |

---

## Quick Start

### 1. Install dependencies
```bash
cd delivery-server
npm install
```

### 2. Configure environment
Create a `.env` file (copy from `.env.example`):
```env
PORT=5010
NODE_ENV=development

DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=delivery_track

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### 3. Set up database
Run the schema to create all tables:
```bash
mysql -u <user> -p delivery_track < src/config/schema.sql
```

Run the username migration (if upgrading from email-based login):
```bash
mysql -u <user> -p delivery_track < src/config/migrate_add_username.sql
```

### 4. Start server
```bash
npm run dev       # development (nodemon, auto-reload)
npm start         # production
```

Server runs on `http://localhost:5010`

---

## Authentication

Login is **username + password** based. JWT token returned on success — valid for **7 days** (no auto-logout).

### Default credentials
| Role | Username | Password |
|---|---|---|
| Admin | `praveen` | `praveen` |
| Staff | `lalit` | `lalit` |

> Passwords are stored as bcrypt hashes. Use the helper script to generate hashes:
> ```bash
> node -e "const b=require('bcryptjs'); b.hash('yourpassword',10).then(h=>console.log(h))"
> ```

---

## API Reference

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login with username + password |
| POST | `/api/auth/logout` | Public | Logout (JWT is stateless) |

### Deliveries
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/deliveries/stats` | All | Dashboard stats + 7-day chart data |
| GET | `/api/deliveries` | All | Paginated + searchable delivery list |
| POST | `/api/deliveries` | All | Create new delivery |
| GET | `/api/deliveries/:id` | All | Single delivery with payment info |
| PATCH | `/api/deliveries/:id/pay` | All | Mark delivery as paid |
| POST | `/api/deliveries/:id/image` | All | Upload delivery image |

#### GET `/api/deliveries` — query params
| Param | Type | Description |
|---|---|---|
| `page` | number | 0-based page index (default: 0) |
| `size` | number | Page size (default: 20) |
| `status` | `unpaid` \| `paid` | Filter by status |
| `keyword` | string | Search building, room, customer, phone, description, staff name |
| `date_from` | YYYY-MM-DD | Filter from date |
| `date_to` | YYYY-MM-DD | Filter to date |
| `staff_id` | number | Filter by staff |

Response shape:
```json
{
  "data": [...],
  "total": 87,
  "total_amount": 12450.00,
  "page": 0,
  "size": 20,
  "totalPages": 5
}
```

### Staff (Admin only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/staff` | List all staff |
| POST | `/api/staff` | Create staff (name, username, password) |
| PATCH | `/api/staff/:id` | Edit staff (name, username, optional password) |
| DELETE | `/api/staff/:id` | Delete staff (cascades deliveries) |

---

## Database Schema

```
users          — id, name, username (unique), password (bcrypt), role, created_at
deliveries     — id, staff_id, building_name, room_no, customer_name, customer_phone,
                 amount, description, image_url, status (unpaid|paid), created_at, updated_at
payments       — id, delivery_id, amount_paid, payment_mode (cash|online),
                 collected_by, note, paid_at
```

---

## Deployment

Hosted on **Render.com** — `https://del-server.onrender.com`

> Cold starts may take ~30s on the free tier.

---

## Project Structure

```
src/
  config/
    database.js          — MySQL connection pool
    schema.sql           — Fresh install schema
    migrate_add_username.sql — Username column migration
  controllers/
    authController.js    — Login / logout
    deliveryController.js — All delivery + stats logic
    staffController.js   — Staff CRUD
  middleware/
    auth.js              — JWT authenticate + isAdmin
  routes/
    authRoutes.js
    deliveryRoutes.js
    staffRoutes.js
```
