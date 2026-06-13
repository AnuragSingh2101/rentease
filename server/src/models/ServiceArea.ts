import { Schema, model, Document } from 'mongoose';

export interface IServiceArea extends Document {
  name: string;
  city: string;
  state: string;
  postalCodes: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceAreaSchema = new Schema<IServiceArea>(
  {
    name: {
      type: String,
      required: [true, 'Please add a service area name'],
      trim: true,
      unique: true,
    },
    city: {
      type: String,
      required: [true, 'Please add a city'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'Please add a state'],
      trim: true,
    },
    postalCodes: {
      type: [String],
      required: [true, 'Please add at least one postal code'],
      validate: {
        validator: function (v: string[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Postal codes list cannot be empty',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ServiceArea = model<IServiceArea>('ServiceArea', ServiceAreaSchema, 'rentease_service_areas');
