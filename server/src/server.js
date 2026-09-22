import fs from 'fs';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import marketplaceRoutes from './routes/marketplaceRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();

// Dynamic CORS Middleware allowing local network IP and public tunnel domains (Cloudflare / Ngrok)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Serve uploads folder statically for equipment and worker images
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads/equipment', express.static(path.join(uploadsPath, 'equipment')));
app.use('/uploads/workers', express.static(path.join(uploadsPath, 'workers')));
app.use('/uploads/jobs', express.static(path.join(uploadsPath, 'jobs')));
app.use('/uploads', express.static(uploadsPath));

// Connect Database
connectDB();

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'AgriRenta API',
    timestamp: new Date().toISOString()
  });
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Provider Routes
app.use('/api/provider', providerRoutes);

// Marketplace Routes
app.use('/api/marketplace', marketplaceRoutes);

// Tracking Routes
app.use('/api/tracking', trackingRoutes);

// Booking Routes
app.use('/api/bookings', bookingRoutes);

// Weather Routes
app.use('/api/weather', weatherRoutes);

// Admin Routes
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// AI/ML Routes
app.use('/api/ai', aiRoutes);

// Serve client dist folder statically if built for production
const clientDistPath = path.join(process.cwd(), '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ServerError]', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`[AgriRenta Server] Bound to http://${HOST}:${PORT} (Accessible locally & over internet tunnels)`);
  console.log(`[AgriRenta Server] Static uploads directory at ${uploadsPath}`);
});
