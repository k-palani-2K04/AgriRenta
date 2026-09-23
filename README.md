# 🚜 AgriRenta — On-Demand Agricultural Machinery & Skilled Workforce Platform

AgriRenta is a full-stack, hyper-local platform designed to connect farmers with agricultural machinery providers and skilled farm workforce crews. Adopting the CropHelix modern UI/UX design system with warm off-white aesthetics (`#FAF8F5`) and deep agricultural green (`#0F763E`), AgriRenta enforces strict Indian regional units (`₹ Rupees`, `km`, `Acres`) and real-time GPS proximity dispatch.

---

## 🌟 Key Features

- **CropHelix Modern UI/UX Design System**: Soft cream background (`#FAF8F5`), top weather advisory ticker, green pill search bar with `🌱 Search Now` embedded button, and high-contrast WCAG AA accessible controls.
- **Smart Rental Marketplace**: Browse tractors, harvesters, ploughing units, and skilled farm workforce with transparent 0% platform fee policy for manual labor.
- **Extreme Weather Guard (No API Key Required)**: Real-time Open-Meteo forecast API integration querying live GPS coordinates to prevent unsafe field operations during heavy rain or high winds. *(Optional OpenWeatherMap backup key support).*
- **Interactive Geo Field Navigation**: Real-time road route geometry via OSRM & Google Maps, turn-by-turn driving instructions, and live GPS tracking.
- **Dynamic 20% Advance Escrow**: Automated UPI dynamic QR generator pre-populated with advance amounts.
- **Strict Indian Units Enforcement**: Formatted monetary metrics in Indian Rupees (`₹` e.g., `₹1,24,450.78`, `₹1,200/hr`), distance in `km`, land in `Acres`, and regions in Indian districts (`Guntur, AP`, `Tirupati`, `Vijayawada`).
- **Admin Escrow Dashboard**: Disburse provider payouts instantly via UPI with full audit logging.
- **Zero-Config Local Database**: Automatically falls back to an in-memory MongoDB server if local MongoDB is not running.

---

## 🌤️ Weather Integration & API Key Configuration

- **Default Live Weather Engine**: Uses **Open-Meteo API** (Free, open access, **NO API Key required**). Automatically retrieves live temperature, wind speed (km/h), precipitation (mm), and weather condition codes based on farmer GPS coordinates.
- **Optional OpenWeatherMap Backup**: If you wish to use OpenWeatherMap as a backup, set `OPENWEATHER_API_KEY` in `server/.env`:
  ```env
  OPENWEATHER_API_KEY=your_optional_api_key_here
  ```

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

### 🌐 Public Mobile Access via Tunneling
To expose your local backend server to smartphones or remote testing devices, run:
```bash
npx localtunnel --port 5000 --local-host 127.0.0.1
```

---

## 🔑 Demo Login Credentials

| Role | Phone Number | Password |
| :--- | :--- | :--- |
| **Farmer (Seeker)** | `9876543210` | `AgriPass#2026` |
| **Provider (Machinery)** | `9876543211` | `AgriPass#2026` |
| **Platform Admin** | `9030585591` | `AgriAdmin#2026` |

---

## 🧪 Automated End-to-End Testing

To run the complete 7-stage automated E2E test suite covering design system color cascades, auth, weather guard, escrow checkout, and live geo navigation:
```bash
npm run test
```
Or run directly:
```bash
node server/test-full-e2e.js
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
