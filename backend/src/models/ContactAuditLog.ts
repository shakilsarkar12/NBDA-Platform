import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export interface ContactAuditLogDocument extends Document {
  viewedByUserId: Types.ObjectId;
  viewedUserId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const contactAuditLogSchema = new Schema<ContactAuditLogDocument>(
  {
    viewedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    viewedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true, collection: "ContactAuditLogs" }
);

contactAuditLogSchema.index({ viewedByUserId: 1, createdAt: -1 });
contactAuditLogSchema.index({ viewedUserId: 1, createdAt: -1 });

export const ContactAuditLog: Model<ContactAuditLogDocument> =
  mongoose.models.ContactAuditLog ??
  mongoose.model<ContactAuditLogDocument>("ContactAuditLog", contactAuditLogSchema);

