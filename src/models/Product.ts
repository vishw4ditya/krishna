import mongoose, { InferSchemaType, Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    images: [{ type: String, required: true }],
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: { type: String, required: true, trim: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export type ProductDocument = InferSchemaType<typeof ProductSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
