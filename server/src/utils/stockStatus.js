import env from '../config/env.js';

function getStockStatus(quantity, threshold = env.lowStockThreshold) {
  if (quantity <= 0) return 'Out of Stock';
  if (quantity <= threshold) return 'Low Stock';
  return 'In Stock';
}

function withStockStatus(product, threshold = env.lowStockThreshold) {
  const obj = typeof product.toObject === 'function' ? product.toObject() : { ...product };
  return {
    ...obj,
    status: getStockStatus(obj.quantity, threshold),
  };
}

export { getStockStatus, withStockStatus };
