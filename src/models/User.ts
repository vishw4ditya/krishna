import mongoose, { InferSchemaType, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    phone: { type: String },
    role: {
      type: String,
      enum: ["super_admin", "branch_head", "customer"],
      default: "customer",
      required: true,
    },
    profileImage: { type: String },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    approvalStatus: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "approved",
    },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
