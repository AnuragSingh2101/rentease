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
import { Listing } from './models/Listing';


dotenv.config();


connectDB().then(() => {
  seedAdminUser();
});


const seedInitialListings = async (adminId: any) => {
  try {
    const count = await Listing.countDocuments();
    if (count === 0) {
      const defaultListings = [
        {
          title: "Serene glass villa overlooking the valley",
          description: "Experience a luxurious stay at this stunning glass villa featuring breathtaking floor-to-ceiling panoramic views of the Kasauli valley, premium modern furnishings, a spacious private deck, and top-tier amenities.",
          location: "Kasauli, Himachal Pradesh",
          price: 12000,
          category: "Trending",
          rating: 4.9,
          image: "linear-gradient(135deg, oklch(0.511 0.209 280), oklch(0.607 0.22 301))",
          vendor: adminId
        },
        {
          title: "Luxury Beachfront Condo with Infinity Pool",
          description: "A gorgeous contemporary beachfront condo located in Goa. Offers direct beach access, an exquisite infinity pool overlooking the ocean, private balcony, modern kitchen, and full smart home automation.",
          location: "Goa, India",
          price: 18500,
          category: "Beachfront",
          rating: 4.85,
          image: "linear-gradient(135deg, oklch(0.55 0.18 250), oklch(0.65 0.14 200))",
          vendor: adminId
        },
        {
          title: "Cozy A-frame Wooden Cabin in the Woods",
          description: "Escape to this enchanting wood cabin nestled among pine forests in Manali. Features a rustic brick fireplace, loft bedroom, outdoor bonfire pit, and cozy interiors perfect for couples or solo travelers.",
          location: "Manali, Himachal Pradesh",
          price: 6800,
          category: "Cabins",
          rating: 4.75,
          image: "linear-gradient(135deg, oklch(0.65 0.18 55), oklch(0.75 0.15 85))",
          vendor: adminId
        },
        {
          title: "Minimalist Heritage Loft in Historic District",
          description: "Discover the charm of Pondicherry in this restored heritage building loft. Featuring high arches, vintage wooden beams, minimalist modern decor, high-speed Wi-Fi, and a quiet private courtyard.",
          location: "Pondicherry, India",
          price: 9200,
          category: "Heritage",
          rating: 4.92,
          image: "linear-gradient(135deg, oklch(0.6 0.2 350), oklch(0.55 0.22 15))",
          vendor: adminId
        }
      ];

      await Listing.insertMany(defaultListings);
      console.log('[Seed] 4 Default listings seeded successfully.');
    }
  } catch (err) {
    console.error('[Seed Error] Failed to seed default listings:', err);
  }
};

const seedAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'sysadmin_re_8f3d@rentease.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'p@ss_9K2x#L8!wZp5_reAdmin';

    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      console.warn('[Seed Warning] ADMIN_EMAIL or ADMIN_PASSWORD not set in environment. Using default secure credentials.');
    }

    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Default Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        phone: '+919999999999'
      });
      console.log(`[Seed] Default Admin user created: ${adminEmail}`);
    }

    await seedInitialListings(adminUser._id);
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