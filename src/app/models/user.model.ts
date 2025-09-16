import { Schema, model, Document } from "mongoose";
import { ROLES, UserRole } from "./role.model";

export class UserClass extends Document {
  username!: string;
  email!: string;
  password!: string;
  role!: UserRole;
  createdBy!: string;
  updatedBy?: string;
  fech_creacion!: Date;
  fech_modif!: Date;
}

const userSchema = new Schema<UserClass>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },

    role: {
      type: String,
      enum: [...ROLES],
      default: "buyer",
      required: true,
    },

    createdBy: { type: String, default: "system", immutable: true },
    updatedBy: { type: String, default: "system" },
  },
  { timestamps: { createdAt: "fech_creacion", updatedAt: "fech_modif" } }
);

export const UserModel = model<UserClass>("User", userSchema);
