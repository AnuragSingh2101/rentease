import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  monthlyRent: number;
  deposit: number;
  availableQuantity: number;
  category: 'Electronics' | 'Furniture' | 'Appliances' | 'Fitness' | 'Others';
  images: string[];
  tenureOptions: number[];
  vendor: Schema.Types.ObjectId;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    monthlyRent: {
      type: Number,
      required: [true, 'Please add monthly rent price'],
      min: [0, 'Rent must be positive'],
    },
    deposit: {
      type: Number,
      required: [true, 'Please add deposit amount'],
      min: [0, 'Deposit must be positive'],
    },
    availableQuantity: {
      type: Number,
      required: [true, 'Please add available quantity'],
      min: [0, 'Available quantity must be positive'],
      default: 1,
    },
    category: {
      type: String,
      enum: ['Electronics', 'Furniture', 'Appliances', 'Fitness', 'Others'],
      default: 'Others',
    },
    images: {
      type: [String],
      default: ['linear-gradient(to right bottom, #3b82f6, #06b6d4)'],
    },
    tenureOptions: {
      type: [Number],
      default: [3, 6, 12],
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = model<IProduct>('Product', ProductSchema, 'rentease_products');
