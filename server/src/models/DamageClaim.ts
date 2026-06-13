import { Schema, model, Document } from 'mongoose';

export interface IDamageClaim extends Document {
  rental: Schema.Types.ObjectId;
  reportedBy: Schema.Types.ObjectId;
  reportedTo: Schema.Types.ObjectId;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
  deductedAmount: number;
  penaltyAmount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Settled';
  inspectionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DamageClaimSchema = new Schema<IDamageClaim>(
  {
    rental: {
      type: Schema.Types.ObjectId,
      ref: 'Rental',
      required: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true,
    },
    deductedAmount: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Deducted amount must be at least 0'],
    },
    penaltyAmount: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Penalty amount must be at least 0'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Settled'],
      default: 'Pending',
    },
    inspectionNotes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const DamageClaim = model<IDamageClaim>('DamageClaim', DamageClaimSchema, 'rentease_damage_claims');
