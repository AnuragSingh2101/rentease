import { Schema, model, Document } from 'mongoose';

export interface IRental extends Document {
  user: Schema.Types.ObjectId;
  product: Schema.Types.ObjectId;
  quantity: number;
  tenure: number; // in months
  deliveryDate: Date;
  deliveryAddress: string;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  deposit: number;
  totalPrice: number;
  status: 'Pending' | 'Approved' | 'Delivered' | 'Active' | 'Returned' | 'Cancelled';
  extensionHistory?: {
    extendedByMonths: number;
    previousEndDate: Date;
    newEndDate: Date;
    extraPaidAmount: number;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const RentalSchema = new Schema<IRental>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    tenure: {
      type: Number,
      required: true,
      min: [1, 'Tenure must be at least 1 month'],
    },
    deliveryDate: {
      type: Date,
      required: [true, 'Please provide a delivery date'],
    },
    deliveryAddress: {
      type: String,
      required: [true, 'Please provide a delivery address'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    monthlyRent: {
      type: Number,
      required: true,
      min: [0, 'Monthly rent must be positive'],
    },
    deposit: {
      type: Number,
      required: true,
      min: [0, 'Deposit must be positive'],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price must be positive'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Delivered', 'Active', 'Returned', 'Cancelled'],
      default: 'Pending',
    },
    extensionHistory: [
      {
        extendedByMonths: {
          type: Number,
          required: true,
        },
        previousEndDate: {
          type: Date,
          required: true,
        },
        newEndDate: {
          type: Date,
          required: true,
        },
        extraPaidAmount: {
          type: Number,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Rental = model<IRental>('Rental', RentalSchema, 'rentease_rentals');
