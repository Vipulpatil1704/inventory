import Product from '../models/Product.js';
import Category from '../models/Category.js';
import asyncHandler from '../utils/asyncHandler.js';
import env from '../config/env.js';
import { withStockStatus } from '../utils/stockStatus.js';

const getStats = asyncHandler(async (req, res) => {
  const threshold = env.lowStockThreshold;

  const [totalProducts, totalCategories, stockAgg, lowStockItems, outOfStockItems] =
    await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Product.aggregate([
        { $group: { _id: null, totalStockQuantity: { $sum: '$quantity' } } },
      ]),
      Product.find({ quantity: { $gt: 0, $lte: threshold } })
        .select('name sku quantity unitPrice category')
        .populate('category', 'name')
        .sort({ quantity: 1 })
        .limit(10),
      Product.find({ quantity: 0 })
        .select('name sku quantity unitPrice category')
        .populate('category', 'name')
        .sort({ name: 1 })
        .limit(10),
    ]);

  const [lowStockCount, outOfStockCount] = await Promise.all([
    Product.countDocuments({ quantity: { $gt: 0, $lte: threshold } }),
    Product.countDocuments({ quantity: 0 }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalProducts,
        totalCategories,
        totalStockQuantity: stockAgg[0]?.totalStockQuantity || 0,
        lowStockItems: lowStockCount,
        outOfStockItems: outOfStockCount,
        lowStockThreshold: threshold,
      },
      lowStockList: lowStockItems.map((p) => withStockStatus(p)),
      outOfStockList: outOfStockItems.map((p) => withStockStatus(p)),
    },
  });
});

export default {
  getStats,
};
