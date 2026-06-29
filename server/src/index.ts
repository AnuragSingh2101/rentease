import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import listingsRoutes from './routes/listings';
import productsRoutes from './routes/products';
import bookingRoutes from './routes/bookings';
import cartRoutes from './routes/cart';
import rentalsRoutes from './routes/rentals';
import deliveryRoutes from './routes/deliveries';
import maintenanceRoutes from './routes/maintenance';
import pickupRoutes from './routes/pickups';
import damageClaimRoutes from './routes/damageClaims';
import serviceAreaRoutes from './routes/serviceAreas';
import analyticsRoutes from './routes/analytics';
import notificationRoutes from './routes/notifications';
import reviewRoutes from './routes/reviews';
import { rateLimiter, securityHeaders, requestLogger } from './middleware/production';
import { User } from './models/User';


dotenv.config();


connectDB().then(() => {
  seedAdminUser();
});


const seedAdminUser = async () => {
  try {
    const adminEmail = 'admin@rentease.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'Default Admin',
        email: adminEmail,
        password: 'adminpassword123',
        role: 'admin',
        phone: '+919999999999'
      });
      console.log('[Seed] Default Admin user created: admin@rentease.com / adminpassword123');
    }
  } catch (err) {
    console.error('[Seed Error] Failed to seed default admin user:', err);
  }
};

const app = express();

app.use(securityHeaders);
app.use(rateLimiter);
app.use(requestLogger);


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


app.use(cookieParser());


app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://rentease-my5s.vercel.app'
    ],
    credentials: true,
  })
);


app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'RentEase API is running smoothly',
    version: '1.0.0',
  });
});


app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/rentals', rentalsRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/damage-claims', damageClaimRoutes);
app.use('/api/service-areas', serviceAreaRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);


app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `[Server] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});


process.on('unhandledRejection', (err: any, promise) => {
  console.error(`[Server Error] Unhandled Rejection: ${err.message}`);

  server.close(() => process.exit(1));
});