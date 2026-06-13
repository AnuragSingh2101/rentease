import { Schema, model, Document } from 'mongoose';

export interface IDelivery extends Document {
  rental: Schema.Types.ObjectId;
  vendor: Schema.Types.ObjectId;
  customer: Schema.Types.ObjectId;
  deliveryDate: Date;
  deliveryAddress: string;
  deliveryStatus: 'Scheduled' | 'Assigned' | 'Delivered';
  assignedTo?: string;
  trackingNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema = new Schema<IDelivery>(
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
    deliveryDate: {
      type: Date,
      required: true,
    },
    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryStatus: {
      type: String,
      enum: ['Scheduled', 'Assigned', 'Delivered'],
      default: 'Scheduled',
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

export const Delivery = model<IDelivery>('Delivery', DeliverySchema, 'rentease_deliveries');
