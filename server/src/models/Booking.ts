import { Schema, model, Document } from 'mongoose';

export interface IBooking extends Document {
  user: Schema.Types.ObjectId;
  vendor: Schema.Types.ObjectId;
  bookingType: 'listing' | 'product';
  listing?: Schema.Types.ObjectId;
  product?: Schema.Types.ObjectId;
  startDate: Date;
  endDate?: Date;
  duration: number;
  totalPrice: number;
  quantity?: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookingType: {
      type: String,
      enum: ['listing', 'product'],
      required: true,
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    startDate: {
      type: Date,
      required: [true, 'Please add a start date'],
    },
    endDate: {
      type: Date,
    },
    duration: {
      type: Number,
      required: true,
      min: [1, 'Duration must be at least 1'],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price must be positive'],
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, 'Quantity must be at least 1'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export const Booking = model<IBooking>('Booking', BookingSchema, 'rentease_bookings');
