# 🚜 AgriRenta — On-Demand Agricultural Machinery & Skilled Workforce Platform

AgriRenta is a full-stack, hyper-local platform designed to connect farmers with agricultural machinery providers and skilled farm workforce crews.

---

## 🌟 Key Features

- **Smart Rental Marketplace**: Browse tractors, harvesters, ploughing units, and skilled farm workforce with transparent 0% platform fee policy for manual labor.
- **Interactive Geo Field Navigation**: Real-time road route geometry via OSRM & Google Maps, turn-by-turn driving instructions, and live GPS tracking.
- **Dynamic 20% Advance Escrow**: Automated UPI dynamic QR generator pre-populated with advance amounts.
- **Extreme Weather Guard**: Live Open-Meteo & OpenWeather forecast integration preventing unsafe field operation scheduling.
- **Admin Escrow Dashboard**: Disburse provider payouts instantly via UPI with full audit logging.
- **Zero-Config Local Database**: Automatically falls back to an in-memory MongoDB server if local MongoDB is not running.

---

## 💻 Local Laptop Execution & Deployment Guide

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1-Command Installation
From the root workspace directory, run:
```bash
npm run setup
```
This automatically installs dependencies across root, server, and client.

### Concurrent Local Development
To launch both backend server (port 5000) and frontend Vite dev server (port 5173) simultaneously:
```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`

---

## 🔑 Demo Login Credentials

| Role | Phone Number | Password |
| :--- | :--- | :--- |
| **Farmer (Seeker)** | `9876543210` | `password123` |
| **Provider (Machinery)** | `9876543211` | `password123` |
| **Platform Admin** | `9030585591` | `admin@123` |

---

## 🧪 Automated Testing

To run the complete end-to-end integration and live tracking test suite:
```bash
npm run test
```

---

## 📦 Low-Resource Local Production Setup

### Option A: Standard Node Production Build
```bash
npm run build
npm run start
```
The server will automatically host the built frontend assets at `http://localhost:5000`.

### Option B: PM2 Background Orchestration
```bash
npx pm2 start ecosystem.config.cjs
```

### Option C: Docker Compose Containerization
```bash
docker-compose up --build -d
```
