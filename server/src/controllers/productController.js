import Product from '../models/Product.js';
import Category from '../models/Category.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import env from '../config/env.js';
import { withStockStatus } from '../utils/stockStatus.js';

const getProducts = asyncHandler(async (req, res) => {
  const { q, category, status, sortBy, sortOrder, page, limit } = req.query;
  const filter = {};

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { sku: { $regex: q, $options: 'i' } },
    ];
  }

  if (category) {
    filter.category = category;
  }

  if (status) {
    const threshold = env.lowStockThreshold;
    if (status === 'Out of Stock') {
      filter.quantity = 0;
    } else if (status === 'Low Stock') {
      filter.quantity = { $gt: 0, $lte: threshold };
    } else if (status === 'In Stock') {
      filter.quantity = { $gt: threshold };
    }
  }

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      products: products.map((p) => withStockStatus(p)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name description')
    .populate('createdBy', 'name email');

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { product: withStockStatus(product) },
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const product = await Product.create({
    ...req.body,
    sku: req.body.sku.toUpperCase(),
    createdBy: req.user._id,
  });

  await product.populate('category', 'name');

  if (product.quantity > 0) {
    await InventoryTransaction.create({
      product: product._id,
      user: req.user._id,
      type: 'increase',
      quantityChange: product.quantity,
      previousQty: 0,
      newQty: product.quantity,
      note: 'Initial stock on product creation',
    });
  }

  res.status(201).json({
    success: true,
    message: 'Product created',
    data: { product: withStockStatus(product) },
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  if (req.body.category) {
    const category = await Category.findById(req.body.category);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
  }

  const updates = { ...req.body };
  if (updates.sku) {
    updates.sku = updates.sku.toUpperCase();
  }

  // Quantity changes should go through inventory endpoints to keep history accurate
  delete updates.quantity;

  const product = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).populate('category', 'name');

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Product updated',
    data: { product: withStockStatus(product) },
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  await InventoryTransaction.deleteMany({ product: product._id });
  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product deleted',
  });
});

export default {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
