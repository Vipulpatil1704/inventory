import Product from '../models/Product.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { withStockStatus } from '../utils/stockStatus.js';

const increaseStock = asyncHandler(async (req, res) => {
  const { quantity, note } = req.body;
  const product = await Product.findById(req.params.productId);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const previousQty = product.quantity;
  const newQty = previousQty + quantity;

  product.quantity = newQty;
  await product.save();

  const transaction = await InventoryTransaction.create({
    product: product._id,
    user: req.user._id,
    type: 'increase',
    quantityChange: quantity,
    previousQty,
    newQty,
    note,
  });

  await product.populate('category', 'name');

  res.status(200).json({
    success: true,
    message: 'Stock increased',
    data: {
      product: withStockStatus(product),
      transaction,
    },
  });
});

const decreaseStock = asyncHandler(async (req, res) => {
  const { quantity, note } = req.body;
  const product = await Product.findById(req.params.productId);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (product.quantity < quantity) {
    throw new AppError(
      `Insufficient stock. Available: ${product.quantity}, requested: ${quantity}`,
      400
    );
  }

  const previousQty = product.quantity;
  const newQty = previousQty - quantity;

  product.quantity = newQty;
  await product.save();

  const transaction = await InventoryTransaction.create({
    product: product._id,
    user: req.user._id,
    type: 'decrease',
    quantityChange: -quantity,
    previousQty,
    newQty,
    note,
  });

  await product.populate('category', 'name');

  res.status(200).json({
    success: true,
    message: 'Stock decreased',
    data: {
      product: withStockStatus(product),
      transaction,
    },
  });
});

const getStockHistory = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const product = await Product.findById(req.params.productId);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const skip = (page - 1) * limit;
  const filter = { product: product._id };

  const [transactions, total] = await Promise.all([
    InventoryTransaction.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    InventoryTransaction.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

export default {
  increaseStock,
  decreaseStock,
  getStockHistory,
};
