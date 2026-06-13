import { Schema, model, Document } from 'mongoose';

export interface IMaintenance extends Document {
  user: Schema.Types.ObjectId;
  itemType: 'listing' | 'product';
  listing?: Schema.Types.ObjectId;
  product?: Schema.Types.ObjectId;
  rental?: Schema.Types.ObjectId;
  booking?: Schema.Types.ObjectId;
  title: string;
  description: string;
  images: string[];
  status: 'Open' | 'In Progress' | 'Resolved';
  comments: {
    user: Schema.Types.ObjectId;
    name: string;
    text: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceSchema = new Schema<IMaintenance>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    itemType: {
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
    rental: {
      type: Schema.Types.ObjectId,
      ref: 'Rental',
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      default: 'Open',
    },
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        text: {
          type: String,
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

export const Maintenance = model<IMaintenance>('Maintenance', MaintenanceSchema, 'rentease_maintenance');
