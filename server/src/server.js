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

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploads folder statically for raw uploaded images
const uploadsPath = path.join(process.cwd(), 'uploads');
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

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ServerError]', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[AgriRenta Server] Running on http://localhost:${PORT}`);
  console.log(`[AgriRenta Server] Static uploads directory at ${uploadsPath}`);
});
