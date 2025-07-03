import mongoose, { Schema, Document } from 'mongoose';
import { ERROR_MSG } from '../constants/message.js';

export interface IUserPreferences extends Document {
  userId: string;
  challenType: string;
  columnVisibility: Record<string, boolean>;
}

const UserPreferencesSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: [true, ERROR_MSG.REQUIRED("userId")],
      unique: true, 
    },
    tableName: {
      type: String,
      enum: ['customer', 'Return'],
      required: [true, ERROR_MSG.REQUIRED("tableName")]
    },
    columnVisibility: {
      type: Object,
      of: Boolean,
      default: {},
    },
  },
  { timestamps: true }
);

const UserPreferences = mongoose.model<IUserPreferences>('UserPreferences', UserPreferencesSchema);

export default UserPreferences;
