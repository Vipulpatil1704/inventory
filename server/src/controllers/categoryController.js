import Category from '../models/Category.js';
import Product from '../models/Product.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 }).populate('createdBy', 'name email');
  res.status(200).json({
    success: true,
    data: { categories },
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({
    ...req.body,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Category created',
    data: { category },
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Category updated',
    data: { category },
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    throw new AppError('Cannot delete category with assigned products', 409);
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Category deleted',
  });
});

export default {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
