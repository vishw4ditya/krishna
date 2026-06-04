import mongoose, { InferSchemaType, Schema } from "mongoose";

const MessageSchema = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, trim: true },
    image: { type: String },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const ChatSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    branchHeadId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

export type ChatDocument = InferSchemaType<typeof ChatSchema> & { _id: mongoose.Types.ObjectId };

export const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
