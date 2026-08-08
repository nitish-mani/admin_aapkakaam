# Admin Panel - AapKaKaam

A modern admin dashboard built with React, Vite, and Material-UI.

## Features

- 🔐 Authentication (Login/Signup)
- 📊 Dashboard with analytics
- 👥 User management
- 📅 Booking management
- 💰 Revenue analytics
- 🔗 Referral tracking
- ⚙️ Settings
- 📱 Responsive design

## API Integration

The frontend connects to the following backend endpoints:

| Endpoint                         | Method | Description        |
| -------------------------------- | ------ | ------------------ |
| `/api/admin/login`               | POST   | Admin login        |
| `/api/admin/signup`              | POST   | Admin registration |
| `/api/admin/dashboard`           | GET    | Dashboard data     |
| `/api/admin/dashboard/refresh`   | POST   | Refresh cache      |
| `/api/admin/analytics/users`     | GET    | User analytics     |
| `/api/admin/analytics/bookings`  | GET    | Booking analytics  |
| `/api/admin/analytics/revenue`   | GET    | Revenue analytics  |
| `/api/admin/analytics/referrals` | GET    | Referral analytics |
| `/api/admin/analytics/export`    | GET    | Export data        |

## Tech Stack

- React 18
- Vite
- Material-UI
- React Query
- Recharts
- React Router v6
- Axios

## Installation

```bash
npm install
```
# admin_aapkakaam
