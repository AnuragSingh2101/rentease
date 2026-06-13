import { Schema, model, Document } from 'mongoose';

export interface IListing extends Document {
  title: string;
  description: string;
  location: string;
  price: number;
  category: 'Trending' | 'Beachfront' | 'Cabins' | 'Heritage' | 'Villas' | 'Apartments' | 'Others';
  rating: number;
  image: string;
  vendor: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new Schema<IListing>(
  {
    title: {
      type: String,
      required: [true, 'Please add a listing title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please add a price per night'],
      min: [0, 'Price must be positive'],
    },
    category: {
      type: String,
      enum: ['Trending', 'Beachfront', 'Cabins', 'Heritage', 'Villas', 'Apartments', 'Others'],
      default: 'Others',
    },
    rating: {
      type: Number,
      default: 5.0,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    image: {
      type: String,
      default: 'linear-gradient(to right bottom, #6366f1, #a855f7)',
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Listing = model<IListing>('Listing', ListingSchema, 'rentease_listings');
