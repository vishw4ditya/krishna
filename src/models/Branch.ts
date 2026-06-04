import mongoose, { InferSchemaType, Schema } from "mongoose";

const BranchSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    branchHeadId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export type BranchDocument = InferSchemaType<typeof BranchSchema> & { _id: mongoose.Types.ObjectId };

export const Branch = mongoose.models.Branch || mongoose.model("Branch", BranchSchema);
