import mongoose from 'mongoose';

const inventoryTransactionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['increase', 'decrease'],
      required: true,
    },
    quantityChange: {
      type: Number,
      required: true,
    },
    previousQty: {
      type: Number,
      required: true,
      min: 0,
    },
    newQty: {
      type: Number,
      required: true,
      min: 0,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

inventoryTransactionSchema.index({ product: 1, createdAt: -1 });

export default mongoose.model('InventoryTransaction', inventoryTransactionSchema);
