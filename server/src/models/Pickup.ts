import { Schema, model, Document } from 'mongoose';

export interface IPickup extends Document {
  rental: Schema.Types.ObjectId;
  vendor: Schema.Types.ObjectId;
  customer: Schema.Types.ObjectId;
  pickupDate: Date;
  pickupAddress: string;
  pickupStatus: 'Requested' | 'Scheduled' | 'Picked Up' | 'Completed';
  assignedTo?: string;
  trackingNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PickupSchema = new Schema<IPickup>(
  {
    rental: {
      type: Schema.Types.ObjectId,
      ref: 'Rental',
      required: true,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pickupDate: {
      type: Date,
      required: true,
    },
    pickupAddress: {
      type: String,
      required: true,
      trim: true,
    },
    pickupStatus: {
      type: String,
      enum: ['Requested', 'Scheduled', 'Picked Up', 'Completed'],
      default: 'Requested',
    },
    assignedTo: {
      type: String,
      trim: true,
      default: '',
    },
    trackingNotes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Pickup = model<IPickup>('Pickup', PickupSchema, 'rentease_pickups');
