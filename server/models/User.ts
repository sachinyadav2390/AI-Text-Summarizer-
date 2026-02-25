import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // auto createdAt, updatedAt
  }
);

// email index is already created by `unique: true` above

export const User = mongoose.model<IUser>("User", UserSchema);
export default User;
